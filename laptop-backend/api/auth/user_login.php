<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include "../../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);
$email = trim($data['email'] ?? '');
$password = trim($data['password'] ?? '');

if (!$email || !$password) {
    echo json_encode(["status" => false, "message" => "Email and password are required"]);
    exit;
}

$user_q = mysqli_query($conn, "SELECT * FROM frontend_users WHERE email='" . mysqli_real_escape_string($conn, $email) . "' LIMIT 1");
$user = $user_q ? mysqli_fetch_assoc($user_q) : null;

if (!$user) {
    echo json_encode(["status" => false, "message" => "Invalid email or password"]);
    exit;
}

if ($user['status'] !== 'active') {
    echo json_encode(["status" => false, "message" => "Your account is inactive"]);
    exit;
}

if (!password_verify($password, $user['password'])) {
    echo json_encode(["status" => false, "message" => "Invalid email or password"]);
    exit;
}

echo json_encode([
    "status" => true, 
    "message" => "Login successful", 
    "data" => [
        "id" => $user['id'], 
        "name" => $user['name'], 
        "email" => $user['email'],
        "phone" => $user['phone'],
        "address" => $user['address']
    ]
]);
?>