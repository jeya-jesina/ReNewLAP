<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include __DIR__ . '/../../config/db.php';

$data = json_decode(file_get_contents("php://input"), true) ?: [];

function saveBase64Upload($base64String, $uploadDirectory, $defaultExtension = 'png') {
    if (empty($base64String)) {
        return '';
    }

    if (preg_match('/^data:(.*?);base64,/', $base64String, $matches)) {
        $mimeType = $matches[1];
        $base64String = substr($base64String, strpos($base64String, ',') + 1);
    } else {
        $mimeType = '';
    }

    $data = base64_decode($base64String);
    if ($data === false) {
        return '';
    }

    $extension = $defaultExtension;
    if ($mimeType) {
        $parts = explode('/', $mimeType);
        if (count($parts) === 2) {
            $extension = preg_replace('/[^a-z0-9]/i', '', $parts[1]);
        }
    }

    if (!is_dir($uploadDirectory)) {
        mkdir($uploadDirectory, 0777, true);
    }

    $filename = time() . '_' . bin2hex(random_bytes(6)) . '.' . $extension;
    $fullPath = rtrim($uploadDirectory, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $filename;

    if (file_put_contents($fullPath, $data) === false) {
        return '';
    }

    return 'uploads/' . $filename;
}

$name = trim($data['product_name'] ?? '');
$category_id = intval($data['category_id'] ?? 0);
$company_id = intval($data['company_id'] ?? 0);
$product_code = trim($data['product_code'] ?? '');
$price = floatval($data['price'] ?? 0);
$gst_percentage = floatval($data['gst_percentage'] ?? 0);
$stock = intval($data['stock'] ?? 0);
$barcode = $conn->real_escape_string(trim($data['barcode'] ?? ''));
$unit = $conn->real_escape_string(trim($data['unit'] ?? ''));
$short_description = $conn->real_escape_string(trim($data['short_description'] ?? ''));
$full_description = $conn->real_escape_string(trim($data['full_description'] ?? ''));
$fabric = $conn->real_escape_string(trim($data['fabric'] ?? ''));
$embroidery = $conn->real_escape_string(trim($data['embroidery'] ?? ''));
$color = $conn->real_escape_string(trim($data['color'] ?? ''));
$available_sizes = $conn->real_escape_string(trim($data['available_sizes'] ?? ''));
$occasion = $conn->real_escape_string(trim($data['occasion'] ?? ''));
$keywords = $conn->real_escape_string(trim($data['keywords'] ?? ''));
$gallery_images = $data['gallery_images'] ?? [];
$video_file = $data['video_file'] ?? '';
$video_url = trim($data['video_url'] ?? '');

$image_path = '';
$gallery_paths = [];
$upload_dir = __DIR__ . "/../uploads/";

// Process gallery images
if (is_array($gallery_images) && count($gallery_images) > 0) {
    // Limit to 5 images
    $gallery_images = array_slice($gallery_images, 0, 5);
    
    foreach ($gallery_images as $index => $galleryItem) {
        $savedPath = saveBase64Upload($galleryItem, $upload_dir, 'png');
        if ($savedPath) {
            $gallery_paths[] = $savedPath;
            if ($index === 0) {
                $image_path = $savedPath;
            }
        }
    }
}

if (!empty($video_file)) {
    $savedVideo = saveBase64Upload($video_file, $upload_dir, 'mp4');
    if ($savedVideo) {
        $video_url = $savedVideo;
    }
}

$image = $conn->real_escape_string($image_path);
$image_gallery_json = $conn->real_escape_string(json_encode($gallery_paths));

if (!$name || !$category_id || !$company_id) {
    echo json_encode(["status" => false, "message" => "Product name, category and company are required"]);
    exit;
}

$query = "INSERT INTO products (
    product_name, product_code, category_id, company_id, price, stock, gst_percentage, barcode, unit,
    short_description, full_description, fabric, embroidery, color, available_sizes, occasion, keywords,
    image, image_gallery_json, video_url
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($query);
if (!$stmt) {
    echo json_encode(["status" => false, "message" => $conn->error]);
    exit;
}

$params = [$name, $product_code, $category_id, $company_id, $price, $stock, $gst_percentage, $barcode, $unit, $short_description, $full_description, $fabric, $embroidery, $color, $available_sizes, $occasion, $keywords, $image, $image_gallery_json, $video_url];
$types = 'ssiidid' . str_repeat('s', 13);
$stmt->bind_param($types, ...$params);

if ($stmt->execute()) {
    echo json_encode(["status" => true, "message" => "Product added", "id" => $conn->insert_id]);
} else {
    echo json_encode(["status" => false, "message" => $stmt->error]);
}

$stmt->close();
?>