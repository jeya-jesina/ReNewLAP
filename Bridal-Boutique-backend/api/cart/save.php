<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include __DIR__ . '/../../config/db.php';
$data = json_decode(file_get_contents("php://input"), true) ?: [];
$guest_id = trim($data['guest_id'] ?? '');
$user_id = isset($data['user_id']) ? intval($data['user_id']) : 0;
$product_id = intval($data['product_id'] ?? 0);
$quantity = intval($data['quantity'] ?? 1);
$price = floatval($data['price'] ?? 0);
$size = mysqli_real_escape_string($conn, trim($data['size'] ?? ''));

if (!$product_id) {
    echo json_encode(["status" => false, "message" => "Product ID is required"]);
    exit;
}

// If user is logged in, use user_id as identifier
if ($user_id > 0) {
    $identifier = 'user_' . $user_id;
} else if ($guest_id) {
    $identifier = $guest_id;
} else {
    echo json_encode(["status" => false, "message" => "Guest ID or User ID is required"]);
    exit;
}

$existing = mysqli_query($conn, "SELECT id FROM cart WHERE guest_id='$identifier' AND product_id=$product_id AND size='$size'");
if (mysqli_num_rows($existing) > 0) {
    echo json_encode(["status" => false, "message" => "This product is already in your cart."]);
    exit;
}

mysqli_query($conn, "INSERT INTO cart (guest_id, product_id, quantity, price, size) VALUES ('$identifier', $product_id, $quantity, $price, '$size')");

echo json_encode(["status" => true, "message" => "Cart updated"]);
?>