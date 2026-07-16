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
$product_id = intval($data['product_id'] ?? 0);
$size = mysqli_real_escape_string($conn, trim($data['size'] ?? ''));

if (!$guest_id || !$product_id) {
    echo json_encode(["status" => false, "message" => "Guest ID and product are required"]);
    exit;
}

$existing = mysqli_query($conn, "SELECT id FROM wishlist WHERE guest_id='$guest_id' AND product_id=$product_id AND size='$size'");
if (mysqli_num_rows($existing) > 0) {
    echo json_encode(["status" => false, "message" => "This product is already in your wishlist."]);
    exit;
}

mysqli_query($conn, "INSERT INTO wishlist (guest_id, product_id, size) VALUES ('$guest_id', $product_id, '$size')");

echo json_encode(["status" => true, "message" => "Wishlist updated"]);
?>