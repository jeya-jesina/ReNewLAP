<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include __DIR__ . '/../../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

$user_id = intval($data['id'] ?? 0);
$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$phone = trim($data['phone'] ?? '');
$address = trim($data['address'] ?? '');
$status = trim($data['status'] ?? 'active');

if ($user_id <= 0) {
    echo json_encode([
        'status' => false,
        'message' => 'Invalid user ID'
    ]);
    exit;
}

if (!$name || !$email) {
    echo json_encode([
        'status' => false,
        'message' => 'Name and email are required'
    ]);
    exit;
}

// Validate phone
$phoneClean = preg_replace('/[^0-9]/', '', $phone);
if (!empty($phoneClean) && strlen($phoneClean) !== 10) {
    echo json_encode([
        'status' => false,
        'message' => 'Please enter a valid 10-digit phone number'
    ]);
    exit;
}

// Check if email already exists for another user
$checkEmail = mysqli_query($conn, "SELECT id FROM frontend_users WHERE email='" . mysqli_real_escape_string($conn, $email) . "' AND id != $user_id LIMIT 1");
if ($checkEmail && mysqli_num_rows($checkEmail) > 0) {
    echo json_encode([
        'status' => false,
        'message' => 'Email already registered by another user'
    ]);
    exit;
}

// Check if phone already exists for another user
if (!empty($phoneClean)) {
    $checkPhone = mysqli_query($conn, "SELECT id FROM frontend_users WHERE phone='" . mysqli_real_escape_string($conn, $phoneClean) . "' AND id != $user_id LIMIT 1");
    if ($checkPhone && mysqli_num_rows($checkPhone) > 0) {
        echo json_encode([
            'status' => false,
            'message' => 'Phone number already registered by another user'
        ]);
        exit;
    }
}

$sql = "UPDATE frontend_users SET 
            name = '" . mysqli_real_escape_string($conn, $name) . "',
            email = '" . mysqli_real_escape_string($conn, $email) . "',
            phone = '" . mysqli_real_escape_string($conn, $phoneClean) . "',
            address = '" . mysqli_real_escape_string($conn, $address) . "',
            status = '" . mysqli_real_escape_string($conn, $status) . "'
        WHERE id = $user_id";

if (mysqli_query($conn, $sql)) {
    // Get updated user data
    $getUser = mysqli_query($conn, "SELECT id, name, email, phone, address, status, created_at FROM frontend_users WHERE id = $user_id");
    $userData = mysqli_fetch_assoc($getUser);
    
    echo json_encode([
        'status' => true,
        'message' => 'User updated successfully',
        'data' => $userData
    ]);
} else {
    echo json_encode([
        'status' => false,
        'message' => 'Failed to update user: ' . mysqli_error($conn)
    ]);
}
?>