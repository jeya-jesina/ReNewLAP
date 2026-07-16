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

// Get request data
$input = json_decode(file_get_contents("php://input"), true);

// If no JSON, use GET parameters
if (!$input) {
    $input = $_GET;
}

$category_id = intval($input['category_id'] ?? 0);
$company_id = intval($input['company_id'] ?? 0);
$limit = intval($input['limit'] ?? 20);
$offset = intval($input['offset'] ?? 0);
$sort_by = $input['sort_by'] ?? 'newest';
$search = trim($input['search'] ?? '');

// Filter parameters
$price_min = floatval($input['price_min'] ?? 0);
$price_max = floatval($input['price_max'] ?? 1000000);
$colors = isset($input['colors']) ? (array)$input['colors'] : [];
$sizes = isset($input['sizes']) ? (array)$input['sizes'] : [];
$occasions = isset($input['occasions']) ? (array)$input['occasions'] : [];
$fabrics = isset($input['fabrics']) ? (array)$input['fabrics'] : [];
$availability = $input['availability'] ?? 'all';
$rating = floatval($input['rating'] ?? 0);
$product_types = isset($input['product_types']) ? (array)$input['product_types'] : [];

// Build WHERE clause
$where = "p.is_deleted = 0 AND p.active_status = 1";

if ($company_id > 0) {
    $where .= " AND p.company_id = $company_id";
}

if ($category_id > 0) {
    $where .= " AND p.category_id = $category_id";
}

// Price range
$where .= " AND p.price >= $price_min AND p.price <= $price_max";

// Search
if (!empty($search)) {
    $search = mysqli_real_escape_string($conn, $search);
    $where .= " AND (p.product_name LIKE '%$search%' OR p.short_description LIKE '%$search%' OR p.full_description LIKE '%$search%')";
}

// Colors
if (!empty($colors)) {
    $color_conditions = [];
    foreach ($colors as $color) {
        $color = mysqli_real_escape_string($conn, $color);
        $color_conditions[] = "p.color LIKE '%$color%'";
    }
    $where .= " AND (" . implode(" OR ", $color_conditions) . ")";
}

// Sizes
if (!empty($sizes)) {
    $size_conditions = [];
    foreach ($sizes as $size) {
        $size = mysqli_real_escape_string($conn, $size);
        $size_conditions[] = "p.available_sizes LIKE '%$size%'";
    }
    $where .= " AND (" . implode(" OR ", $size_conditions) . ")";
}

// Occasions
if (!empty($occasions)) {
    $occasion_conditions = [];
    foreach ($occasions as $occasion) {
        $occasion = mysqli_real_escape_string($conn, $occasion);
        $occasion_conditions[] = "p.occasion LIKE '%$occasion%'";
    }
    $where .= " AND (" . implode(" OR ", $occasion_conditions) . ")";
}

// Fabrics
if (!empty($fabrics)) {
    $fabric_conditions = [];
    foreach ($fabrics as $fabric) {
        $fabric = mysqli_real_escape_string($conn, $fabric);
        $fabric_conditions[] = "p.fabric LIKE '%$fabric%'";
    }
    $where .= " AND (" . implode(" OR ", $fabric_conditions) . ")";
}

// Availability
if ($availability == 'in_stock') {
    $where .= " AND p.stock > 0";
} elseif ($availability == 'out_of_stock') {
    $where .= " AND p.stock <= 0";
}

// Rating
if ($rating > 0) {
    $where .= " AND p.view_count >= $rating";
}

// Product types
if (!empty($product_types)) {
    $type_conditions = [];
    foreach ($product_types as $type) {
        $type = mysqli_real_escape_string($conn, $type);
        $type_conditions[] = "c.name LIKE '%$type%'";
    }
    $where .= " AND (" . implode(" OR ", $type_conditions) . ")";
}

// Sort
switch ($sort_by) {
    case 'price_low':
        $order = "p.price ASC";
        break;
    case 'price_high':
        $order = "p.price DESC";
        break;
    case 'popular':
        $order = "p.view_count DESC";
        break;
    case 'rating':
        $order = "p.view_count DESC";
        break;
    case 'newest':
    default:
        $order = "p.id DESC";
        break;
}

// Get total count for pagination
$count_query = "SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE $where";
$count_result = mysqli_query($conn, $count_query);

if (!$count_result) {
    echo json_encode([
        "status" => false,
        "message" => "Count query failed: " . mysqli_error($conn)
    ]);
    exit;
}

$total_count = mysqli_fetch_assoc($count_result)['total'];

// Get products
$query = "SELECT p.*, c.name AS category_name 
          FROM products p 
          LEFT JOIN categories c ON p.category_id = c.id 
          WHERE $where 
          ORDER BY $order 
          LIMIT $limit OFFSET $offset";

$result = mysqli_query($conn, $query);

if (!$result) {
    echo json_encode([
        "status" => false,
        "message" => "Query failed: " . mysqli_error($conn)
    ]);
    exit;
}

$data = [];

while ($row = mysqli_fetch_assoc($result)) {
    if (empty($row['image_gallery_json'])) {
        $row['image_gallery_json'] = json_encode([]);
    }
    $data[] = $row;
}

echo json_encode([
    "status" => true,
    "data" => $data,
    "pagination" => [
        "total" => (int)$total_count,
        "limit" => $limit,
        "offset" => $offset,
        "current_page" => floor($offset / $limit) + 1,
        "total_pages" => ceil($total_count / $limit)
    ]
]);

$conn->close();
?>