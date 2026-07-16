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

// 🔥 Increase PHP limits for large files
ini_set('upload_max_filesize', '100M');
ini_set('post_max_size', '100M');
ini_set('max_execution_time', '300');
ini_set('memory_limit', '256M');

include __DIR__ . '/../../config/db.php';

// Check if it's a multipart/form-data request (file upload)
if ($_SERVER['CONTENT_TYPE'] && strpos($_SERVER['CONTENT_TYPE'], 'multipart/form-data') !== false) {
    // Handle file upload via FormData
    $id = intval($_POST['id'] ?? 0);
    $name = trim($_POST['name'] ?? '');
    $status = trim($_POST['status'] ?? 'active');
    $visible = (!empty($_POST['visible']) && $_POST['visible'] == 'true') ? 1 : 0;
    
    // Handle banner image upload
    $banner_image = '';
    if (isset($_FILES['banner_image']) && $_FILES['banner_image']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = __DIR__ . "/../uploads/";
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }
        $file_name = time() . "_" . uniqid() . ".png";
        $full_path = $upload_dir . $file_name;
        if (move_uploaded_file($_FILES['banner_image']['tmp_name'], $full_path)) {
            $banner_image = "uploads/" . $file_name;
        }
    } else if (isset($_POST['banner_image']) && !empty($_POST['banner_image'])) {
        // Base64 image
        $banner_image = saveBase64File($_POST['banner_image'], 'image');
    }
    
    // Handle video upload
    $category_video = '';
    if (isset($_FILES['category_video']) && $_FILES['category_video']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = __DIR__ . "/../uploads/";
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }
        $file_name = time() . "_" . uniqid() . ".mp4";
        $full_path = $upload_dir . $file_name;
        if (move_uploaded_file($_FILES['category_video']['tmp_name'], $full_path)) {
            $category_video = "uploads/" . $file_name;
        }
    } else if (isset($_POST['category_video']) && !empty($_POST['category_video'])) {
        // Base64 video
        $category_video = saveBase64File($_POST['category_video'], 'video');
    }
    
} else {
    // Handle JSON request
    $data = json_decode(file_get_contents("php://input"), true);
    $id = intval($data['id'] ?? 0);
    $name = trim($data['name'] ?? '');
    $status = trim($data['status'] ?? 'active');
    $visible = (!empty($data['visible']) && $data['visible'] == true) ? 1 : 0;
    $banner_image = saveBase64File(trim($data['banner_image'] ?? ''), 'image');
    $category_video = saveBase64File(trim($data['category_video'] ?? ''), 'video');
}

function saveBase64File($value, $type = 'image')
{
    if (!$value) {
        return '';
    }

    // Already uploaded path - skip processing
    if (!preg_match('/^[A-Za-z0-9+\/]+={0,2}$/', $value)) {
        return $value;
    }

    $decoded = base64_decode($value, true);

    if ($decoded === false) {
        return $value;
    }

    $upload_dir = __DIR__ . "/../uploads/";

    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }

    // Determine file extension
    $ext = $type === 'video' ? '.mp4' : '.png';
    $file_name = time() . "_" . uniqid() . $ext;
    $full_path = $upload_dir . $file_name;

    if (file_put_contents($full_path, $decoded) === false) {
        return "";
    }

    return "uploads/" . $file_name;
}

// Validate status
if (!in_array($status, ['active', 'inactive'])) {
    $status = 'active';
}

// Validation
if (!$id || !$name) {
    echo json_encode([
        "status" => false,
        "message" => "ID & Name are required"
    ]);
    exit;
}

// Check if category exists
$check = mysqli_query($conn, "SELECT id FROM categories WHERE id='$id' AND is_deleted=0");
if (mysqli_num_rows($check) == 0) {
    echo json_encode([
        "status" => false,
        "message" => "Category not found"
    ]);
    exit;
}

// Check duplicate name (excluding current category)
$dup = mysqli_query(
    $conn,
    "SELECT id FROM categories 
     WHERE name='$name' 
     AND id != '$id' 
     AND is_deleted=0"
);

if (mysqli_num_rows($dup) > 0) {
    echo json_encode([
        "status" => false,
        "message" => "Category name already exists"
    ]);
    exit;
}

// Build update query dynamically
$sql = "UPDATE categories SET 
    name = '$name',
    status = '$status',
    visible = '$visible'";

// Only update banner_image if provided
if (!empty($banner_image)) {
    $sql .= ", banner_image = '$banner_image'";
}

// Only update category_video if provided
if (!empty($category_video)) {
    $sql .= ", category_video = '$category_video'";
}

$sql .= " WHERE id = '$id' AND is_deleted = 0";

if ($conn->query($sql)) {
    echo json_encode([
        "status" => true,
        "message" => "Category updated successfully",
        "data" => [
            "id" => $id,
            "name" => $name,
            "status" => $status,
            "visible" => $visible,
            "banner_image" => $banner_image,
            "category_video" => $category_video
        ]
    ]);
} else {
    echo json_encode([
        "status" => false,
        "message" => $conn->error
    ]);
}

$conn->close();
?>