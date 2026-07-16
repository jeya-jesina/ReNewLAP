<?php
$host = "localhost";
$user = "root";
$pass = "";
$db   = "billing_software";

$conn = mysqli_connect($host, $user, $pass, $db);

if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

function addColumnIfNotExists($conn, $table, $column, $definition) {
    $column = mysqli_real_escape_string($conn, $column);
    $result = mysqli_query($conn, "SHOW COLUMNS FROM `$table` LIKE '$column'");
    if ($result && mysqli_num_rows($result) === 0) {
        return mysqli_query($conn, "ALTER TABLE `$table` ADD COLUMN $column $definition");
    }
    return $result !== false;
}

function removeColumnIfExists($conn, $table, $column) {
    $column = mysqli_real_escape_string($conn, $column);
    $result = mysqli_query($conn, "SHOW COLUMNS FROM `$table` LIKE '$column'");
    if ($result && mysqli_num_rows($result) > 0) {
        return mysqli_query($conn, "ALTER TABLE `$table` DROP COLUMN `$column`");
    }
    return true;
}

mysqli_query($conn, "CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT DEFAULT 0,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) DEFAULT '',
    banner_image VARCHAR(500) DEFAULT '',
    status VARCHAR(50) DEFAULT 'active',
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

mysqli_query($conn, "CREATE TABLE IF NOT EXISTS banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    banner_title VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    image VARCHAR(500) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

addColumnIfNotExists($conn, 'categories', 'banner_image', 'VARCHAR(500) DEFAULT ""');
addColumnIfNotExists($conn, 'wishlist', 'size', 'VARCHAR(100) DEFAULT ""');
addColumnIfNotExists($conn, 'cart', 'size', 'VARCHAR(100) DEFAULT ""');
addColumnIfNotExists($conn, 'order_items', 'size', 'VARCHAR(100) DEFAULT ""');

mysqli_query($conn, "CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    product_code VARCHAR(100) DEFAULT '',
    category_id INT DEFAULT 0,
    company_id INT DEFAULT 0,
    price DECIMAL(10,2) DEFAULT 0.00,
    stock INT DEFAULT 0,
    barcode VARCHAR(100) DEFAULT '',
    unit VARCHAR(20) DEFAULT '',
    gst_percentage DECIMAL(5,2) DEFAULT 0.00,
    short_description TEXT DEFAULT NULL,
    full_description TEXT DEFAULT NULL,
    fabric VARCHAR(255) DEFAULT '',
    embroidery VARCHAR(255) DEFAULT '',
    color VARCHAR(255) DEFAULT '',
    available_sizes VARCHAR(255) DEFAULT '',
    occasion VARCHAR(255) DEFAULT '',
    keywords TEXT DEFAULT NULL,
    image VARCHAR(500) DEFAULT '',
    image_gallery_json TEXT DEFAULT NULL,
    video_url VARCHAR(500) DEFAULT '',
    active_status TINYINT(1) DEFAULT 1,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

removeColumnIfExists($conn, 'products', 'sku');
removeColumnIfExists($conn, 'products', 'subcategory');
removeColumnIfExists($conn, 'products', 'collection');
removeColumnIfExists($conn, 'products', 'designer');
removeColumnIfExists($conn, 'products', 'brand');
removeColumnIfExists($conn, 'products', 'offer_price');
removeColumnIfExists($conn, 'products', 'discount_percentage');
removeColumnIfExists($conn, 'products', 'stock_quantity');
removeColumnIfExists($conn, 'products', 'material');
removeColumnIfExists($conn, 'products', 'pattern');
removeColumnIfExists($conn, 'products', 'work_type');
removeColumnIfExists($conn, 'products', 'sleeve_type');
removeColumnIfExists($conn, 'products', 'neck_design');
removeColumnIfExists($conn, 'products', 'fit');
removeColumnIfExists($conn, 'products', 'size_chart');
removeColumnIfExists($conn, 'products', 'weight');
removeColumnIfExists($conn, 'products', 'wash_care');
removeColumnIfExists($conn, 'products', 'blouse_details');
removeColumnIfExists($conn, 'products', 'dupatta_details');
removeColumnIfExists($conn, 'products', 'shipping_weight');
removeColumnIfExists($conn, 'products', 'estimated_delivery_days');
removeColumnIfExists($conn, 'products', 'return_policy');
removeColumnIfExists($conn, 'products', 'product_tags');
addColumnIfNotExists($conn, 'products', 'keywords', 'TEXT DEFAULT NULL');
removeColumnIfExists($conn, 'products', 'seo_title');
removeColumnIfExists($conn, 'products', 'seo_description');
removeColumnIfExists($conn, 'products', 'featured_product');
removeColumnIfExists($conn, 'products', 'trending_product');
removeColumnIfExists($conn, 'products', 'best_seller');
removeColumnIfExists($conn, 'products', 'new_arrival');
removeColumnIfExists($conn, 'products', 'status');


mysqli_query($conn, "CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_path VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

mysqli_query($conn, "CREATE TABLE IF NOT EXISTS product_videos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    video_path VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

mysqli_query($conn, "CREATE TABLE IF NOT EXISTS wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guest_id VARCHAR(100) NOT NULL,
    product_id INT NOT NULL,
    size VARCHAR(100) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

mysqli_query($conn, "CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guest_id VARCHAR(100) NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    price DECIMAL(10,2) DEFAULT 0.00,
    size VARCHAR(100) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

mysqli_query($conn, "CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guest_id VARCHAR(100) NOT NULL,
    customer_name VARCHAR(255) DEFAULT '',
    email VARCHAR(255) DEFAULT '',
    mobile VARCHAR(255) DEFAULT '',
    shipping_address TEXT DEFAULT NULL,
    total DECIMAL(10,2) DEFAULT 0.00,
    payment_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

mysqli_query($conn, "CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) DEFAULT '',
    price DECIMAL(10,2) DEFAULT 0.00,
    quantity INT DEFAULT 1,
    size VARCHAR(100) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

addColumnIfNotExists($conn, 'order_items', 'gst_percentage', 'DECIMAL(5,2) DEFAULT 0');
addColumnIfNotExists($conn, 'orders', 'invoice_id', 'INT DEFAULT NULL');

mysqli_query($conn, "CREATE TABLE IF NOT EXISTS frontend_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    reset_token VARCHAR(255) DEFAULT NULL,
    reset_token_expiry DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

addColumnIfNotExists($conn, 'invoices', 'company_name', 'VARCHAR(255) DEFAULT NULL');
addColumnIfNotExists($conn, 'invoices', 'company_address', 'TEXT DEFAULT NULL');
addColumnIfNotExists($conn, 'invoices', 'company_phone', 'VARCHAR(50) DEFAULT NULL');
addColumnIfNotExists($conn, 'invoices', 'company_gstin', 'VARCHAR(50) DEFAULT NULL');
?>
