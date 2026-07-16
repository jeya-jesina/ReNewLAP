<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include "../../config/db.php";

$company_id = intval($_GET['company_id'] ?? 0);
$limit = intval($_GET['limit'] ?? 10);

if($company_id <= 0){
    echo json_encode([
        "status" => false,
        "message" => "Company ID required",
        "data" => []
    ]);
    exit;
}

// Get categories with video
$result = mysqli_query($conn, "
    SELECT 
        id,
        name,
        banner_image,
        category_video,
        visible,
        status,
        company_id
    FROM categories
    WHERE company_id = '$company_id'
    AND is_deleted = 0
    AND status = 'active'
    AND visible = 1
    AND category_video IS NOT NULL
    AND category_video != ''
    ORDER BY id DESC
    LIMIT $limit
");

$data = [];

// Get the correct base URL for your project
$base_url = "http://localhost/bridal-boutique/Bridal-Boutique-backend/api/";

while($row = mysqli_fetch_assoc($result)){
    // Create full video URL
    if($row['category_video']) {
        // Remove any leading slashes
        $clean_path = ltrim($row['category_video'], '/');
        $row['category_video_url'] = $base_url . $clean_path;
    } else {
        $row['category_video_url'] = null;
    }
    
    // Create full banner URL
    if($row['banner_image']) {
        $clean_path = ltrim($row['banner_image'], '/');
        $row['banner_image_url'] = $base_url . $clean_path;
    } else {
        $row['banner_image_url'] = null;
    }
    
    $data[] = $row;
}

// If no data found, return empty array
echo json_encode([
    "status" => true,
    "data" => $data
]);

$conn->close();
?>