import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

let db;

// Initialize database
async function initDb() {
  db = await open({
    filename: path.join(__dirname, '../database.db'),
    driver: sqlite3.Database
  });

  // Create users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      isAdmin BOOLEAN DEFAULT 0
    )
  `);

  // Create products table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      mrp REAL NOT NULL,
      sellingPrice REAL,
      barcode TEXT NOT NULL,
      code TEXT NOT NULL,
      category TEXT NOT NULL,
      userId TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )
  `);

  // Create settings table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // Seed default admin if no users exist
  const adminExists = await db.get('SELECT * FROM users WHERE username = ?', ['ETZEL']);
  if (!adminExists) {
    await db.run(
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
  const user = await db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
  if (user) {
    res.json({ user });
  } else {
    res.status(401).json({ error: 'Invalid User ID or Password' });
  }
});

app.get('/api/users', async (req, res) => {
  const users = await db.all('SELECT id, username, isAdmin FROM users');
  res.json(users);
});

app.post('/api/users', async (req, res) => {
  const { username, password, isAdmin } = req.body;
  try {
    const id = 'user-' + Date.now();
    await db.run(
      'INSERT INTO users (id, username, password, isAdmin) VALUES (?, ?, ?, ?)',
      [id, username, password, isAdmin ? 1 : 0]
    );
    res.json({ success: true, id });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT') {
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
  await db.run('DELETE FROM users WHERE id = ?', [id]);
  await db.run('DELETE FROM products WHERE userId = ?', [id]);
  res.json({ success: true });
});

// --- Products ---
app.get('/api/products', async (req, res) => {
  const { userId } = req.query;
  const products = await db.all('SELECT * FROM products WHERE userId = ?', [userId]);
  res.json(products);
});

app.post('/api/products', async (req, res) => {
  const { id, name, mrp, sellingPrice, barcode, code, category, createdAt, userId } = req.body;
  await db.run(
    'INSERT INTO products (id, name, mrp, sellingPrice, barcode, code, category, createdAt, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, name, mrp, sellingPrice, barcode, code, category, createdAt, userId]
  );
  res.json({ success: true });
});

app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  if (Object.keys(updates).length === 0) {
    return res.json({ success: true });
  }

  const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const values = Object.values(updates);

  await db.run(
    `UPDATE products SET ${setClause} WHERE id = ?`,
    [...values, id]
  );
  res.json({ success: true });
});

app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  await db.run('DELETE FROM products WHERE id = ?', [id]);
  res.json({ success: true });
});

// --- Settings ---
app.get('/api/settings', async (req, res) => {
  const rows = await db.all('SELECT * FROM settings');
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
  
  await db.run(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    [key, strValue]
  );
  res.json({ success: true });
});

initDb().then(() => {
  app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
  });
});
