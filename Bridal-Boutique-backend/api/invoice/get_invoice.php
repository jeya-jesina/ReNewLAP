<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

include __DIR__ . '/../../config/db.php';

$invoice_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($invoice_id <= 0) {
    echo json_encode([
        'status' => false,
        'message' => 'Invalid invoice ID'
    ]);
    exit;
}

try {
    // First try to find by invoice_id directly
    $query = "SELECT 
                i.*, 
                COALESCE(c.company_name, i.company_name) AS company_name,
                COALESCE(c.company_address, i.company_address) AS company_address,
                COALESCE(c.phone, i.company_phone) AS company_phone,
                COALESCE(c.gstin, i.company_gstin) AS company_gstin,
                c.logo AS company_logo,
                c.gst_type AS company_gst_type
              FROM invoices i
              LEFT JOIN companies c ON i.company_id = c.id
              WHERE i.id = $invoice_id";
    
    $result = mysqli_query($conn, $query);
    
    // If not found, try to find by order_id (invoice_id is actually order_id)
    if (!$result || mysqli_num_rows($result) == 0) {
        // Try to find order with this ID
        $orderQuery = "SELECT 
                        o.id as order_id,
                        o.customer_name,
                        o.email,
                        o.mobile,
                        o.shipping_address,
                        o.total,
                        o.payment_status,
                        o.created_at,
                        o.status,
                        o.invoice_id
                      FROM orders o
                      WHERE o.id = $invoice_id";
        
        $orderResult = mysqli_query($conn, $orderQuery);
        
        if ($orderResult && mysqli_num_rows($orderResult) > 0) {
            $order = mysqli_fetch_assoc($orderResult);
            
            // If order has invoice_id, use that
            if (!empty($order['invoice_id'])) {
                $invQuery = "SELECT * FROM invoices WHERE id = " . $order['invoice_id'];
                $invResult = mysqli_query($conn, $invQuery);
                if ($invResult && mysqli_num_rows($invResult) > 0) {
                    $invoice = mysqli_fetch_assoc($invResult);
                } else {
                    // Create response from order data
                    $itemsQuery = "SELECT * FROM order_items WHERE order_id = " . $order['order_id'];
                    $itemsResult = mysqli_query($conn, $itemsQuery);
                    $items = [];
                    while ($item = mysqli_fetch_assoc($itemsResult)) {
                        $items[] = $item;
                    }

                    $company_name = '';
                    $company_address = '';
                    $company_phone = '';
                    $company_gstin = '';
                    $company_logo = '';
                    $company_gst_type = '';

                    $product_ids = array_unique(array_filter(array_map(function ($item) {
                        return intval($item['product_id'] ?? 0);
                    }, $items)));

                    if (count($product_ids) > 0) {
                        $product_id_list = implode(',', $product_ids);
                        $companyQuery = "SELECT p.company_id FROM products p WHERE p.id IN ($product_id_list) GROUP BY p.company_id LIMIT 1";
                        $companyResult = mysqli_query($conn, $companyQuery);
                        if ($companyResult && mysqli_num_rows($companyResult) > 0) {
                            $company_row = mysqli_fetch_assoc($companyResult);
                            $company_id = intval($company_row['company_id']);
                            if ($company_id > 0) {
                                $companyInfoQuery = "SELECT company_name, company_address, phone, gstin, logo, gst_type FROM companies WHERE id = $company_id LIMIT 1";
                                $companyInfoResult = mysqli_query($conn, $companyInfoQuery);
                                if ($companyInfoResult && mysqli_num_rows($companyInfoResult) > 0) {
                                    $companyInfo = mysqli_fetch_assoc($companyInfoResult);
                                    $company_name = $companyInfo['company_name'] ?? '';
                                    $company_address = $companyInfo['company_address'] ?? '';
                                    $company_phone = $companyInfo['phone'] ?? '';
                                    $company_gstin = $companyInfo['gstin'] ?? '';
                                    $company_logo = $companyInfo['logo'] ?? '';
                                    $company_gst_type = $companyInfo['gst_type'] ?? '';
                                }
                            }
                        }
                    }
                    
                    echo json_encode([
                        'status' => true,
                        'data' => [
                            'id' => $order['order_id'],
                            'invoice_no' => 'ORD-' . $order['order_id'],
                            'customer_name' => $order['customer_name'],
                            'customer_phone' => $order['mobile'],
                            'email' => $order['email'],
                            'shipping_address' => $order['shipping_address'],
                            'items' => $items,
                            'sub_total' => $order['total'],
                            'gst_total' => 0,
                            'total_amount' => $order['total'],
                            'paid_amount' => 0,
                            'balance_amount' => $order['total'],
                            'payment_method' => 'cash',
                            'payment_status' => $order['payment_status'],
                            'created_at' => $order['created_at'],
                            'company_name' => $company_name,
                            'company_address' => $company_address,
                            'company_phone' => $company_phone,
                            'company_gstin' => $company_gstin,
                            'company_logo' => $company_logo,
                            'company_gst_type' => $company_gst_type,
                        ]
                    ]);
                    exit;
                }
            } else {
                // No invoice found, create response from order
                $itemsQuery = "SELECT * FROM order_items WHERE order_id = " . $order['order_id'];
                $itemsResult = mysqli_query($conn, $itemsQuery);
                $items = [];
                while ($item = mysqli_fetch_assoc($itemsResult)) {
                    $items[] = $item;
                }

                $company_name = '';
                $company_address = '';
                $company_phone = '';
                $company_gstin = '';
                $company_logo = '';
                $company_gst_type = '';

                $product_ids = array_unique(array_filter(array_map(function ($item) {
                    return intval($item['product_id'] ?? 0);
                }, $items)));

                if (count($product_ids) > 0) {
                    $product_id_list = implode(',', $product_ids);
                    $companyQuery = "SELECT p.company_id FROM products p WHERE p.id IN ($product_id_list) GROUP BY p.company_id LIMIT 1";
                    $companyResult = mysqli_query($conn, $companyQuery);
                    if ($companyResult && mysqli_num_rows($companyResult) > 0) {
                        $company_row = mysqli_fetch_assoc($companyResult);
                        $company_id = intval($company_row['company_id']);
                        if ($company_id > 0) {
                            $companyInfoQuery = "SELECT company_name, company_address, phone, gstin, logo, gst_type FROM companies WHERE id = $company_id LIMIT 1";
                            $companyInfoResult = mysqli_query($conn, $companyInfoQuery);
                            if ($companyInfoResult && mysqli_num_rows($companyInfoResult) > 0) {
                                $companyInfo = mysqli_fetch_assoc($companyInfoResult);
                                $company_name = $companyInfo['company_name'] ?? '';
                                $company_address = $companyInfo['company_address'] ?? '';
                                $company_phone = $companyInfo['phone'] ?? '';
                                $company_gstin = $companyInfo['gstin'] ?? '';
                                $company_logo = $companyInfo['logo'] ?? '';
                                $company_gst_type = $companyInfo['gst_type'] ?? '';
                            }
                        }
                    }
                }
                
                echo json_encode([
                    'status' => true,
                    'data' => [
                        'id' => $order['order_id'],
                        'invoice_no' => 'ORD-' . $order['order_id'],
                        'customer_name' => $order['customer_name'],
                        'customer_phone' => $order['mobile'],
                        'email' => $order['email'],
                        'shipping_address' => $order['shipping_address'],
                        'items' => $items,
                        'sub_total' => $order['total'],
                        'gst_total' => 0,
                        'total_amount' => $order['total'],
                        'paid_amount' => 0,
                        'balance_amount' => $order['total'],
                        'payment_method' => 'cash',
                        'payment_status' => $order['payment_status'],
                        'created_at' => $order['created_at'],
                        'company_name' => $company_name,
                        'company_address' => $company_address,
                        'company_phone' => $company_phone,
                        'company_gstin' => $company_gstin,
                        'company_logo' => $company_logo,
                        'company_gst_type' => $company_gst_type,
                    ]
                ]);
                exit;
            }
        } else {
            echo json_encode([
                'status' => false,
                'message' => 'Invoice not found'
            ]);
            exit;
        }
    } else {
        $invoice = mysqli_fetch_assoc($result);
    }
    
    // Parse products JSON
    $products = json_decode($invoice['products'], true);
    $invoice['items'] = $products ?: [];
    unset($invoice['products']);
    
    // Get order details for this invoice
    $orderQuery = "SELECT 
                    o.id as order_id,
                    o.shipping_address,
                    o.mobile,
                    o.email
                  FROM orders o
                  WHERE o.invoice_id = " . $invoice['id'] . "
                  ORDER BY o.id DESC
                  LIMIT 1";
    
    $orderResult = mysqli_query($conn, $orderQuery);
    if ($orderResult && mysqli_num_rows($orderResult) > 0) {
        $order = mysqli_fetch_assoc($orderResult);
        $invoice['shipping_address'] = $order['shipping_address'] ?? '';
        $invoice['mobile'] = $order['mobile'] ?? '';
        $invoice['email'] = $order['email'] ?? '';
    }
    
    // Get payment details
    $payQuery = "SELECT 
                    p.id as payment_id,
                    p.paid_amount,
                    p.balance_amount,
                    p.payment_method,
                    p.payment_status,
                    p.created_at as payment_date
                  FROM payments p
                  WHERE p.invoice_id = " . $invoice['id'] . "
                  ORDER BY p.id DESC
                  LIMIT 1";
    
    $payResult = mysqli_query($conn, $payQuery);
    if ($payResult && mysqli_num_rows($payResult) > 0) {
        $payment = mysqli_fetch_assoc($payResult);
        $invoice['payment_id'] = $payment['payment_id'];
        $invoice['payment_date'] = $payment['payment_date'];
    }
    
    $response = [
        'id' => $invoice['id'],
        'invoice_no' => $invoice['invoice_no'],
        'customer_id' => $invoice['customer_id'],
        'customer_name' => $invoice['customer_name'],
        'customer_phone' => $invoice['customer_phone'],
        'email' => $invoice['email'] ?? '',
        'mobile' => $invoice['mobile'] ?? '',
        'shipping_address' => $invoice['shipping_address'] ?? '',
        'items' => $invoice['items'],
        'sub_total' => $invoice['sub_total'],
        'gst_total' => $invoice['gst_total'],
        'total_amount' => $invoice['total_amount'],
        'paid_amount' => $invoice['paid_amount'] ?? 0,
        'balance_amount' => $invoice['balance_amount'] ?? 0,
        'payment_method' => $invoice['payment_method'],
        'payment_type' => $invoice['payment_type'],
        'payment_status' => $invoice['payment_status'],
        'gst_type' => $invoice['gst_type'],
        'gst_no' => $invoice['gst_no'],
        'created_at' => $invoice['created_at'],
        'due_date' => $invoice['due_date'],
        'company_name' => $invoice['company_name'] ?? '',
        'company_address' => $invoice['company_address'] ?? '',
        'company_phone' => $invoice['company_phone'] ?? '',
        'company_gstin' => $invoice['company_gstin'] ?? '',
        'company_logo' => $invoice['company_logo'] ?? '',
        'company_gst_type' => $invoice['company_gst_type'] ?? '',
    ];
    
    echo json_encode([
        'status' => true,
        'data' => $response
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'status' => false,
        'message' => 'Error fetching invoice: ' . $e->getMessage()
    ]);
}
?>