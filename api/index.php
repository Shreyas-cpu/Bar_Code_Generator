<?php
/**
 * index.php — Main API router.
 * Handles all frontend API requests and talks directly to MySQL via PDO.
 * Replaces the Node.js Express backend (server/index.js).
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight CORS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';

// Parse the request
$method = $_SERVER['REQUEST_METHOD'];

// Get the path relative to the api folder
$requestUri = $_SERVER['REQUEST_URI'];
// Remove query string
$path = parse_url($requestUri, PHP_URL_PATH);

// Remove the base path up to and including /api
// This handles both /api/products and /subdir/api/products
$apiPos = strpos($path, '/api');
if ($apiPos !== false) {
    $path = substr($path, $apiPos + 4); // +4 to skip "/api"
} else {
    // If accessed directly in the api folder (e.g., /products)
    $scriptDir = dirname($_SERVER['SCRIPT_NAME']);
    $path = substr($path, strlen($scriptDir));
}
$path = '/' . ltrim($path, '/');

// Get JSON body for POST/PUT
$body = json_decode(file_get_contents('php://input'), true) ?? [];

// Connect to DB
$pdo = getDbConnection();

// ============================================================
// ROUTING
// ============================================================

// --- AUTH: POST /auth/login ---
if ($path === '/auth/login' && $method === 'POST') {
    $username = $body['username'] ?? '';
    $password = $body['password'] ?? '';

    $stmt = $pdo->prepare('SELECT id, username, password, isAdmin FROM users WHERE username = ?');
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        unset($user['password']); // Never send password hash to frontend
        $user['isAdmin'] = (bool)$user['isAdmin'];
        echo json_encode(['user' => $user]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid User ID or Password']);
    }
    exit;
}

// --- USERS: GET /users ---
if ($path === '/users' && $method === 'GET') {
    $stmt = $pdo->query('SELECT id, username, isAdmin FROM users');
    $users = $stmt->fetchAll();
    // Convert isAdmin to boolean
    foreach ($users as &$u) {
        $u['isAdmin'] = (bool)$u['isAdmin'];
    }
    echo json_encode($users);
    exit;
}

// --- USERS: POST /users ---
if ($path === '/users' && $method === 'POST') {
    $username = $body['username'] ?? '';
    $password = $body['password'] ?? '';
    $isAdmin  = !empty($body['isAdmin']) ? 1 : 0;
    $id = 'user-' . round(microtime(true) * 1000);

    try {
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $pdo->prepare('INSERT INTO users (id, username, password, isAdmin) VALUES (?, ?, ?, ?)');
        $stmt->execute([$id, $username, $hashedPassword, $isAdmin]);
        echo json_encode(['success' => true, 'id' => $id]);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) { // Duplicate entry
            http_response_code(400);
            echo json_encode(['error' => 'User ID already exists']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Database error']);
        }
    }
    exit;
}

// --- USERS: DELETE /users/:id ---
if (preg_match('#^/users/(.+)$#', $path, $matches) && $method === 'DELETE') {
    $id = urldecode($matches[1]);

    if ($id === 'admin-0') {
        http_response_code(403);
        echo json_encode(['error' => 'Cannot delete primary admin']);
        exit;
    }

    $stmt = $pdo->prepare('DELETE FROM users WHERE id = ?');
    $stmt->execute([$id]);

    $stmt = $pdo->prepare('DELETE FROM products WHERE userId = ?');
    $stmt->execute([$id]);

    echo json_encode(['success' => true]);
    exit;
}

// --- PRODUCTS: GET /products ---
if ($path === '/products' && $method === 'GET') {
    // Return ALL products with a LEFT JOIN to get the username of who added each product
    $stmt = $pdo->query(
        'SELECT p.*, u.username FROM products p LEFT JOIN users u ON p.userId = u.id ORDER BY p.createdAt DESC'
    );
    $products = $stmt->fetchAll();

    // Convert numeric strings to proper types for JSON
    foreach ($products as &$p) {
        $p['mrp'] = (float)$p['mrp'];
        if ($p['sellingPrice'] !== null) {
            $p['sellingPrice'] = (float)$p['sellingPrice'];
        }
    }

    echo json_encode($products);
    exit;
}

// --- PRODUCTS: POST /products ---
if ($path === '/products' && $method === 'POST') {
    $id           = $body['id'] ?? '';
    $name         = $body['name'] ?? '';
    $mrp          = $body['mrp'] ?? 0;
    $sellingPrice = array_key_exists('sellingPrice', $body) ? $body['sellingPrice'] : null;
    $barcode      = $body['barcode'] ?? '';
    $code         = $body['code'] ?? '';
    $category     = $body['category'] ?? '';
    $createdAt    = $body['createdAt'] ?? null;
    $userId       = $body['userId'] ?? '';

    try {
        $stmt = $pdo->prepare(
            'INSERT INTO products (id, name, mrp, sellingPrice, barcode, code, category, createdAt, userId) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([$id, $name, $mrp, $sellingPrice, $barcode, $code, $category, $createdAt, $userId]);
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
    exit;
}

// --- PRODUCTS: PUT /products/:id ---
if (preg_match('#^/products/(.+)$#', $path, $matches) && $method === 'PUT') {
    $id = urldecode($matches[1]);

    if (empty($body)) {
        echo json_encode(['success' => true]);
        exit;
    }

    // Build dynamic SET clause
    $setClauses = [];
    $values = [];
    foreach ($body as $key => $value) {
        // Only allow known columns to prevent SQL injection
        $allowedColumns = ['name', 'mrp', 'sellingPrice', 'barcode', 'code', 'category', 'createdAt', 'userId'];
        if (in_array($key, $allowedColumns)) {
            $setClauses[] = "`$key` = ?";
            $values[] = $value;
        }
    }

    if (empty($setClauses)) {
        echo json_encode(['success' => true]);
        exit;
    }

    $values[] = $id;
    $sql = 'UPDATE products SET ' . implode(', ', $setClauses) . ' WHERE id = ?';

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($values);
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
    exit;
}

// --- PRODUCTS: DELETE /products/:id ---
if (preg_match('#^/products/(.+)$#', $path, $matches) && $method === 'DELETE') {
    $id = urldecode($matches[1]);

    $stmt = $pdo->prepare('DELETE FROM products WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
    exit;
}

// --- SETTINGS: GET /settings ---
if ($path === '/settings' && $method === 'GET') {
    $stmt = $pdo->query('SELECT * FROM settings');
    $rows = $stmt->fetchAll();

    $settings = new stdClass();
    foreach ($rows as $row) {
        $decoded = json_decode($row['value'], true);
        $settings->{$row['key']} = ($decoded !== null) ? $decoded : $row['value'];
    }
    echo json_encode($settings);
    exit;
}

// --- SETTINGS: POST /settings ---
if ($path === '/settings' && $method === 'POST') {
    $key   = $body['key'] ?? '';
    $value = $body['value'] ?? '';

    $strValue = is_array($value) || is_object($value) ? json_encode($value) : (string)$value;

    $stmt = $pdo->prepare(
        'INSERT INTO settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)'
    );
    $stmt->execute([$key, $strValue]);
    echo json_encode(['success' => true]);
    exit;
}

// --- 404 Fallback ---
http_response_code(404);
echo json_encode(['error' => 'Endpoint not found', 'path' => $path, 'method' => $method]);
