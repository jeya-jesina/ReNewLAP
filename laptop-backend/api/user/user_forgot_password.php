<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ------------------- .env loader -------------------
function loadEnv($path) {
    if (!file_exists($path)) return;
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (strpos($line, '#') === 0) continue;
        $parts = explode('=', $line, 2);
        if (count($parts) !== 2) continue;
        $name = trim($parts[0]);
        $value = trim($parts[1]);
        putenv("$name=$value");
        $_ENV[$name] = $value;
        $_SERVER[$name] = $value;
    }
}
loadEnv(__DIR__ . '/../../.env');   // உங்கள் .env பாதைக்கு ஏற்ப மாற்றவும்

// ---------------------------------------------------
include "../../config/db.php";

// Include PHPMailer
require '../../PHPMailer/src/Exception.php';
require '../../PHPMailer/src/PHPMailer.php';
require '../../PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

$data = json_decode(file_get_contents("php://input"), true);
$email = trim($data['email'] ?? '');

if (!$email) {
    echo json_encode(["status" => false, "message" => "Email is required"]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status" => false, "message" => "Invalid email address"]);
    exit;
}

// Check if user exists
$userQuery = mysqli_query($conn, "SELECT id FROM frontend_users WHERE email='" . mysqli_real_escape_string($conn, $email) . "' LIMIT 1");
if (!$userQuery || mysqli_num_rows($userQuery) === 0) {
    echo json_encode(["status" => false, "message" => "If this email exists, a reset link has been sent"]);
    exit;
}

// Generate secure token
$token = bin2hex(random_bytes(32));
$expiry = date('Y-m-d H:i:s', strtotime('+1 hour'));

$insert = mysqli_query($conn, "INSERT INTO password_resets (email, token, expiry) VALUES (
    '" . mysqli_real_escape_string($conn, $email) . "',
    '" . mysqli_real_escape_string($conn, $token) . "',
    '" . mysqli_real_escape_string($conn, $expiry) . "'
)");

if (!$insert) {
    echo json_encode(["status" => false, "message" => "Failed to generate reset link: " . mysqli_error($conn)]);
    exit;
}

// Build reset link from env
$resetLink = getenv('RESET_URL') . '?token=' . urlencode($token);
// ---------- Send email via PHPMailer ----------
$mail = new PHPMailer(true);

try {
    $mail->SMTPDebug = 0;
    $mail->isSMTP();
    $mail->Host       = getenv('MAIL_HOST');
    $mail->SMTPAuth   = true;
    $mail->Username   = getenv('MAIL_USERNAME');
    $mail->Password   = getenv('MAIL_PASSWORD');
    $mail->SMTPSecure = getenv('MAIL_ENCRYPTION') === 'tls' ? PHPMailer::ENCRYPTION_STARTTLS : PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port       = getenv('MAIL_PORT');

    $mail->setFrom(getenv('MAIL_FROM'), getenv('MAIL_FROM_NAME'));
    $mail->addAddress($email);

    $mail->isHTML(false);
    $mail->Subject = 'Password Reset Request';
    $mail->Body    = "Hello,\n\nYou requested a password reset. Click the link below to set a new password:\n\n$resetLink\n\nIf you did not request this, please ignore this email.";

    $mail->send();
    $mailSent = true;
} catch (Exception $e) {
    error_log("PHPMailer Error: " . $mail->ErrorInfo);
    $mailSent = false;
}

if ($mailSent) {
    echo json_encode(["status" => true, "message" => "If this email exists, a reset link has been sent"]);
} else {
    echo json_encode(["status" => true, "message" => "If this email exists, a reset link has been sent"]);
}
?>