<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Load PHPMailer
require_once __DIR__ . '/../../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

include __DIR__ . '/../../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);
$user_id = intval($data['user_id'] ?? 0);

if ($user_id <= 0) {
    echo json_encode([
        'status' => false,
        'message' => 'Invalid user ID'
    ]);
    exit;
}

function generateCourierId() {
    $prefix = "BB";
    $date = date('ymd');
    $random = str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT);
    return $prefix . $date . $random;
}

function sendEmail($to, $name, $order_id, $courier_id) {
    try {
        $mail = new PHPMailer(true);
        
        // Server settings
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'majesticjesi@gmail.com';
        $mail->Password   = 'fpws pgxt cyfb obvt';  // App Password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;
        
        // Disable SSL verification (for local testing)
        $mail->SMTPOptions = array(
            'ssl' => array(
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            )
        );
        
        // Recipients
        $mail->setFrom('majesticjesi@gmail.com', 'Bridal Boutique');
        $mail->addAddress($to, $name);
        $mail->addReplyTo('majesticjesi@gmail.com', 'Support');
        
        // Content
        $mail->isHTML(true);
        $mail->Subject = "Your Order #$order_id Has Been Shipped! 🚚";
        
        $mail->Body = "
        <html>
        <head>
            <meta charset='UTF-8'>
            <title>Order Shipped</title>
            <style>
                body { font-family: Arial, sans-serif; background: #f8f7f2; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #a97c50, #8a6540); color: white; padding: 30px; text-align: center; }
                .header h1 { margin: 0; font-size: 28px; }
                .content { padding: 30px; }
                .tracking-box { background: #f8f7f2; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px dashed #a97c50; }
                .tracking-id { font-size: 28px; font-weight: bold; color: #a97c50; letter-spacing: 2px; font-family: monospace; }
                .btn { background: #a97c50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; }
                .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; border-top: 1px solid #eee; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>🎉 Order Shipped!</h1>
                    <p style='margin: 10px 0 0; opacity: 0.9;'>Your order is on its way</p>
                </div>
                <div class='content'>
                    <p>Dear <strong>" . htmlspecialchars($name) . "</strong>,</p>
                    <p>Great news! Your order <strong>#$order_id</strong> has been shipped.</p>
                    
                    <div class='tracking-box'>
                        <p style='margin: 0 0 10px; color: #666; font-size: 14px;'>📦 Your Courier Tracking ID</p>
                        <div class='tracking-id'>" . htmlspecialchars($courier_id) . "</div>
                      
                    </div>
                    
                   
                    
                    <p style='margin-top: 20px;'>
                        Thanks for shopping with us!<br>
                        <strong>Padmavathi Collection</strong>
                    </p>
                </div>
                <div class='footer'>
                    <p>© " . date('Y') . " Bridal Boutique. All rights reserved.</p>
                    <p style='margin-top: 5px;'>This is an automated email. Please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
        ";
        
        $mail->send();
        return true;
        
    } catch (Exception $e) {
        error_log("Email failed: " . $mail->ErrorInfo);
        return false;
    }
}

try {
    // Get user details
    $userQuery = "SELECT * FROM frontend_users WHERE id = $user_id";
    $userResult = mysqli_query($conn, $userQuery);
    
    if (!$userResult || mysqli_num_rows($userResult) == 0) {
        echo json_encode([
            'status' => false,
            'message' => 'User not found'
        ]);
        exit;
    }
    
    $user = mysqli_fetch_assoc($userResult);
    
    // Get user's latest order
    $guestId = 'user_' . $user_id;
    $orderQuery = "SELECT * FROM orders 
                   WHERE guest_id = '$guestId' 
                   AND status NOT IN ('delivered', 'cancelled')
                   ORDER BY id DESC LIMIT 1";
    
    $orderResult = mysqli_query($conn, $orderQuery);
    
    if (!$orderResult || mysqli_num_rows($orderResult) == 0) {
        echo json_encode([
            'status' => false,
            'message' => 'No active orders found for this customer'
        ]);
        exit;
    }
    
    $order = mysqli_fetch_assoc($orderResult);
    
    // Generate courier ID
    $courier_id = generateCourierId();
    $shipped_at = date('Y-m-d H:i:s');
    
    // Update order
    $updateQuery = "UPDATE orders SET 
                        tracking_id = '$courier_id',
                        status = 'shipped',
                        shipped_at = '$shipped_at'
                    WHERE id = " . $order['id'];
    
    if (!mysqli_query($conn, $updateQuery)) {
        throw new Exception("Failed to update order: " . mysqli_error($conn));
    }
    
    // Send email
    $emailSent = false;
    $userEmail = $user['email'] ?? '';
    $userName = $user['name'] ?? 'Customer';
    
    if (!empty($userEmail)) {
        $emailSent = sendEmail($userEmail, $userName, $order['id'], $courier_id);
    }
    
    echo json_encode([
        'status' => true,
        'message' => $emailSent ? 'Order shipped and email sent successfully!' : 'Order shipped but email sending failed.',
        'data' => [
            'courier_id' => $courier_id,
            'order_id' => $order['id'],
            'customer_email' => $userEmail,
            'customer_name' => $userName,
            'shipped_at' => $shipped_at,
            'email_sent' => $emailSent
        ]
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'status' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>