<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

include __DIR__ . '/../../config/db.php';

$id = intval($_POST['id'] ?? 0);
$title = trim($_POST['title'] ?? '');
$description = trim($_POST['description'] ?? '');
$category_id = intval($_POST['category_id'] ?? 0);
$category_name = trim($_POST['category_name'] ?? '');
$status = trim($_POST['status'] ?? '');

if ($id <= 0) {
    echo json_encode(["success" => false, "message" => "Invalid banner id."]);
    exit;
}

$setParts = [];
$params = [];
$types = "";

// Only add fields that are present in the request
if ($title !== '') {
    $setParts[] = "title = ?";
    $params[] = $title;
    $types .= "s";
}

if ($description !== '') {
    $setParts[] = "description = ?";
    $params[] = $description;
    $types .= "s";
}

if ($category_id > 0) {
    $setParts[] = "category_id = ?";
    $params[] = $category_id;
    $types .= "i";
}

if ($status !== '') {
    $setParts[] = "status = ?";
    $params[] = $status;
    $types .= "s";
}

if ($category_name !== '') {
    $setParts[] = "category_name = ?";
    $params[] = $category_name;
    $types .= "s";
}

if (!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $imageFile = $_FILES['image'];
    $allowedMimeTypes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $imageMimeType = $finfo->file($imageFile['tmp_name']);
    if (!array_key_exists($imageMimeType, $allowedMimeTypes)) {
        echo json_encode(["success" => false, "message" => "Uploaded file must be an image."]);
        exit;
    }

    $uploadDir = __DIR__ . '/../../uploads/banners/';
    if (!is_dir($uploadDir) && !mkdir($uploadDir, 0777, true)) {
        echo json_encode(["success" => false, "message" => "Unable to create upload directory."]);
        exit;
    }

    $filename = uniqid('banner_', true) . '.'. $allowedMimeTypes[$imageMimeType];
    $targetPath = $uploadDir . $filename;
    if (!move_uploaded_file($imageFile['tmp_name'], $targetPath)) {
        echo json_encode(["success" => false, "message" => "Failed to move uploaded image."]);
        exit;
    }

    $setParts[] = "image = ?";
    $params[] = "uploads/banners/" . $filename;
    $types .= "s";
}
// if nothing to update
if (count($setParts) === 0) {
    echo json_encode(["success" => false, "message" => "No fields to update."]);
    exit;
}

$params[] = $id;
$types .= "i";

$sql = "UPDATE banners SET " . implode(', ', $setParts) . " WHERE id = ?";
$stmt = mysqli_prepare($conn, $sql);
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Database prepare failed."]);
    exit;
}

mysqli_stmt_bind_param($stmt, $types, ...$params);
$executed = mysqli_stmt_execute($stmt);
mysqli_stmt_close($stmt);

if (!$executed) {
    echo json_encode(["success" => false, "message" => "Banner update failed."]);
    exit;
}

echo json_encode(["success" => true, "message" => "Banner updated successfully."]);
