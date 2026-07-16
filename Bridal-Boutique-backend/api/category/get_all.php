<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

include "../../config/db.php";

$company_id = intval($_GET['company_id'] ?? 0);

if($company_id <= 0){

    echo json_encode([
        "status" => true,
        "data" => []
    ]);

    exit;
}

$result = mysqli_query($conn, "

    SELECT
        id,
        name,
        visible,
        status
    FROM categories
    WHERE company_id='$company_id'
    AND is_deleted=0
    ORDER BY id DESC

");

$data = [];

while($row = mysqli_fetch_assoc($result)){
    $data[] = $row;
}

echo json_encode([
    "status"=>true,
    "data"=>$data
]);