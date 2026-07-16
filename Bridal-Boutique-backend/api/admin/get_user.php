<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

include __DIR__ . '/../../config/db.php';

$user_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($user_id <= 0) {
    echo json_encode([
        'status' => false,
        'message' => 'Invalid user ID'
    ]);
    exit;
}

try {
    $query = "SELECT id, name, email, phone, address, status, created_at 
              FROM frontend_users 
              WHERE id = $user_id";
    
    $result = mysqli_query($conn, $query);
    
    if (!$result || mysqli_num_rows($result) == 0) {
        echo json_encode([
            'status' => false,
            'message' => 'User not found'
        ]);
        exit;
    }
    
    $user = mysqli_fetch_assoc($result);
    
    echo json_encode([
        'status' => true,
        'data' => $user
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'status' => false,
        'message' => 'Error fetching user: ' . $e->getMessage()
    ]);
}
?>