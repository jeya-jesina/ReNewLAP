<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include __DIR__ . '/../../config/db.php';

$data = json_decode(file_get_contents("php://input"), true) ?: [];
$company_id = intval($_GET['company_id'] ?? $data['company_id'] ?? $_POST['company_id'] ?? 0);

$query = "SELECT * FROM categories WHERE is_deleted=0 AND status='active'";
if ($company_id > 0) {
    $query .= " AND company_id=$company_id";
}
$query .= " ORDER BY id DESC";

$result = mysqli_query($conn, $query);
$data = [];

while ($row = mysqli_fetch_assoc($result)) {
    if (!isset($row['banner_image'])) {
        $row['banner_image'] = '';
    }
    $data[] = $row;
}

echo json_encode(["status" => true, "data" => $data]);
?>