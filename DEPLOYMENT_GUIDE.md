# Barcode Generator - Deployment Guide

This guide explains how to deploy the Barcode Generator project to a completely new, live VPS with a new domain and new database credentials.

---

## Step 1: Update Frontend Domain URL
The frontend needs to know where your PHP backend API lives.

1. Open the `.env` file in the root folder of the project.
2. Update `VITE_API_URL` to point to your new live domain.

*If deploying to a subfolder (e.g., `/start_php/`):*
```env
VITE_API_URL=https://your-new-domain.com/start_php/api
```

*If deploying to the main root domain:*
```env
VITE_API_URL=https://your-new-domain.com/api
```

---

## Step 2: Ensure Vite is Configured for Relative Paths
For maximum flexibility (so the app works whether deployed in the root domain or a subfolder), ensure your Vite configuration uses a relative base path.

1. Open `vite.config.ts`.
2. Ensure the `base` property is set to `'./'`.

```typescript
export default defineConfig({
  base: './', // <-- This ensures it works anywhere (root or subfolder)
  plugins: [react()],
  // ...
})
```

---

## Step 3: Update Database Credentials
Your new VPS will have a different database name, user, and password. You need to tell the PHP API how to connect to it.

1. Open the `api/.env` file.
2. Update the credentials with the ones provided by your new VPS hosting panel (cPanel, etc).

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_new_db_username
DB_PASSWORD=your_new_db_password
DB_NAME=your_new_db_name
```

---

## Step 4: Build the Project for Production (Local Step)
Because your deployment team does not have terminal access on the VPS, you (the developer) must compile the code *before* sending it to them.

1. Open a terminal on your local computer in the project folder.
2. Run the build command:
```bash
npm run build
```
3. This creates a `dist/` folder. You will send the contents of this `dist/` folder, along with the `api/` folder, to your deployment team. They only need to upload files via cPanel (no terminal required).
This will create (or update) the `dist/` folder containing your optimized, minified frontend files.

---

## Step 5: Upload Files to Your VPS
Open the File Manager on your new VPS (e.g., via cPanel) and navigate to your `public_html` folder (or the specific subfolder like `public_html/start_php/`).

Upload the files exactly in this structure:

```text
public_html/ (or public_html/start_php/)
├── index.html                    ← Upload from your computer's dist/index.html
├── assets/
│   ├── index-XXXX.css            ← Upload from your computer's dist/assets/
│   └── index-XXXX.js             ← Upload from your computer's dist/assets/
└── api/
    ├── .htaccess                 ← Upload from your computer's api/
    ├── .env                      ← Upload from your computer's api/
    ├── db.php                    ← Upload from your computer's api/
    ├── index.php                 ← Upload from your computer's api/
    └── init.php                  ← Upload from your computer's api/
```
*Note: Make sure to upload the `.htaccess` and `.env` files, as they are often hidden by default on Mac/Windows.*

---

## Step 6: Initialize the Database
Before you can log in, the database tables need to be created and the default admin user needs to be seeded.

1. Open your web browser.
2. Visit the `init.php` URL corresponding to your new domain. 

*If deployed in a subfolder:*
```
https://your-new-domain.com/start_php/api/init.php
```
*If deployed in the root:*
```
https://your-new-domain.com/api/init.php
```

You should see a JSON response confirming that the tables and default admin were successfully created.

---

## Step 7: Log In
The deployment is complete! You can now visit your new live application URL.

Go to: `https://your-new-domain.com/start_php/` (or your root domain).

Log in using the default credentials:
- **User ID:** `etzel@2026`
- **Password:** `etzel@2026`
