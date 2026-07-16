<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

include __DIR__ . '/../../config/db.php';

$sql = "SELECT id, banner_title, title, description, image, category_id, category_name, status, created_at FROM banners ORDER BY id DESC";
$result = mysqli_query($conn, $sql);

$items = [];
if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || ($_SERVER['SERVER_PORT'] ?? '') == 443 ? 'https' : 'http';
        $apiBaseUrl = $scheme . '://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['SCRIPT_NAME'], 3);
        $row['image'] = rtrim($apiBaseUrl, '/') . '/' . ltrim($row['image'], '/');
        $items[] = $row;
    }
}

echo json_encode(["success" => true, "data" => $items]);

mysqli_close($conn);

?>
