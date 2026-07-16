<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");

include("../../config/db.php");

$data = json_decode(file_get_contents("php://input"), true);

$product_id = isset($data["product_id"]) ? (int)$data["product_id"] : 0;

if ($product_id <= 0) {
    echo json_encode([
        "status" => false,
        "message" => "Invalid Product ID"
    ]);
    exit;
}

$stmt = $conn->prepare("UPDATE products SET view_count = view_count + 1 WHERE id = ?");
$stmt->bind_param("i", $product_id);

if ($stmt->execute()) {
    echo json_encode([
        "status" => true,
        "message" => "View count updated"
    ]);
} else {
    echo json_encode([
        "status" => false,
        "message" => "Database update failed"
    ]);
}

$stmt->close();
$conn->close();
?>