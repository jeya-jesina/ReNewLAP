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

// TOTAL SALES - From invoices table using total_amount
$sales = 0;
$salesQuery = $conn->query("
    SELECT COALESCE(SUM(total_amount),0) as total_sales 
    FROM invoices 
    WHERE company_id = '$company_id'
");
if ($salesQuery && $row = $salesQuery->fetch_assoc()) {
    $sales = floatval($row['total_sales']);
}

// TOTAL PRODUCTS - From products table
$totalProducts = 0;
$productQuery = $conn->query("
    SELECT COUNT(*) as total_products 
    FROM products 
    WHERE company_id = '$company_id'
    AND is_deleted = 0
    AND active_status = 1
");
if ($productQuery) {
    $totalProducts = intval($productQuery->fetch_assoc()['total_products']);
}

// LOW STOCK - Products with stock less than 5
$lowStock = 0;
$lowStockQuery = $conn->query("
    SELECT COUNT(*) as low_stock 
    FROM products 
    WHERE company_id = '$company_id'
    AND stock < 5
    AND is_deleted = 0
    AND active_status = 1
");
if ($lowStockQuery) {
    $lowStock = intval($lowStockQuery->fetch_assoc()['low_stock']);
}

echo json_encode([
    "status" => true,
    "data" => [
        "total_sales" => $sales,
        "total_products" => $totalProducts,
        "low_stock" => $lowStock
    ]
]);
?>