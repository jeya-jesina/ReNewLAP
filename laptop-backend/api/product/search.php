<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include __DIR__ . '/../../config/db.php';

$q = trim($_GET['q'] ?? '');
$category_id = intval($_GET['category_id'] ?? 0);
$min_price = is_numeric($_GET['min_price'] ?? null) ? floatval($_GET['min_price']) : 0.0;
$max_price = is_numeric($_GET['max_price'] ?? null) ? floatval($_GET['max_price']) : 0.0;
$availability = trim($_GET['availability'] ?? '');
$limit = intval($_GET['limit'] ?? 0);
$sort = trim($_GET['sort'] ?? '');

function normalizeText(string $text): string {
    $text = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $text);
    $text = preg_replace('/\s+/', ' ', mb_strtolower($text));
    return trim($text);
}

function parsePriceValue(string $value): float {
    $value = trim($value);
    $value = str_replace([',', '₹', 'Rs', 'rs', 'inr'], '', $value);
    if (preg_match('/^(\d+(?:\.\d+)?)[kK]$/', $value, $matches)) {
        return floatval($matches[1]) * 1000;
    }
    return floatval($value);
}

function extractPriceFilters(string $query, float &$minPrice, float &$maxPrice): string {
    $patterns = [
        '/\b(?:between|from)\s*₹?\s*([0-9.,kK]+)\s*(?:and|to)\s*₹?\s*([0-9.,kK]+)\b/i',
        '/\b(?:under|below|less than)\s*₹?\s*([0-9.,kK]+)\b/i',
        '/\b(?:over|above|more than)\s*₹?\s*([0-9.,kK]+)\b/i',
    ];

    if (preg_match($patterns[0], $query, $matches)) {
        $minPrice = parsePriceValue($matches[1]);
        $maxPrice = parsePriceValue($matches[2]);
        $query = str_ireplace($matches[0], '', $query);
    } elseif (preg_match($patterns[1], $query, $matches)) {
        $maxPrice = parsePriceValue($matches[1]);
        $query = str_ireplace($matches[0], '', $query);
    } elseif (preg_match($patterns[2], $query, $matches)) {
        $minPrice = parsePriceValue($matches[1]);
        $query = str_ireplace($matches[0], '', $query);
    } elseif (preg_match('/\b([0-9]+(?:\.[0-9]+)?)[kK]?\b/', $query, $matches)) {
        $value = parsePriceValue($matches[0]);
        if ($value >= 1000) {
            $maxPrice = $value;
            $query = str_ireplace($matches[0], '', $query);
        }
    }

    return normalizeText($query);
}

function extractAttributeTerms(string $query, array $terms): array {
    $found = [];
    foreach ($terms as $term) {
        if (preg_match('/\b' . preg_quote($term, '/') . '\b/i', $query)) {
            $found[] = $term;
        }
    }
    return array_values(array_unique($found));
}

function findCategoryIdsByQuery($conn, string $query): array {
    $query = trim($query);
    if ($query === '') {
        return [];
    }

    $words = array_filter(explode(' ', $query), fn($word) => mb_strlen($word) > 1);
    $ids = [];

    foreach ($words as $word) {
        $like = "%{$word}%";
        $stmt = mysqli_prepare($conn, "SELECT id FROM categories WHERE is_deleted=0 AND status='active' AND name LIKE ? LIMIT 10");
        if (!$stmt) {
            continue;
        }
        mysqli_stmt_bind_param($stmt, 's', $like);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        while ($row = mysqli_fetch_assoc($result)) {
            $ids[] = $row['id'];
        }
        mysqli_stmt_close($stmt);
    }

    return array_values(array_unique($ids));
}

$cleanQuery = normalizeText($q);
$cleanQuery = extractPriceFilters($cleanQuery, $min_price, $max_price);
$colorTerms = extractAttributeTerms($cleanQuery, [
    'red', 'pink', 'blue', 'green', 'white', 'black', 'gold', 'silver', 'maroon', 'cream', 'peach', 'yellow', 'purple', 'orange', 'beige', 'brown', 'ivory', 'magenta', 'navy', 'turquoise', 'mint', 'coral', 'lavender', 'teal', 'bronze', 'champagne', 'rose gold'
]);
$fabricTerms = extractAttributeTerms($cleanQuery, [
    'silk', 'satin', 'chiffon', 'georgette', 'net', 'velvet', 'cotton', 'linen', 'organza', 'brocade', 'crepe', 'jacquard', 'tulle', 'rayon', 'modal'
]);
$occasionTerms = extractAttributeTerms($cleanQuery, [
    'wedding', 'bridal', 'reception', 'engagement', 'party', 'festival', 'sangeet', 'mehndi', 'cocktail', 'ceremony', 'anniversary', 'bridemaid'
]);
$workTypeTerms = extractAttributeTerms($cleanQuery, [
    'embroidery', 'sequins', 'mirror', 'zari', 'zardosi', 'bead', 'stone', 'handwork', 'thread', 'print', 'handloom', 'patch', 'lurex'
]);

$categoryIdsFromQuery = findCategoryIdsByQuery($conn, $cleanQuery);

$query = "SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.active_status=1 AND p.is_deleted=0";
$params = [];
$types = "";

if ($category_id > 0) {
    $query .= " AND p.category_id = ?";
    $params[] = $category_id;
    $types .= 'i';
} elseif (!empty($categoryIdsFromQuery)) {
    $placeholders = implode(',', array_fill(0, count($categoryIdsFromQuery), '?'));
    $query .= " AND p.category_id IN ({$placeholders})";
    foreach ($categoryIdsFromQuery as $categoryId) {
        $params[] = $categoryId;
        $types .= 'i';
    }
}

$searchValue = '';
if ($cleanQuery !== '') {
    $searchValue = "%{$cleanQuery}%";

    $query .= " AND (";
    $query .= "p.product_name LIKE ? OR c.name LIKE ? OR p.keywords LIKE ? OR p.short_description LIKE ? OR p.full_description LIKE ? OR p.fabric LIKE ? OR p.color LIKE ? OR p.occasion LIKE ? OR p.embroidery LIKE ?";
    $query .= " OR SOUNDEX(p.product_name)=SOUNDEX(?) OR SOUNDEX(c.name)=SOUNDEX(?) OR SOUNDEX(p.keywords)=SOUNDEX(?)";
    $query .= ")";

    for ($i = 0; $i < 9; $i++) {
        $params[] = $searchValue;
        $types .= 's';
    }
    for ($i = 0; $i < 3; $i++) {
        $params[] = $cleanQuery;
        $types .= 's';
    }
}

if (!empty($colorTerms)) {
    $query .= " AND (" . implode(' OR ', array_fill(0, count($colorTerms), 'p.color LIKE ?')) . ")";
    foreach ($colorTerms as $term) {
        $params[] = "%{$term}%";
        $types .= 's';
    }
}

if (!empty($fabricTerms)) {
    $query .= " AND (" . implode(' OR ', array_fill(0, count($fabricTerms), 'p.fabric LIKE ?')) . ")";
    foreach ($fabricTerms as $term) {
        $params[] = "%{$term}%";
        $types .= 's';
    }
}

if (!empty($occasionTerms)) {
    $query .= " AND (" . implode(' OR ', array_fill(0, count($occasionTerms), 'p.occasion LIKE ?')) . ")";
    foreach ($occasionTerms as $term) {
        $params[] = "%{$term}%";
        $types .= 's';
    }
}

if (!empty($workTypeTerms)) {
    $query .= " AND (" . implode(' OR ', array_fill(0, count($workTypeTerms), 'p.embroidery LIKE ?')) . ")";
    foreach ($workTypeTerms as $term) {
        $params[] = "%{$term}%";
        $types .= 's';
    }
}

if ($min_price > 0) {
    $query .= " AND p.price >= ?";
    $params[] = $min_price;
    $types .= 'd';
}

if ($max_price > 0) {
    $query .= " AND p.price <= ?";
    $params[] = $max_price;
    $types .= 'd';
}

if ($availability === 'in_stock') {
    $query .= " AND p.stock > 0";
} elseif ($availability === 'out_of_stock') {
    $query .= " AND p.stock <= 0";
}

$allowedSorts = [
    'price_asc' => 'p.price ASC',
    'price_desc' => 'p.price DESC',
    'newest' => 'p.id DESC',
];

$orderBy = $allowedSorts[$sort] ?? 'p.id DESC';
$query .= " ORDER BY {$orderBy}";

if ($limit > 0) {
    $query .= " LIMIT ?";
    $params[] = $limit;
    $types .= 'i';
}

$stmt = mysqli_prepare($conn, $query);
if (!$stmt) {
    echo json_encode(["status" => false, "message" => "Failed to prepare search query: " . mysqli_error($conn)]);
    exit;
}

if (!empty($params)) {
    $bindParams = [];
    $bindParams[] = &$types;
    foreach ($params as $index => $value) {
        $bindParams[] = &$params[$index];
    }

    call_user_func_array([$stmt, 'bind_param'], $bindParams);
}

if (!mysqli_stmt_execute($stmt)) {
    echo json_encode(["status" => false, "message" => "Search execution failed: " . mysqli_stmt_error($stmt)]);
    exit;
}

$result = mysqli_stmt_get_result($stmt);
$data = [];

while ($row = mysqli_fetch_assoc($result)) {
    if (empty($row['image_gallery_json'])) {
        $row['image_gallery_json'] = json_encode([]);
    }
    $data[] = $row;
}

mysqli_stmt_close($stmt);

echo json_encode(["status" => true, "data" => $data]);
