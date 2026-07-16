<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include '../../config/db.php';

$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

if ($user_id <= 0) {
    echo json_encode([
        'status' => false,
        'message' => 'Invalid user ID'
    ]);
    exit;
}

$query = "SELECT id, name, email, phone, address, status, created_at 
          FROM frontend_users 
          WHERE id = $user_id";

$result = mysqli_query($conn, $query);

if ($result && mysqli_num_rows($result) > 0) {
    $user = mysqli_fetch_assoc($result);
    echo json_encode([
        'status' => true,
        'data' => $user
    ]);
} else {
    echo json_encode([
        'status' => false,
        'message' => 'User not found'
    ]);
}
?>