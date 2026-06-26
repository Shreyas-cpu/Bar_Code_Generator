<?php
/**
 * init.php — One-time database table setup.
 * Visit this URL in your browser ONCE after uploading to create the tables
 * and seed the default admin user.
 *
 * Example: https://print.developeradda.com/api/init.php
 */

header('Content-Type: application/json');

require_once __DIR__ . '/db.php';

// First, load env and create the database if it doesn't exist
loadEnv(__DIR__ . '/.env');
$host = getenv('DB_HOST') ?: 'localhost';
$port = getenv('DB_PORT') ?: '3306';
$user = getenv('DB_USER') ?: 'root';
$password = getenv('DB_PASSWORD') ?: '';
$dbname = getenv('DB_NAME') ?: 'barcode_generator';

try {
    $tempPdo = new PDO("mysql:host=$host;port=$port;charset=utf8mb4", $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
    $tempPdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname`");
    $tempPdo = null;
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Could not create database: ' . $e->getMessage()]);
    exit;
}

$pdo = getDbConnection();
$results = ['Database created/verified: OK'];

try {
    // Create users table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(255) PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            isAdmin TINYINT(1) DEFAULT 0
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    $results[] = 'users table: OK';

    // Create products table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS products (
            id VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            mrp DECIMAL(10, 2) NOT NULL,
            sellingPrice DECIMAL(10, 2),
            barcode VARCHAR(255) NOT NULL,
            code VARCHAR(255) NOT NULL,
            category VARCHAR(255) NOT NULL,
            userId VARCHAR(255) NOT NULL,
            createdAt VARCHAR(255) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    $results[] = 'products table: OK';

    // Create settings table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS settings (
            `key` VARCHAR(255) PRIMARY KEY,
            value TEXT NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    $results[] = 'settings table: OK';

    // Force recreate default admin user to ensure password hash is correct
    $stmt = $pdo->prepare('DELETE FROM users WHERE id = ?');
    $stmt->execute(['admin-0']);

    $hashedPassword = password_hash('etzel@2026', PASSWORD_BCRYPT);
    $stmt = $pdo->prepare('INSERT INTO users (id, username, password, isAdmin) VALUES (?, ?, ?, ?)');
    $stmt->execute(['admin-0', 'etzel@2026', $hashedPassword, 1]);
    $results[] = 'Default admin user (etzel@2026) force-recreated with encrypted password';

    echo json_encode([
        'success' => true,
        'message' => 'Database initialized successfully',
        'details' => $results
    ], JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'details' => $results
    ], JSON_PRETTY_PRINT);
}
