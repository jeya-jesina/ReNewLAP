<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true) ?: [];
$product_name = trim($data['product_name'] ?? '');
$category_name = trim($data['category_name'] ?? '');
$description = trim($data['description'] ?? '');
$price = trim($data['price'] ?? '');
$color = trim($data['color'] ?? '');
$fabric = trim($data['fabric'] ?? '');
$work_type = trim($data['work_type'] ?? '');
$occasion = trim($data['occasion'] ?? '');
$additional = trim($data['additional'] ?? '');

$apiConfig = include __DIR__ . '/../../config/ai_keys.php';
$apiKey = trim($apiConfig['gemini_api_key'] ?? '');
$model = trim($apiConfig['gemini_model'] ?? '');

$validModels = [
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-1.5-flash',
];
if (!in_array($model, $validModels, true)) {
    $model = 'gemini-2.5-flash';
}

function findCaCertFile(): string {
    $candidates = [
        ini_get('curl.cainfo'),
        ini_get('openssl.cafile'),
        dirname(PHP_BINARY) . DIRECTORY_SEPARATOR . 'extras' . DIRECTORY_SEPARATOR . 'ssl' . DIRECTORY_SEPARATOR . 'cacert.pem',
        'C:\\wamp64\\bin\\php\\php8.3.14\\extras\\ssl\\cacert.pem',
        'C:\\wamp64\\bin\\php\\php8.2.26\\extras\\ssl\\cacert.pem',
        'C:\\wamp64\\apps\\phpmyadmin5.2.1\\vendor\\composer\\ca-bundle\\res\\cacert.pem',
    ];

    foreach ($candidates as $path) {
        if (!empty($path) && file_exists($path)) {
            return $path;
        }
    }

    return '';
}

function respondError(string $message, array $context = []): void {
    $payload = array_merge(['status' => false, 'message' => $message], $context);
    echo json_encode($payload);
    exit;
}

function normalizeKeywordParts(string $rawText): string {
    $segments = preg_split('/[\n;]+|,+/', $rawText);
    $seen = [];
    $cleanKeywords = [];

    foreach ($segments as $segment) {
        $keyword = trim($segment, " \t\n\r\0\x0B\"' .");
        $keyword = preg_replace('/\s+/', ' ', $keyword);
        if ($keyword === '') {
            continue;
        }
        $lowercase = mb_strtolower($keyword);
        if (isset($seen[$lowercase])) {
            continue;
        }
        $seen[$lowercase] = true;
        $cleanKeywords[] = $keyword;
    }

    return implode(', ', $cleanKeywords);
}

if (!$product_name || !$description) {
    respondError('Product name and description are required.');
}

if (!$apiKey) {
    respondError('AI API key not configured.');
}

$prompt = "Generate 30-60 high quality search keywords for the following bridal product. Return comma-separated keywords only, no sentences or extra text. Only include keywords directly related to this product.\n" .
          "Product Name: {$product_name}\n" .
          "Category: {$category_name}\n" .
          "Description: {$description}\n" .
          "Price: {$price}\n" .
          "Color: {$color}\n" .
          "Fabric: {$fabric}\n" .
          "Work Type: {$work_type}\n" .
          "Occasion: {$occasion}\n" .
          "Additional attributes: {$additional}\n" .
          "Include SEO keywords, shopping keywords, common search terms, singular and plural forms, bridal terms, wedding terms, Indian fashion terms, synonyms, alternative spellings, and long-tail keywords.";

$endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . urlencode($apiKey);
$requestBody = [
    'contents' => [
        [
            'parts' => [
                [
                    'text' => $prompt,
                ],
            ],
        ],
    ],
    'generationConfig' => [
        'temperature' => 0.6,
        'topP' => 0.95,
        'maxOutputTokens' => 300,
    ],
];

$ch = curl_init($endpoint);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($requestBody),
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
    ],
    CURLOPT_TIMEOUT => 30,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
    CURLOPT_FAILONERROR => false,
]);

$caFile = findCaCertFile();
if ($caFile) {
    curl_setopt($ch, CURLOPT_CAINFO, $caFile);
}

$response = curl_exec($ch);
$curlErr = curl_error($ch);
$curlErrno = curl_errno($ch);
$httpCode = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
curl_close($ch);

if ($curlErrno) {
    $message = "AI request failed: {$curlErr}";
    if (stripos($curlErr, 'SSL certificate problem') !== false || stripos($curlErr, 'unable to get local issuer certificate') !== false) {
        $message .= ' | Local WAMP SSL certificate verification failed. Ensure php.ini has curl.cainfo and openssl.cafile set to a valid cacert.pem, then restart Apache. Example:\n' .
                    'curl.cainfo = "C:/wamp64/bin/php/php8.3.14/extras/ssl/cacert.pem"\n' .
                    'openssl.cafile = "C:/wamp64/bin/php/php8.3.14/extras/ssl/cacert.pem"';
    }

    respondError($message, [
        'curl_errno' => $curlErrno,
        'ca_file' => $caFile,
        'curl_cainfo' => ini_get('curl.cainfo'),
        'openssl_cafile' => ini_get('openssl.cafile'),
        'openssl_capath' => ini_get('openssl.capath'),
    ]);
}

if ($httpCode < 200 || $httpCode >= 300) {
    respondError("Gemini API returned HTTP {$httpCode}.", [
        'http_code' => $httpCode,
        'response_body' => $response,
        'ca_file' => $caFile,
        'curl_cainfo' => ini_get('curl.cainfo'),
        'openssl_cafile' => ini_get('openssl.cafile'),
        'openssl_capath' => ini_get('openssl.capath'),
    ]);
}

$decoded = json_decode($response, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    respondError('Invalid JSON returned by Gemini API: ' . json_last_error_msg(), [
        'response_body' => $response,
        'http_code' => $httpCode,
    ]);
}

if (isset($decoded['error'])) {
    $errorMessage = is_string($decoded['error']) ? $decoded['error'] : json_encode($decoded['error']);
    respondError('Gemini API returned an error: ' . $errorMessage, ['response_json' => $decoded]);
}

if (!isset($decoded['candidates'][0]['content']['parts'][0]['text']) || !is_string($decoded['candidates'][0]['content']['parts'][0]['text'])) {
    respondError('Gemini API returned no text candidate.', ['response_json' => $decoded]);
}

$generatedText = trim($decoded['candidates'][0]['content']['parts'][0]['text']);
if ($generatedText === '') {
    respondError('Gemini API returned empty text.', ['response_json' => $decoded]);
}

$output = normalizeKeywordParts($generatedText);
if ($output === '') {
    respondError('AI returned empty keywords.');
}

echo json_encode(['status' => true, 'data' => $output]);
