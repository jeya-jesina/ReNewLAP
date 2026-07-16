<?php
// 🔥 CORS HEADERS
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");

// 🔥 PREFLIGHT
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include __DIR__ . '/../../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

// If no JSON data, fallback to POST
if (!$data) {
    $data = $_POST;
}

function saveBase64Upload($base64String, $uploadDirectory, $defaultExtension = 'png') {
    if (empty($base64String)) {
        return '';
    }

    // Check if it's a base64 string
    if (preg_match('/^data:(.*?);base64,/', $base64String, $matches)) {
        $mimeType = $matches[1];
        $base64String = substr($base64String, strpos($base64String, ',') + 1);
    } else {
        $mimeType = '';
    }

    $data = base64_decode($base64String, true);
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

// Get product data
$id = intval($data['id'] ?? 0);
$name = trim($data['product_name'] ?? '');
$product_code = trim($data['product_code'] ?? '');
$category_id = intval($data['category_id'] ?? 0);
$price = floatval($data['price'] ?? 0);
$stock = intval($data['stock'] ?? 0);
$barcode = $conn->real_escape_string(trim($data['barcode'] ?? ''));
$unit = $conn->real_escape_string(trim($data['unit'] ?? 'piece'));
$gst = floatval($data['gst_percentage'] ?? 0);
$company_id = intval($data['company_id'] ?? 0);
$short_description = $conn->real_escape_string(trim($data['short_description'] ?? ''));
$full_description = $conn->real_escape_string(trim($data['full_description'] ?? ''));
$fabric = $conn->real_escape_string(trim($data['fabric'] ?? ''));
$embroidery = $conn->real_escape_string(trim($data['embroidery'] ?? ''));
$color = $conn->real_escape_string(trim($data['color'] ?? ''));
$available_sizes = $conn->real_escape_string(trim($data['available_sizes'] ?? ''));
$occasion = $conn->real_escape_string(trim($data['occasion'] ?? ''));
$keywords = $conn->real_escape_string(trim($data['keywords'] ?? ''));
$image_base64 = trim($data['image'] ?? '');
$gallery_images = $data['gallery_images'] ?? [];
$video_file = $data['video_file'] ?? '';
$video_url = trim($data['video_url'] ?? '');
$existing_images = $data['existing_images'] ?? [];
$existing_video = trim($data['existing_video'] ?? '');
$remove_video = isset($data['remove_video']) ? filter_var($data['remove_video'], FILTER_VALIDATE_BOOLEAN) : false;

// Validate required fields
if (!$id || !$name || !$category_id || !$company_id) {
    echo json_encode(["status" => false, "message" => "Product name, category and company are required"]);
    exit;
}

// Validate category belongs to company
$check = mysqli_query($conn, "SELECT id FROM categories 
    WHERE id='$category_id' AND company_id='$company_id' AND is_deleted=0");

if (mysqli_num_rows($check) == 0) {
    echo json_encode(["status" => false, "message" => "Invalid category/company"]);
    exit;
}

// Get current product data
$product_query = mysqli_query($conn, "SELECT image, image_gallery_json, video_url FROM products WHERE id='$id'");
$current_product = mysqli_fetch_assoc($product_query);

// Process images with limit validation
$image = '';
$image_gallery_json = '';
$upload_dir = __DIR__ . "/../uploads/";

// Get current gallery images
$current_gallery = [];
if ($current_product && !empty($current_product['image_gallery_json'])) {
    try {
        $current_gallery = json_decode($current_product['image_gallery_json'], true);
        if (!is_array($current_gallery)) {
            $current_gallery = [];
        }
    } catch (Exception $e) {
        $current_gallery = [];
    }
}

// Combine existing images with current gallery
$all_existing_images = $existing_images;
if (empty($all_existing_images) && $current_product && !empty($current_product['image'])) {
    // If no existing_images sent, use current gallery
    $all_existing_images = $current_gallery;
}

// Add main image to existing if not already in gallery
if ($current_product && !empty($current_product['image']) && !in_array($current_product['image'], $all_existing_images)) {
    array_unshift($all_existing_images, $current_product['image']);
}

// Count total images
$total_existing_count = count($all_existing_images);
$new_images_count = is_array($gallery_images) ? count($gallery_images) : 0;
$total_images = $total_existing_count + $new_images_count;

// Validate total images doesn't exzceed 5
if ($total_images > 5) {
    echo json_encode([
        "status" => false, 
        "message" => "Total images cannot exceed 5. Currently have {$total_existing_count} existing images and trying to add {$new_images_count} new images."
    ]);
    exit;
}

// Process new gallery images
$gallery_paths = $all_existing_images; // Start with existing images

if (is_array($gallery_images) && count($gallery_images) > 0) {
    // Only process up to 5 images total
    $remaining_slots = 5 - $total_existing_count;
    $gallery_images_to_process = array_slice($gallery_images, 0, $remaining_slots);
    
    foreach ($gallery_images_to_process as $galleryItem) {
        $savedPath = saveBase64Upload($galleryItem, $upload_dir, 'png');
        if ($savedPath) {
            $gallery_paths[] = $savedPath;
        }
    }
}

// Set main image (first image in gallery)
if (count($gallery_paths) > 0) {
    $image = $gallery_paths[0];
}

// Save gallery as JSON
if (count($gallery_paths) > 0) {
    $image_gallery_json = $conn->real_escape_string(json_encode($gallery_paths));
}

// Process video
$video_path = '';
if (!empty($video_file)) {
    $savedVideo = saveBase64Upload($video_file, $upload_dir, 'mp4');
    if ($savedVideo) {
        $video_path = $conn->real_escape_string($savedVideo);
    }
} elseif ($remove_video) {
    // Remove video if flag is set
    $video_path = '';
    $video_url = '';
} elseif (!empty($video_url)) {
    $video_path = $conn->real_escape_string($video_url);
} elseif (!empty($existing_video) && !$remove_video) {
    $video_path = $conn->real_escape_string($existing_video);
}

// Build UPDATE query
$sql = "UPDATE products SET
    product_name = '$name',
    product_code = '$product_code',
    category_id = '$category_id',
    price = '$price',
    stock = '$stock',
    barcode = '$barcode',
    unit = '$unit',
    gst_percentage = '$gst',
    short_description = '$short_description',
    full_description = '$full_description',
    fabric = '$fabric',
    embroidery = '$embroidery',
    color = '$color',
    available_sizes = '$available_sizes',
    occasion = '$occasion'";

// Add image fields if they have values
if ($image !== '') {
    $sql .= ", image = '$image'";
}

if ($image_gallery_json !== '') {
    $sql .= ", image_gallery_json='$image_gallery_json'";
}
$sql .= ", keywords='$keywords'";
if ($video_path !== '') {
    $sql .= ", video_url='$video_path'";
} elseif ($video_url !== '') {
    $sql .= ", video_url='$video_url'";
    $sql .= ", image_gallery_json = '$image_gallery_json'";
} elseif ($image_gallery_json === '' && count($gallery_paths) === 0) {
    // If no images left, set to empty JSON array
    $sql .= ", image_gallery_json = '[]'";
}

// Handle video
if ($remove_video || $video_path === '') {
    $sql .= ", video_url = ''";
} elseif ($video_path !== '') {
    $sql .= ", video_url = '$video_path'";
}

$sql .= " WHERE id = '$id'";

// Execute query
if ($conn->query($sql)) {
    // Get updated product data
    $updated_query = mysqli_query($conn, "SELECT * FROM products WHERE id='$id'");
    $updated_product = mysqli_fetch_assoc($updated_query);
    
    echo json_encode([
        "status" => true,
        "message" => "Product updated successfully",
        "data" => $updated_product
    ]);
} else {
    echo json_encode([
        "status" => false,
        "message" => "Database error: " . $conn->error
    ]);
}

$conn->close();
?>