<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Use absolute path
include __DIR__ . '/../../config/db.php';

// Read token from GET or POST
$token = $_GET['token'] ?? null;
if (!$token) {
    $data = json_decode(file_get_contents("php://input"), true);
    $token = $data['token'] ?? null;
}

// For GET requests – just return a generic response
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($token) {
        echo json_encode(["status" => true, "message" => "Token provided. Send POST request to reset password."]);
    } else {
        echo json_encode(["status" => false, "message" => "Token is required"]);
    }
    exit;
}

// Only POST allowed
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => false, "message" => "Method not allowed"]);
    exit;
}

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);
$token = trim($data['token'] ?? '');
$password = trim($data['password'] ?? '');
$confirmPassword = trim($data['confirm_password'] ?? '');

// Validation
if (!$token || !$password || !$confirmPassword) {
    echo json_encode(["status" => false, "message" => "Token, password, and confirm_password are required"]);
    exit;
}
if ($password !== $confirmPassword) {
    echo json_encode(["status" => false, "message" => "Passwords do not match"]);
    exit;
}
if (strlen($password) < 6) {
    echo json_encode(["status" => false, "message" => "Password must be at least 6 characters"]);
    exit;
}

// Look up the token
$tokenEscaped = mysqli_real_escape_string($conn, $token);
$resetQuery = mysqli_query($conn, "SELECT email, expiry FROM password_resets WHERE token='$tokenEscaped' LIMIT 1");

if (!$resetQuery || mysqli_num_rows($resetQuery) === 0) {
    // Token not found – give a clear message
    echo json_encode(["status" => false, "message" => "Invalid token. Please request a new password reset link."]);
    exit;
}

$resetRow = mysqli_fetch_assoc($resetQuery);
$email = $resetRow['email'];
$expiry = $resetRow['expiry'];

// Check expiration
if (strtotime($expiry) < time()) {
    // Delete expired token
    mysqli_query($conn, "DELETE FROM password_resets WHERE token='$tokenEscaped'");
    echo json_encode(["status" => false, "message" => "Token has expired. Please request a new password reset link."]);
    exit;
}

// Update the user's password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);
$update = mysqli_query($conn, "UPDATE frontend_users SET password='$hashedPassword' WHERE email='" . mysqli_real_escape_string($conn, $email) . "'");

if (!$update) {
    echo json_encode(["status" => false, "message" => "Failed to reset password: " . mysqli_error($conn)]);
    exit;
}

// Delete the used token
mysqli_query($conn, "DELETE FROM password_resets WHERE token='$tokenEscaped'");

// Success
echo json_encode(["status" => true, "message" => "Password has been reset successfully"]);
?>