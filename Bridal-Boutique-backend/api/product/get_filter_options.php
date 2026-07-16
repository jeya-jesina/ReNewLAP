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

$where = "p.is_deleted = 0 AND p.active_status = 1";
if ($company_id > 0) {
    $where .= " AND p.company_id = $company_id";
}
if ($category_id > 0) {
    $where .= " AND p.category_id = $category_id";
}

// Get all filter options
$response = [];

// Colors
$color_query = "SELECT DISTINCT p.color FROM products p WHERE $where AND p.color IS NOT NULL AND p.color != ''";
$color_result = mysqli_query($conn, $color_query);
if ($color_result) {
    $colors = [];
    while ($row = mysqli_fetch_assoc($color_result)) {
        $items = array_map('trim', explode(',', $row['color']));
        foreach ($items as $item) {
            if (!empty($item)) {
                $colors[] = $item;
            }
        }
    }
    $response['colors'] = array_values(array_unique($colors));
} else {
    $response['colors'] = [];
}

// Sizes
$size_query = "SELECT DISTINCT p.available_sizes FROM products p WHERE $where AND p.available_sizes IS NOT NULL AND p.available_sizes != ''";
$size_result = mysqli_query($conn, $size_query);
if ($size_result) {
    $sizes = [];
    while ($row = mysqli_fetch_assoc($size_result)) {
        $items = preg_split('/[,;|]/', $row['available_sizes']);
        foreach ($items as $item) {
            $item = trim($item);
            if (!empty($item)) {
                $sizes[] = $item;
            }
        }
    }
    $response['sizes'] = array_values(array_unique($sizes));
} else {
    $response['sizes'] = [];
}

// Occasions
$occasion_query = "SELECT DISTINCT p.occasion FROM products p WHERE $where AND p.occasion IS NOT NULL AND p.occasion != ''";
$occasion_result = mysqli_query($conn, $occasion_query);
if ($occasion_result) {
    $occasions = [];
    while ($row = mysqli_fetch_assoc($occasion_result)) {
        $items = array_map('trim', explode(',', $row['occasion']));
        foreach ($items as $item) {
            if (!empty($item)) {
                $occasions[] = $item;
            }
        }
    }
    $response['occasions'] = array_values(array_unique($occasions));
} else {
    $response['occasions'] = [];
}

// Fabrics
$fabric_query = "SELECT DISTINCT p.fabric FROM products p WHERE $where AND p.fabric IS NOT NULL AND p.fabric != ''";
$fabric_result = mysqli_query($conn, $fabric_query);
if ($fabric_result) {
    $fabrics = [];
    while ($row = mysqli_fetch_assoc($fabric_result)) {
        $items = array_map('trim', explode(',', $row['fabric']));
        foreach ($items as $item) {
            if (!empty($item)) {
                $fabrics[] = $item;
            }
        }
    }
    $response['fabrics'] = array_values(array_unique($fabrics));
} else {
    $response['fabrics'] = [];
}

// Price range
$price_query = "SELECT MIN(price) as min_price, MAX(price) as max_price FROM products p WHERE $where";
$price_result = mysqli_query($conn, $price_query);
if ($price_result) {
    $price_row = mysqli_fetch_assoc($price_result);
    $response['price_range'] = [
        'min' => floatval($price_row['min_price'] ?? 0),
        'max' => floatval($price_row['max_price'] ?? 100000)
    ];
} else {
    $response['price_range'] = ['min' => 0, 'max' => 100000];
}

// Product types
$type_query = "SELECT DISTINCT c.name as type FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE $where AND c.name IS NOT NULL";
$type_result = mysqli_query($conn, $type_query);
if ($type_result) {
    $types = [];
    while ($row = mysqli_fetch_assoc($type_result)) {
        $types[] = $row['type'];
    }
    $response['product_types'] = $types;
} else {
    $response['product_types'] = [];
}

echo json_encode([
    "status" => true,
    "data" => $response
]);

$conn->close();
?>