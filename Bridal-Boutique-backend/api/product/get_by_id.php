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

$id = intval($_GET['id'] ?? 0);

if ($id <= 0) {
    echo json_encode([
        "status" => false, 
        "message" => "Invalid product ID"
    ]);
    exit;
}

// Get product details with category name
$query = "SELECT p.*, c.name AS category_name 
          FROM products p 
          LEFT JOIN categories c ON p.category_id = c.id 
          WHERE p.id = $id AND p.is_deleted = 0";

$result = mysqli_query($conn, $query);

if (!$result) {
    echo json_encode([
        "status" => false, 
        "message" => "Database error: " . mysqli_error($conn)
    ]);
    exit;
}

if (mysqli_num_rows($result) == 0) {
    echo json_encode([
        "status" => false, 
        "message" => "Product not found"
    ]);
    exit;
}

$product = mysqli_fetch_assoc($result);

// --- Handle image_gallery_json properly ---
if (empty($product['image_gallery_json'])) {
    // If empty, set as empty JSON array
    $product['image_gallery_json'] = json_encode([]);
} else {
    // Clean the JSON string
    $cleanJson = $product['image_gallery_json'];
    
    // Remove escaped slashes and quotes if present
    $cleanJson = stripslashes($cleanJson);
    
    // Validate if it's valid JSON
    json_decode($cleanJson);
    if (json_last_error() !== JSON_ERROR_NONE) {
        // If invalid JSON, try to fix common issues
        // Sometimes it might be double encoded
        $cleanJson = stripslashes($cleanJson);
        json_decode($cleanJson);
        if (json_last_error() !== JSON_ERROR_NONE) {
            // If still invalid, return empty array
            $cleanJson = json_encode([]);
        }
    }
    
    $product['image_gallery_json'] = $cleanJson;
}

// --- Handle image field (ensure it's set) ---
if (empty($product['image'])) {
    $product['image'] = '';
}

// --- Build full image URLs if needed ---
$base_url = "http://localhost/bridal-boutique/Bridal-Boutique-backend/api/uploads/";

// Add full image URL for frontend use
$product['image_url'] = !empty($product['image']) ? $base_url . basename($product['image']) : '';

// Parse gallery and add full URLs
$gallery_array = [];
if (!empty($product['image_gallery_json'])) {
    $gallery_array = json_decode($product['image_gallery_json'], true);
    if (!is_array($gallery_array)) {
        $gallery_array = [];
    }
}

$product['gallery_urls'] = array_map(function($img) use ($base_url) {
    return $base_url . basename($img);
}, $gallery_array);

// --- Handle video URL ---
if (!empty($product['video_url'])) {
    if (strpos($product['video_url'], 'http') !== 0) {
        $product['video_url'] = $base_url . basename($product['video_url']);
    }
}

// --- Additional product data ---
$product['total_images'] = count($gallery_array) + (empty($product['image']) ? 0 : 1);

echo json_encode([
    "status" => true, 
    "data" => $product
]);
?>