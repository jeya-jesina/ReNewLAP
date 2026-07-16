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

// Increase limits for bulk upload
ini_set('upload_max_filesize', '500M');
ini_set('post_max_size', '500M');
ini_set('max_execution_time', '600');
ini_set('memory_limit', '512M');

include __DIR__ . '/../../config/db.php';

// Get POST data
$category_id = intval($_POST['category_id'] ?? 0);
$video_titles = $_POST['video_titles'] ?? [];

if (!$category_id) {
    echo json_encode([
        "status" => false,
        "message" => "Category ID is required"
    ]);
    exit;
}

// Check if category exists (don't check visibility)
$check = mysqli_query($conn, "SELECT id, name, visible FROM categories WHERE id='$category_id' AND is_deleted=0");
if (mysqli_num_rows($check) == 0) {
    echo json_encode([
        "status" => false,
        "message" => "Category not found"
    ]);
    exit;
}
$category = mysqli_fetch_assoc($check);

// Create upload directory
$upload_dir = __DIR__ . "/../uploads/videos/";
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

$uploaded_videos = [];
$errors = [];

// Check if files were uploaded
if (!isset($_FILES['videos']) || empty($_FILES['videos']['name'][0])) {
    echo json_encode([
        "status" => false,
        "message" => "No videos selected for upload"
    ]);
    exit;
}

$total_files = count($_FILES['videos']['name']);

for ($i = 0; $i < $total_files; $i++) {
    if ($_FILES['videos']['error'][$i] === UPLOAD_ERR_OK) {
        $file_name = $_FILES['videos']['name'][$i];
        $file_tmp = $_FILES['videos']['tmp_name'][$i];
        $file_size = $_FILES['videos']['size'][$i];
        
        // Get file extension
        $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
        
        // Validate file type
        $allowed_extensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];
        if (!in_array($file_ext, $allowed_extensions)) {
            $errors[] = "File '$file_name' has invalid format. Allowed: " . implode(', ', $allowed_extensions);
            continue;
        }
        
        // Validate file size (max 100MB)
        if ($file_size > 100 * 1024 * 1024) {
            $errors[] = "File '$file_name' exceeds 100MB limit";
            continue;
        }
        
        // Generate unique filename
        $new_filename = time() . "_" . uniqid() . "." . $file_ext;
        $full_path = $upload_dir . $new_filename;
        
        // Move uploaded file
        if (move_uploaded_file($file_tmp, $full_path)) {
            $video_path = "uploads/videos/" . $new_filename;
            $video_title = trim($video_titles[$i] ?? pathinfo($file_name, PATHINFO_FILENAME));
            
            // Get current max order
            $order_query = mysqli_query($conn, "SELECT MAX(video_order) as max_order FROM category_videos WHERE category_id='$category_id'");
            $order_row = mysqli_fetch_assoc($order_query);
            $video_order = ($order_row['max_order'] ?? -1) + 1;
            
            // Insert into database - always active regardless of category visibility
            $sql = "INSERT INTO category_videos 
                    (category_id, video_path, video_title, video_order, status) 
                    VALUES ('$category_id', '$video_path', '$video_title', '$video_order', 'active')";
            
            if ($conn->query($sql)) {
                $video_id = $conn->insert_id;
                $uploaded_videos[] = [
                    "id" => $video_id,
                    "filename" => $new_filename,
                    "original_name" => $file_name,
                    "path" => $video_path,
                    "title" => $video_title
                ];
            } else {
                $errors[] = "Database error for '$file_name': " . $conn->error;
            }
        } else {
            $errors[] = "Failed to upload '$file_name'";
        }
    } else {
        $errors[] = "Error uploading file: " . $_FILES['videos']['error'][$i];
    }
}

echo json_encode([
    "status" => true,
    "message" => count($uploaded_videos) . " videos uploaded successfully for category '" . $category['name'] . "'",
    "data" => [
        "uploaded" => $uploaded_videos,
        "errors" => $errors,
        "total" => count($uploaded_videos)
    ]
]);

$conn->close();
?>