<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include __DIR__ . '/../../config/db.php';
$id = intval($_GET['id'] ?? 0);
if (!$id) {
    echo json_encode(["status" => false, "message" => "Wishlist id required"]);
    exit;
}

mysqli_query($conn, "DELETE FROM wishlist WHERE id=$id");
echo json_encode(["status" => true, "message" => "Item removed"]);
?>