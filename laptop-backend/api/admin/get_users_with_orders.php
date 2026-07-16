<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

include __DIR__ . '/../../config/db.php';

try {
    // Fetch users with their orders
    $query = "SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.phone, 
                u.address, 
                u.status, 
                u.created_at,
                COUNT(o.id) as total_orders,
                SUM(o.total) as total_spent,
                MAX(o.created_at) as last_order_date,
                GROUP_CONCAT(
                    JSON_OBJECT(
                        'order_id', o.id,
                        'order_date', o.created_at,
                        'total', o.total,
                        'status', o.status
                    )
                ) as orders
              FROM frontend_users u
              INNER JOIN orders o ON o.guest_id = CONCAT('user_', u.id)
              GROUP BY u.id
              ORDER BY u.id DESC";
    
    $result = mysqli_query($conn, $query);
    
    if (!$result) {
        throw new Exception("Database error: " . mysqli_error($conn));
    }
    
    $users = [];
    while ($row = mysqli_fetch_assoc($result)) {
        // Parse orders JSON
        $orders = [];
        if ($row['orders']) {
            $ordersArray = explode(',', $row['orders']);
            foreach ($ordersArray as $orderJson) {
                $order = json_decode($orderJson, true);
                if ($order) {
                    $orders[] = $order;
                }
            }
        }
        $row['orders'] = $orders;
        $users[] = $row;
    }
    
    echo json_encode([
        'status' => true,
        'data' => $users,
        'total' => count($users)
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'status' => false,
        'message' => 'Error fetching users: ' . $e->getMessage()
    ]);
}
?>