<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

include __DIR__ . '/../../config/db.php';

$id = intval($_POST['id'] ?? 0);
if ($id <= 0) {
    echo json_encode(["success" => false, "message" => "Invalid banner id."]);
    exit;
}

$stmt = mysqli_prepare($conn, "UPDATE banners SET status='inactive' WHERE id=?" );
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Database prepare failed."]);
    exit;
}

mysqli_stmt_bind_param($stmt, "i", $id);
$executed = mysqli_stmt_execute($stmt);
mysqli_stmt_close($stmt);

if (!$executed) {
    echo json_encode(["success" => false, "message" => "Banner delete failed."]);
    exit;
}

echo json_encode(["success" => true, "message" => "Banner deleted successfully."]);
