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

  // Create products table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      barcode TEXT NOT NULL,
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

  console.log('Database initialized');
}

// API Routes

// --- Products ---
app.get('/api/products', async (req, res) => {
  const products = await db.all('SELECT * FROM products');
  // the original type stores createdAt as Date (which serializes to ISO string)
  // price is number, so SQLite REAL is fine.
  res.json(products);
});

app.post('/api/products', async (req, res) => {
  const { id, name, price, barcode, createdAt } = req.body;
  await db.run(
    'INSERT INTO products (id, name, price, barcode, createdAt) VALUES (?, ?, ?, ?, ?)',
    [id, name, price, barcode, createdAt]
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
