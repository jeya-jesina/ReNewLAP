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
$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$phone = trim($data['phone'] ?? '');
$address = trim($data['address'] ?? '');
$password = trim($data['password'] ?? '');

// Validation
if (!$name || !$email || !$phone || !$address || !$password) {
    echo json_encode(["status" => false, "message" => "All fields are required"]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status" => false, "message" => "Invalid email address"]);
    exit;
}

// Validate phone number (10 digits)
$phoneClean = preg_replace('/[^0-9]/', '', $phone);
if (strlen($phoneClean) !== 10) {
    echo json_encode(["status" => false, "message" => "Please enter a valid 10-digit phone number"]);
    exit;
}

// Check if email already exists
$checkEmail = mysqli_query($conn, "SELECT id FROM frontend_users WHERE email='" . mysqli_real_escape_string($conn, $email) . "' LIMIT 1");
if ($checkEmail && mysqli_num_rows($checkEmail) > 0) {
    echo json_encode(["status" => false, "message" => "Email already registered"]);
    exit;
}

// Check if phone already exists
$checkPhone = mysqli_query($conn, "SELECT id FROM frontend_users WHERE phone='" . mysqli_real_escape_string($conn, $phoneClean) . "' LIMIT 1");
if ($checkPhone && mysqli_num_rows($checkPhone) > 0) {
    echo json_encode(["status" => false, "message" => "Phone number already registered"]);
    exit;
}

// Hash password and insert user
$hashed = password_hash($password, PASSWORD_DEFAULT);
$sql = "INSERT INTO frontend_users (name, email, phone, address, password, status, created_at) 
        VALUES (
            '" . mysqli_real_escape_string($conn, $name) . "', 
            '" . mysqli_real_escape_string($conn, $email) . "', 
            '" . mysqli_real_escape_string($conn, $phoneClean) . "', 
            '" . mysqli_real_escape_string($conn, $address) . "', 
            '$hashed', 
            'active', 
            NOW()
        )";

if (mysqli_query($conn, $sql)) {
    $id = mysqli_insert_id($conn);
    echo json_encode([
        "status" => true, 
        "message" => "Registration successful", 
        "data" => [
            "id" => $id, 
            "name" => $name, 
            "email" => $email,
            "phone" => $phoneClean,
            "address" => $address
        ]
    ]);
} else {
    echo json_encode(["status" => false, "message" => "Registration failed: " . mysqli_error($conn)]);
}
?>