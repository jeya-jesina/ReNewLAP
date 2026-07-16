<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

include __DIR__ . '/../../config/db.php';

$company_id = $_GET['company_id'] ?? 0;

if (!$company_id) {
    echo json_encode([
        "status" => false,
        "message" => "company_id required"
    ]);
    exit;
}

$months = [
    1=>"Jan",2=>"Feb",3=>"Mar",4=>"Apr",5=>"May",6=>"Jun",
    7=>"Jul",8=>"Aug",9=>"Sep",10=>"Oct",11=>"Nov",12=>"Dec"
];

$data = array_fill(1, 12, 0);

// Get monthly sales from invoices
$res = $conn->query("
    SELECT MONTH(created_at) as month, SUM(total_amount) as total
    FROM invoices
    WHERE company_id = '$company_id'
    GROUP BY MONTH(created_at)
");

while($row = $res->fetch_assoc()){
    $data[(int)$row['month']] = (float)$row['total'];
}

$monthly = [];
foreach($data as $m => $val){
    $monthly[] = [
        "month" => $months[$m],
        "total" => (float)$val
    ];
}

echo json_encode([
    "status" => true,
    "data" => [
        "monthly_sales" => $monthly
    ]
]);
?>