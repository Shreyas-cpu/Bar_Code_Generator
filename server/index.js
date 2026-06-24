import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

let pool;

// Initialize database
console.log("Loaded DB_PORT from env:", process.env.DB_PORT);
async function initDb() {
  // First, create the database if it doesn't exist
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'sgbadmin_print',
    password: process.env.DB_PASSWORD || 'Print@2026#'
  });
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'sgbadmin_print'}\``);
  await connection.end();

  // Now create the pool connected to the database
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'sgbadmin_print',
    password: process.env.DB_PASSWORD || 'Print@2026#',
    database: process.env.DB_NAME || 'sgbadmin_print',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  // Create users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      isAdmin TINYINT(1) DEFAULT 0
    )
  `);

  // Create products table
  await pool.query(`
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
    )
  `);

  // Create settings table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      \`key\` VARCHAR(255) PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // Seed default admin if no users exist
  const [users] = await pool.query('SELECT * FROM users WHERE username = ?', ['ETZEL']);
  if (users.length === 0) {
    await pool.query(
      'INSERT INTO users (id, username, password, isAdmin) VALUES (?, ?, ?, ?)',
      ['admin-0', 'ETZEL', 'ETZEL1029', 1]
    );
    console.log('Seeded default admin user');
  }

  console.log('Database initialized');
}

// --- Auth & Users ---
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const [users] = await pool.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
  if (users.length > 0) {
    res.json({ user: users[0] });
  } else {
    res.status(401).json({ error: 'Invalid User ID or Password' });
  }
});

app.get('/api/users', async (req, res) => {
  const [users] = await pool.query('SELECT id, username, isAdmin FROM users');
  res.json(users);
});

app.post('/api/users', async (req, res) => {
  const { username, password, isAdmin } = req.body;
  try {
    const id = 'user-' + Date.now();
    await pool.query(
      'INSERT INTO users (id, username, password, isAdmin) VALUES (?, ?, ?, ?)',
      [id, username, password, isAdmin ? 1 : 0]
    );
    res.json({ success: true, id });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'User ID already exists' });
    } else {
      res.status(500).json({ error: 'Database error' });
    }
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  if (id === 'admin-0') {
    return res.status(403).json({ error: 'Cannot delete primary admin' });
  }
  await pool.query('DELETE FROM users WHERE id = ?', [id]);
  await pool.query('DELETE FROM products WHERE userId = ?', [id]);
  res.json({ success: true });
});

// --- Products ---
app.get('/api/products', async (req, res) => {
  const { userId } = req.query;
  const [products] = await pool.query('SELECT * FROM products WHERE userId = ?', [userId]);
  res.json(products);
});

app.post('/api/products', async (req, res) => {
  const { id, name, mrp, sellingPrice, barcode, code, category, createdAt, userId } = req.body;
  try {
    await pool.query(
      'INSERT INTO products (id, name, mrp, sellingPrice, barcode, code, category, createdAt, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id, 
        name, 
        mrp, 
        sellingPrice === undefined ? null : sellingPrice, 
        barcode, 
        code, 
        category === undefined ? '' : category, 
        createdAt === undefined ? null : createdAt, 
        userId
      ]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  if (Object.keys(updates).length === 0) {
    return res.json({ success: true });
  }

  const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const values = Object.values(updates).map(v => v === undefined ? null : v);

  try {
    await pool.query(
      `UPDATE products SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM products WHERE id = ?', [id]);
  res.json({ success: true });
});

// --- Settings ---
app.get('/api/settings', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM settings');
  const settings = {};
  rows.forEach(r => {
    try {
      settings[r.key] = JSON.parse(r.value);
    } catch {
      settings[r.key] = r.value;
    }
  });
  res.json(settings);
});

app.post('/api/settings', async (req, res) => {
  const { key, value } = req.body;
  const strValue = typeof value === 'object' ? JSON.stringify(value) : value;
  
  await pool.query(
    'INSERT INTO settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)',
    [key, strValue]
  );
  res.json({ success: true });
});

initDb().then(() => {
  app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
  });
});
