<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

include __DIR__ . '/../../config/db.php';

$order_id = isset($_GET['order_id']) ? intval($_GET['order_id']) : 0;

if ($order_id <= 0) {
    echo json_encode([
        'status' => false,
        'message' => 'Invalid order ID'
    ]);
    exit;
}

try {
    // Get order details
    $orderQuery = "SELECT 
                    o.id, 
                    o.guest_id,
                    o.customer_name,
                    o.email,
                    o.mobile,
                    o.shipping_address,
                    o.total,
                    o.payment_status,
                    o.created_at
                  FROM orders o
                  WHERE o.id = $order_id";
    
    $orderResult = mysqli_query($conn, $orderQuery);
    
    if (!$orderResult || mysqli_num_rows($orderResult) == 0) {
        echo json_encode([
            'status' => false,
            'message' => 'Order not found'
        ]);
        exit;
    }
    
    $order = mysqli_fetch_assoc($orderResult);
    
    // Get order items
    $itemsQuery = "SELECT 
                    oi.product_id,
                    oi.product_name,
                    oi.quantity,
                    oi.price,
                    oi.size
                  FROM order_items oi
                  WHERE oi.order_id = $order_id";
    
    $itemsResult = mysqli_query($conn, $itemsQuery);
    $items = [];
    
    while ($item = mysqli_fetch_assoc($itemsResult)) {
        // Get product image using 'image' column
        $image = null;
        $imgQuery = "SELECT image, image_gallery_json FROM products WHERE id = " . $item['product_id'];
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
        $item['total'] = $item['price'] * $item['quantity'];
        $items[] = $item;
    }
    
    $order['items'] = $items;
    $order['status'] = 'pending';
    
    echo json_encode([
        'status' => true,
        'data' => $order
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'status' => false,
        'message' => 'Error fetching order details: ' . $e->getMessage()
    ]);
}
?>