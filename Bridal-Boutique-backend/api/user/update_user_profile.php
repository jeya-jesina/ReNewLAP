<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include '../../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

$user_id = isset($data['user_id']) ? intval($data['user_id']) : 0;
$name = isset($data['name']) ? trim($data['name']) : '';
$phone = isset($data['phone']) ? trim($data['phone']) : '';
$address = isset($data['address']) ? trim($data['address']) : '';

// Validation
if ($user_id <= 0) {
    echo json_encode([
        'status' => false,
        'message' => 'Invalid user ID'
    ]);
    exit;
}

if (empty($name)) {
    echo json_encode([
        'status' => false,
        'message' => 'Name is required'
    ]);
    exit;
}

// Validate phone number if provided
if (!empty($phone)) {
    $phoneClean = preg_replace('/[^0-9]/', '', $phone);
    if (strlen($phoneClean) !== 10) {
        echo json_encode([
            'status' => false,
            'message' => 'Please enter a valid 10-digit phone number'
        ]);
        exit;
    }
    $phone = $phoneClean;
}

// Check if user exists
$checkUser = mysqli_query($conn, "SELECT id FROM frontend_users WHERE id = $user_id");
if (!$checkUser || mysqli_num_rows($checkUser) == 0) {
    echo json_encode([
        'status' => false,
        'message' => 'User not found'
    ]);
    exit;
}

// Check if phone number already exists for another user
if (!empty($phone)) {
    $checkPhone = mysqli_query($conn, "SELECT id FROM frontend_users WHERE phone = '$phone' AND id != $user_id");
    if ($checkPhone && mysqli_num_rows($checkPhone) > 0) {
        echo json_encode([
            'status' => false,
            'message' => 'Phone number already registered by another user'
        ]);
        exit;
    }
}

// Update user profile
$sql = "UPDATE frontend_users 
        SET 
            name = '" . mysqli_real_escape_string($conn, $name) . "',
            phone = '" . mysqli_real_escape_string($conn, $phone) . "',
            address = '" . mysqli_real_escape_string($conn, $address) . "'
        WHERE id = $user_id";

if (mysqli_query($conn, $sql)) {
    // Get updated user data
    $getUser = mysqli_query($conn, "SELECT id, name, email, phone, address, status, created_at FROM frontend_users WHERE id = $user_id");
    $userData = mysqli_fetch_assoc($getUser);
    
    echo json_encode([
        'status' => true,
        'message' => 'Profile updated successfully',
        'data' => $userData
    ]);
} else {
    echo json_encode([
        'status' => false,
        'message' => 'Failed to update profile: ' . mysqli_error($conn)
    ]);
}
?>