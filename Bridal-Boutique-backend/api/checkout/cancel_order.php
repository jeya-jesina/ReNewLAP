<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

include __DIR__ . '/../../config/db.php';

$data = json_decode(file_get_contents('php://input'), true);

$order_id = isset($data['order_id']) ? intval($data['order_id']) : 0;
$user_id = isset($data['user_id']) ? intval($data['user_id']) : 0;

if ($order_id <= 0 || $user_id <= 0) {
    echo json_encode([
        'status' => false,
        'message' => 'Order ID and User ID are required'
    ]);
    exit;
}

try {
    // Check if order belongs to user
    $checkQuery = "SELECT id FROM orders 
                   WHERE id = $order_id AND guest_id = 'user_$user_id'";
    
    $checkResult = mysqli_query($conn, $checkQuery);
    
    if (mysqli_num_rows($checkResult) == 0) {
        echo json_encode([
            'status' => false,
            'message' => 'Order not found or does not belong to this user'
        ]);
        exit;
    }
    
    // Delete the order (or you could update status if you add status column)
    $deleteQuery = "DELETE FROM orders WHERE id = $order_id";
    
    if (mysqli_query($conn, $deleteQuery)) {
        // Also delete order items
        mysqli_query($conn, "DELETE FROM order_items WHERE order_id = $order_id");
        
        echo json_encode([
            'status' => true,
            'message' => 'Order cancelled successfully'
        ]);
    } else {
        echo json_encode([
            'status' => false,
            'message' => 'Failed to cancel order'
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'status' => false,
        'message' => 'Error cancelling order: ' . $e->getMessage()
    ]);
}
?>