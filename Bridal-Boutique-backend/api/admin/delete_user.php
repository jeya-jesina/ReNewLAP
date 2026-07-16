<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include __DIR__ . '/../../config/db.php';

$user_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($user_id <= 0) {
    echo json_encode([
        'status' => false,
        'message' => 'Invalid user ID'
    ]);
    exit;
}

// Check if user exists
$checkQuery = "SELECT id FROM frontend_users WHERE id = $user_id";
$checkResult = mysqli_query($conn, $checkQuery);

if (!$checkResult || mysqli_num_rows($checkResult) == 0) {
    echo json_encode([
        'status' => false,
        'message' => 'User not found'
    ]);
    exit;
}

// Delete user
$sql = "DELETE FROM frontend_users WHERE id = $user_id";

if (mysqli_query($conn, $sql)) {
    echo json_encode([
        'status' => true,
        'message' => 'User deleted successfully'
    ]);
} else {
    echo json_encode([
        'status' => false,
        'message' => 'Failed to delete user: ' . mysqli_error($conn)
    ]);
}
?>