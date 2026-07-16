<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

include __DIR__ . '/../../config/db.php';

$company_id = intval($_GET['company_id'] ?? 1);

$sql = "SELECT *
        FROM categories
        WHERE
            company_id='$company_id'
            AND visible=1
            AND status='active'
            AND is_deleted=0
        ORDER BY id DESC";

$result = mysqli_query($conn,$sql);

$data = [];

while($row=mysqli_fetch_assoc($result)){
    $data[]=$row;
}

echo json_encode([
    "status"=>true,
    "data"=>$data
]);