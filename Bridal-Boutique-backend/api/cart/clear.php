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

$guest_id = trim($_GET['guest_id'] ?? '');

if (!$guest_id) {
    echo json_encode(["status" => false, "message" => "Guest ID required"]);
    exit;
}

// Delete all cart items for this guest
$query = "DELETE FROM cart WHERE guest_id = '$guest_id'";
$result = mysqli_query($conn, $query);

if ($result) {
    echo json_encode(["status" => true, "message" => "Cart cleared successfully"]);
} else {
    echo json_encode(["status" => false, "message" => "Failed to clear cart: " . mysqli_error($conn)]);
}
?>