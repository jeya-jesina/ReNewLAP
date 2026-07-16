<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include __DIR__ . '/../../config/db.php';
$data = json_decode(file_get_contents("php://input"), true) ?: [];

// Get data - support both guest and logged-in users
$user_id = isset($data['user_id']) ? intval($data['user_id']) : 0;
$guest_id = trim($data['guest_id'] ?? '');
$customer_name = trim($data['customer_name'] ?? '');
$email = trim($data['email'] ?? '');
$mobile = trim($data['mobile'] ?? '');
$shipping_address = trim($data['shipping_address'] ?? '');
$items = $data['items'] ?? [];
$total = floatval($data['total'] ?? 0);

// Validation
if (!$customer_name || !$email || !$items || count($items) == 0) {
    echo json_encode(["status" => false, "message" => "Missing required checkout fields"]);
    exit;
}

// If user is logged in, get user details
if ($user_id > 0) {
    $checkUser = mysqli_query($conn, "SELECT id, name, email, phone, address FROM frontend_users WHERE id = $user_id");
    if ($userData = mysqli_fetch_assoc($checkUser)) {
        if (empty($customer_name)) $customer_name = $userData['name'];
        if (empty($email)) $email = $userData['email'];
        if (empty($mobile)) $mobile = $userData['phone'];
        if (empty($shipping_address)) $shipping_address = $userData['address'];
    }
}

// Escape strings for SQL
$guest_id = mysqli_real_escape_string($conn, $guest_id);
$customer_name = mysqli_real_escape_string($conn, $customer_name);
$email = mysqli_real_escape_string($conn, $email);
$mobile = mysqli_real_escape_string($conn, $mobile);
$shipping_address = mysqli_real_escape_string($conn, $shipping_address);

// Begin transaction
mysqli_begin_transaction($conn);

try {
    // Insert order
    $insertOrder = "INSERT INTO orders (
        guest_id, 
        customer_name, 
        email, 
        mobile, 
        shipping_address, 
        total, 
        payment_status,
        created_at
    ) VALUES (
        '" . ($user_id > 0 ? 'user_' . $user_id : $guest_id) . "',
        '$customer_name', 
        '$email', 
        '$mobile', 
        '$shipping_address', 
        $total, 
        'paid',
        NOW()
    )";
    
    if (!mysqli_query($conn, $insertOrder)) {
        throw new Exception("Failed to create order: " . mysqli_error($conn));
    }
    
    $order_id = mysqli_insert_id($conn);
    
    // Insert order items
    foreach ($items as $item) {
        $product_id = intval($item['product_id'] ?? 0);
        $product_name = mysqli_real_escape_string($conn, trim($item['product_name'] ?? ''));
        $price = floatval($item['price'] ?? 0);
        $quantity = intval($item['quantity'] ?? 1);
        $size = mysqli_real_escape_string($conn, trim($item['size'] ?? ''));
        
        if ($product_id > 0 && $product_name) {
            $itemQuery = "INSERT INTO order_items (
                order_id, 
                product_id, 
                product_name, 
                price, 
                quantity,
                size,
                created_at
            ) VALUES (
                $order_id, 
                $product_id, 
                '$product_name', 
                $price, 
                $quantity,
                '$size',
                NOW()
            )";
            
            if (!mysqli_query($conn, $itemQuery)) {
                throw new Exception("Failed to add order item: " . mysqli_error($conn));
            }
        }
    }
    
    // Clear cart - Check if user_id column exists
    if ($user_id > 0) {
        // Check if user_id column exists in cart table
        $checkColumn = mysqli_query($conn, "SHOW COLUMNS FROM cart LIKE 'user_id'");
        if (mysqli_num_rows($checkColumn) > 0) {
            // If user_id column exists, delete by user_id
            mysqli_query($conn, "DELETE FROM cart WHERE user_id = $user_id");
        } else {
            // If user_id doesn't exist, use guest_id
            $guest_id_for_cart = 'user_' . $user_id;
            mysqli_query($conn, "DELETE FROM cart WHERE guest_id = '$guest_id_for_cart'");
        }
    } else {
        // Guest user - delete by guest_id
        mysqli_query($conn, "DELETE FROM cart WHERE guest_id = '$guest_id'");
    }
    
    // Commit transaction
    mysqli_commit($conn);
    
    // Send order confirmation email (with error handling)
    try {
        sendOrderEmail($email, $customer_name, $order_id, $total, $shipping_address, $items);
    } catch (Exception $e) {
        // Email failure is not fatal for checkout
        error_log("Email sending failed: " . $e->getMessage());
    }
    
    echo json_encode([
        "status" => true, 
        "message" => "Order placed successfully", 
        "order_id" => $order_id
    ]);
    
} catch (Exception $e) {
    mysqli_rollback($conn);
    echo json_encode([
        "status" => false, 
        "message" => "Failed to place order: " . $e->getMessage()
    ]);
}

// Function to send email
function sendOrderEmail($email, $customer_name, $order_id, $total, $shipping_address, $items) {
    // Check if PHPMailer files exist
    $phpmailer_path = __DIR__ . '/../../PHPMailer/src/PHPMailer.php';
    $smtp_path = __DIR__ . '/../../PHPMailer/src/SMTP.php';
    $exception_path = __DIR__ . '/../../PHPMailer/src/Exception.php';
    
    // If PHPMailer doesn't exist, use simple mail function
    if (!file_exists($phpmailer_path)) {
        sendSimpleEmail($email, $customer_name, $order_id, $total, $shipping_address, $items);
        return;
    }
    
    try {
        require_once $phpmailer_path;
        require_once $smtp_path;
        require_once $exception_path;
        
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        $mail->isMail();
        $mail->setFrom('no-reply@bridal-boutique.local', 'Bridal Boutique');
        $mail->addAddress($email, $customer_name);
        $mail->isHTML(true);
        $mail->Subject = 'Order Confirmation - #' . $order_id;
        
        // Build items list
        $itemsHtml = '';
        foreach ($items as $item) {
            $productName = htmlspecialchars($item['product_name'] ?? '');
            $qty = intval($item['quantity'] ?? 1);
            $price = floatval($item['price'] ?? 0);
            $totalPrice = $price * $qty;
            $itemsHtml .= "<tr>
                <td style='padding: 8px; border-bottom: 1px solid #ddd;'>{$productName}</td>
                <td style='padding: 8px; border-bottom: 1px solid #ddd; text-align: center;'>{$qty}</td>
                <td style='padding: 8px; border-bottom: 1px solid #ddd; text-align: right;'>₹" . number_format($price, 2) . "</td>
                <td style='padding: 8px; border-bottom: 1px solid #ddd; text-align: right;'>₹" . number_format($totalPrice, 2) . "</td>
            </tr>";
        }
        
        $mail->Body = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
            <h2 style='color: #a97c50;'>Order Confirmation</h2>
            <p>Dear " . htmlspecialchars($customer_name) . ",</p>
            <p>Thank you for your order! Your payment has been received successfully.</p>
            
            <div style='background-color: #f8f7f2; padding: 15px; border-radius: 8px; margin: 20px 0;'>
                <p><strong>Order Number:</strong> #{$order_id}</p>
                <p><strong>Order Date:</strong> " . date('F j, Y, g:i a') . "</p>
                <p><strong>Order Status:</strong> Pending</p>
            </div>
            
            <h3 style='color: #a97c50;'>Order Items</h3>
            <table style='width: 100%; border-collapse: collapse; margin: 10px 0;'>
                <thead>
                    <tr style='background-color: #f8f7f2;'>
                        <th style='padding: 10px; text-align: left;'>Product</th>
                        <th style='padding: 10px; text-align: center;'>Qty</th>
                        <th style='padding: 10px; text-align: right;'>Price</th>
                        <th style='padding: 10px; text-align: right;'>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {$itemsHtml}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan='3' style='padding: 10px; text-align: right; font-weight: bold;'>Grand Total:</td>
                        <td style='padding: 10px; text-align: right; font-weight: bold; color: #a97c50;'>₹" . number_format($total, 2) . "</td>
                    </tr>
                </tfoot>
            </table>
            
            <div style='margin: 20px 0;'>
                <h4 style='color: #a97c50;'>Shipping Address</h4>
                <p style='background-color: #f8f7f2; padding: 10px; border-radius: 4px;'>" . nl2br(htmlspecialchars($shipping_address)) . "</p>
            </div>
            
            <p>We will dispatch your order within 2-3 business days. You will receive another email once your order ships.</p>
            
            <p style='margin-top: 30px;'>Regards,<br><strong>Bridal Boutique Team</strong></p>
        </div>
        ";
        
        $mail->send();
    } catch (Exception $e) {
        // If PHPMailer fails, try simple mail
        error_log("PHPMailer failed: " . $e->getMessage());
        sendSimpleEmail($email, $customer_name, $order_id, $total, $shipping_address, $items);
    }
}

// Fallback function using PHP's mail() function
function sendSimpleEmail($email, $customer_name, $order_id, $total, $shipping_address, $items) {
    $subject = "Order Confirmation - #" . $order_id;
    
    $itemsHtml = '';
    foreach ($items as $item) {
        $productName = htmlspecialchars($item['product_name'] ?? '');
        $qty = intval($item['quantity'] ?? 1);
        $price = floatval($item['price'] ?? 0);
        $totalPrice = $price * $qty;
        $itemsHtml .= "<tr>
            <td style='padding: 8px; border-bottom: 1px solid #ddd;'>{$productName}</td>
            <td style='padding: 8px; border-bottom: 1px solid #ddd; text-align: center;'>{$qty}</td>
            <td style='padding: 8px; border-bottom: 1px solid #ddd; text-align: right;'>₹" . number_format($price, 2) . "</td>
            <td style='padding: 8px; border-bottom: 1px solid #ddd; text-align: right;'>₹" . number_format($totalPrice, 2) . "</td>
        </tr>";
    }
    
    $message = "
    <html>
    <head>
        <title>Order Confirmation</title>
    </head>
    <body>
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
            <h2 style='color: #a97c50;'>Order Confirmation</h2>
            <p>Dear " . htmlspecialchars($customer_name) . ",</p>
            <p>Thank you for your order! Your payment has been received successfully.</p>
            
            <div style='background-color: #f8f7f2; padding: 15px; border-radius: 8px; margin: 20px 0;'>
                <p><strong>Order Number:</strong> #{$order_id}</p>
                <p><strong>Order Date:</strong> " . date('F j, Y, g:i a') . "</p>
                <p><strong>Order Status:</strong> Pending</p>
            </div>
            
            <h3 style='color: #a97c50;'>Order Items</h3>
            <table style='width: 100%; border-collapse: collapse; margin: 10px 0;'>
                <thead>
                    <tr style='background-color: #f8f7f2;'>
                        <th style='padding: 10px; text-align: left;'>Product</th>
                        <th style='padding: 10px; text-align: center;'>Qty</th>
                        <th style='padding: 10px; text-align: right;'>Price</th>
                        <th style='padding: 10px; text-align: right;'>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {$itemsHtml}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan='3' style='padding: 10px; text-align: right; font-weight: bold;'>Grand Total:</td>
                        <td style='padding: 10px; text-align: right; font-weight: bold; color: #a97c50;'>₹" . number_format($total, 2) . "</td>
                    </tr>
                </tfoot>
            </table>
            
            <div style='margin: 20px 0;'>
                <h4 style='color: #a97c50;'>Shipping Address</h4>
                <p style='background-color: #f8f7f2; padding: 10px; border-radius: 4px;'>" . nl2br(htmlspecialchars($shipping_address)) . "</p>
            </div>
            
            <p>We will dispatch your order within 2-3 business days. You will receive another email once your order ships.</p>
            
            <p style='margin-top: 30px;'>Regards,<br><strong>Bridal Boutique Team</strong></p>
        </div>
    </body>
    </html>
    ";
    
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: no-reply@bridal-boutique.local" . "\r\n";
    
    @mail($email, $subject, $message, $headers);
}
?>