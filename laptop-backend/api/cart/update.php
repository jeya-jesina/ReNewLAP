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
$id = intval($data['id'] ?? 0);
$quantity = intval($data['quantity'] ?? 1);

if (!$id) {
    echo json_encode(["status" => false, "message" => "Cart item id required"]);
    exit;
}

if ($quantity <= 0) {
    mysqli_query($conn, "DELETE FROM cart WHERE id=$id");
    echo json_encode(["status" => true, "message" => "Item removed"]);
    exit;
}

$result = mysqli_query($conn, "UPDATE cart SET quantity=$quantity WHERE id=$id");
if (!$result) {
    echo json_encode(["status" => false, "message" => "Unable to update cart item"]);
    exit;
}

echo json_encode(["status" => true, "message" => "Cart updated"]);
?>