<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

include __DIR__ . '/../../config/db.php';

$banner_title = trim($_POST['banner_title'] ?? '');
$title = trim($_POST['title'] ?? '');

// Require banner_title (group/name). The banner heading/title is optional (subtitle).
if ($banner_title === '') {
    echo json_encode([
        "success" => false,
        "message" => "banner_title is required.",
        "debug" => "missing_banner_title"
    ]);
    exit;
}

if (empty($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    $errorCode = $_FILES['image']['error'] ?? 'no_file';
    echo json_encode([
        "success" => false,
        "message" => "Image file is required and must upload successfully.",
        "debug" => "image_upload_error_{$errorCode}"
    ]);
    exit;
}

$imageFile = $_FILES['image'];
$allowedMimeTypes = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
    'image/gif' => 'gif',
];

$finfo = new finfo(FILEINFO_MIME_TYPE);
$imageMimeType = $finfo->file($imageFile['tmp_name']);
if (!array_key_exists($imageMimeType, $allowedMimeTypes)) {
    echo json_encode([
        "success" => false,
        "message" => "Uploaded file must be an image (JPEG, PNG, WEBP, GIF).",
        "debug" => "invalid_mime_type_{$imageMimeType}"
    ]);
    exit;
}

$uploadDir = __DIR__ . '/../../uploads/banners/';
if (!is_dir($uploadDir) && !mkdir($uploadDir, 0777, true)) {
    echo json_encode([
        "success" => false,
        "message" => "Unable to create upload directory.",
        "debug" => "mkdir_failed"
    ]);
    exit;
}

$extension = $allowedMimeTypes[$imageMimeType];
$filename = uniqid('banner_', true) . ".{$extension}";
$targetPath = $uploadDir . $filename;

if (!move_uploaded_file($imageFile['tmp_name'], $targetPath)) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to move uploaded image.",
        "debug" => "move_uploaded_file_failed"
    ]);
    exit;
}

$imagePath = "uploads/banners/" . $filename;
$sql = "INSERT INTO banners (banner_title, title, image, status) VALUES (?, ?, ?, 'active')";
$stmt = mysqli_prepare($conn, $sql);
if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Database prepare failed.",
        "debug" => mysqli_error($conn)
    ]);
    exit;
}

mysqli_stmt_bind_param($stmt, "sss", $banner_title, $title, $imagePath);
$executed = mysqli_stmt_execute($stmt);
if (!$executed) {
    echo json_encode([
        "success" => false,
        "message" => "Database insert failed.",
        "debug" => mysqli_stmt_error($stmt)
    ]);
    mysqli_stmt_close($stmt);
    exit;
}

$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || ($_SERVER['SERVER_PORT'] ?? '') == 443 ? 'https' : 'http';
// dirname(..., 3) moves up to the project root (Bridal-Boutique-backend), so uploads path resolves correctly
$apiBaseUrl = $scheme . '://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['SCRIPT_NAME'], 3);
$imageUrl = rtrim($apiBaseUrl, '/') . '/' . ltrim($imagePath, '/');

mysqli_stmt_close($stmt);

echo json_encode([
    "success" => true,
    "message" => "Banner added successfully.",
    "data" => [
        "banner_title" => $banner_title,
        "title" => $title,
        "image" => $imageUrl,
    ]
]);
