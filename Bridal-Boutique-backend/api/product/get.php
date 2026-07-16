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

$category_id = intval($_GET['category_id'] ?? 0);
$company_id = intval($_GET['company_id'] ?? 0);
$limit = intval($_GET['limit'] ?? 0);
$id = intval($_GET['id'] ?? 0);

// Build query
$query = "SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_deleted = 0";

// If ID is provided, get single product
if ($id > 0) {
    $query .= " AND p.id = $id";
    $result = mysqli_query($conn, $query);
    if ($row = mysqli_fetch_assoc($result)) {
        echo json_encode(["status" => true, "data" => $row]);
    } else {
        echo json_encode(["status" => false, "message" => "Product not found"]);
    }
    $conn->close();
    exit;
}

// For list of products
if ($company_id > 0) {
    $query .= " AND p.company_id = $company_id";
}
if ($category_id > 0) {
    $query .= " AND p.category_id = $category_id";
}

// Only show active products (active_status = 1)
$query .= " AND p.active_status = 1";

$query .= " ORDER BY p.id DESC";
if ($limit > 0) {
    $query .= " LIMIT $limit";
}

$result = mysqli_query($conn, $query);
$data = [];

while ($row = mysqli_fetch_assoc($result)) {
    if (empty($row['image_gallery_json'])) {
        $row['image_gallery_json'] = json_encode([]);
    }
    // Add status field for compatibility
    $row['status'] = $row['active_status'] == 1 ? 'active' : 'inactive';
    $data[] = $row;
}

echo json_encode(["status" => true, "data" => $data]);

$conn->close();
?>