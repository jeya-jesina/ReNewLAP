<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include "../../config/db.php";

$company_id = intval($_GET['company_id'] ?? 0);
$limit = intval($_GET['limit'] ?? 20);

if($company_id <= 0){
    echo json_encode([
        "status" => false,
        "message" => "Company ID required",
        "data" => []
    ]);
    exit;
}

$base_url = "http://localhost/bridal-boutique/Bridal-Boutique-backend/api/";

// REMOVED: c.visible = 1 condition - now shows all videos regardless of category visibility
$result = mysqli_query($conn, "
    SELECT 
        cv.id as video_id,
        cv.video_path,
        cv.video_title,
        cv.video_order,
        c.id as category_id,
        c.name as category_name,
        c.banner_image,
        c.category_video,
        c.video_title as category_video_title,
        c.visible as category_visible
    FROM category_videos cv
    INNER JOIN categories c ON cv.category_id = c.id
    WHERE c.company_id = '$company_id'
    AND c.is_deleted = 0
    AND c.status = 'active'
    AND cv.status = 'active'
    ORDER BY cv.video_order ASC, cv.id DESC
    LIMIT $limit
");

$data = [];

while($row = mysqli_fetch_assoc($result)){
    // Construct full video URL
    $clean_path = ltrim($row['video_path'], '/');
    $row['video_url'] = $base_url . $clean_path;
    
    // If video_title is empty, use category_video_title from categories
    if (empty($row['video_title']) && !empty($row['category_video_title'])) {
        $row['video_title'] = $row['category_video_title'];
    }
    
    // Construct banner URL if exists
    if($row['banner_image']) {
        $clean_banner = ltrim($row['banner_image'], '/');
        $row['banner_image_url'] = $base_url . $clean_banner;
    } else {
        $row['banner_image_url'] = null;
    }
    
    $data[] = $row;
}

echo json_encode([
    "status" => true,
    "data" => $data
]);

$conn->close();
?>