<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include "../../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);
$userId = intval($data['user_id'] ?? 0);
$currentPassword = trim($data['current_password'] ?? '');
$newPassword = trim($data['new_password'] ?? '');

if (!$userId || !$currentPassword || !$newPassword) {
    echo json_encode(["status" => false, "message" => "User ID, current password, and new password are required"]);
    exit;
}

if (strlen($newPassword) < 6) {
    echo json_encode(["status" => false, "message" => "New password must be at least 6 characters"]);
    exit;
}

// Fetch user
$userQuery = mysqli_query($conn, "SELECT password FROM frontend_users WHERE id = $userId LIMIT 1");
if (!$userQuery || mysqli_num_rows($userQuery) === 0) {
    echo json_encode(["status" => false, "message" => "User not found"]);
    exit;
}

$user = mysqli_fetch_assoc($userQuery);
if (!password_verify($currentPassword, $user['password'])) {
    echo json_encode(["status" => false, "message" => "Current password is incorrect"]);
    exit;
}

// Hash new password and update
$hashed = password_hash($newPassword, PASSWORD_DEFAULT);
$update = mysqli_query($conn, "UPDATE frontend_users SET password = '$hashed' WHERE id = $userId");

if ($update) {
    echo json_encode(["status" => true, "message" => "Password changed successfully"]);
} else {
    echo json_encode(["status" => false, "message" => "Failed to update password: " . mysqli_error($conn)]);
}
?>