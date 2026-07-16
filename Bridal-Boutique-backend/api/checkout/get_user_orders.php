<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Include database connection
include __DIR__ . '/../../config/db.php';

$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

if ($user_id <= 0) {
    echo json_encode([
        'status' => false,
        'message' => 'Invalid user ID'
    ]);
    exit;
}

try {
    // Get orders for the user with tracking info
    $query = "SELECT 
                o.id, 
                o.guest_id,
                o.customer_name,
                o.email,
                o.mobile,
                o.shipping_address,
                o.total,
                o.payment_status,
                o.created_at,
                o.status,
                o.invoice_id,
                o.tracking_id,
                o.shipped_at,
                o.delivered_at,
                o.tracking_status,
                i.invoice_no,
                i.sub_total,
                i.gst_total,
                i.total_amount as invoice_total,
                i.paid_amount as invoice_paid,
                i.balance_amount,
                i.payment_method,
                i.payment_status as invoice_payment_status
              FROM orders o
              LEFT JOIN invoices i ON o.invoice_id = i.id
              WHERE o.guest_id = 'user_$user_id'
              ORDER BY o.created_at DESC";
    
    $result = mysqli_query($conn, $query);
    
    if (!$result) {
        throw new Exception("Database error: " . mysqli_error($conn));
    }
    
    $orders = [];
    while ($row = mysqli_fetch_assoc($result)) {
        // Get order items
        $itemsQuery = "SELECT 
                        oi.product_id,
                        oi.product_name,
                        oi.quantity,
                        oi.price,
                        oi.size,
                        COALESCE(NULLIF(oi.gst_percentage, 0), p.gst_percentage, 0) AS gst_percentage
                      FROM order_items oi
                      LEFT JOIN products p ON oi.product_id = p.id
                      WHERE oi.order_id = " . intval($row['id']);
        $itemsResult = mysqli_query($conn, $itemsQuery);
        $items = [];
        
        while ($item = mysqli_fetch_assoc($itemsResult)) {
            // Get product image from products table
            $image = null;
            $imgQuery = "SELECT image, image_gallery_json FROM products WHERE id = " . intval($item['product_id']);
            $imgResult = mysqli_query($conn, $imgQuery);
            if ($imgData = mysqli_fetch_assoc($imgResult)) {
                if (!empty($imgData['image'])) {
                    $image = $imgData['image'];
                } else if (!empty($imgData['image_gallery_json'])) {
                    $gallery = json_decode($imgData['image_gallery_json'], true);
                    $image = !empty($gallery) && is_array($gallery) ? $gallery[0] : null;
                }
            }
            
            $item['image'] = $image;
            $item['total'] = floatval($item['price']) * intval($item['quantity']);
            $items[] = $item;
        }
        
        $row['items'] = $items;
        $row['status'] = !empty($row['status']) ? $row['status'] : 'pending';
        $orders[] = $row;
    }
    
    echo json_encode([
        'status' => true,
        'data' => $orders
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'status' => false,
        'message' => 'Error fetching orders: ' . $e->getMessage()
    ]);
}
?>