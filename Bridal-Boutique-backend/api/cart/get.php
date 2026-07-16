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

$result = mysqli_query($conn, "SELECT c.*, p.product_name, p.image, p.price, p.gst_percentage FROM cart c LEFT JOIN products p ON c.product_id = p.id WHERE c.guest_id='$guest_id' ORDER BY c.id DESC");
$data = [];
while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
}

echo json_encode(["status" => true, "data" => $data]);
?>