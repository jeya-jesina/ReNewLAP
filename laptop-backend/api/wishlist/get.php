<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include __DIR__ . '/../../config/db.php';
$guest_id = trim($_GET['guest_id'] ?? '');

if (!$guest_id) {
    echo json_encode(["status" => true, "data" => []]);
    exit;
}

$result = mysqli_query($conn, "SELECT w.*, p.product_name, p.image, p.price FROM wishlist w LEFT JOIN products p ON w.product_id = p.id WHERE w.guest_id='$guest_id' ORDER BY w.id DESC");
$data = [];
while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
}

echo json_encode(["status" => true, "data" => $data]);
?>