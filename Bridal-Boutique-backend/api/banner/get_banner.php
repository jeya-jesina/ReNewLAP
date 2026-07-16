<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

include __DIR__ . '/../../config/db.php';

$banner_title = trim($_GET['banner_title'] ?? '');
if ($banner_title === '') {
    echo json_encode([
        "success" => false,
        "message" => "banner_title required"
    ]);
    exit;
}

$sql = "SELECT banner_title, title, image FROM banners WHERE banner_title = ? AND status = 'active' LIMIT 1";
$stmt = mysqli_prepare($conn, $sql);
if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Database prepare failed.",
        "debug" => mysqli_error($conn)
    ]);
    exit;
}

mysqli_stmt_bind_param($stmt, "s", $banner_title);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if ($result && ($banner = mysqli_fetch_assoc($result))) {
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || ($_SERVER['SERVER_PORT'] ?? '') == 443 ? 'https' : 'http';
    // dirname(..., 3) moves up to the project root (Bridal-Boutique-backend), so uploads path resolves correctly
    $apiBaseUrl = $scheme . '://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['SCRIPT_NAME'], 3);
    $banner['image'] = rtrim($apiBaseUrl, '/') . '/' . ltrim($banner['image'], '/');

    echo json_encode([
        "success" => true,
        "data" => $banner
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Banner Not Found"
    ]);
}

mysqli_stmt_close($stmt);
mysqli_close($conn);
