# Full VPS Deployment Guide (HestiaCP)

This guide covers the exact step-by-step process to deploy your Barcode Generator (Node.js backend + React frontend) on a fresh HestiaCP VPS, ensuring you avoid all the bugs we ran into during testing.

---

## Step 1: Database Setup
1. Log into your HestiaCP Web Panel.
2. Go to the **DB** section and click **Add Database**.
3. Create a database (e.g., `print_db`). This will automatically create the associated MySQL User and Password.
4. **CRITICAL RULE:** When choosing a password, **DO NOT** use the `#` symbol (e.g., avoid `Print@2026#`). The `.env` parser treats `#` as a comment and will delete your password, causing "Access Denied" errors. Use something like `Print@2026`.

## Step 2: Backend Deployment
1. Open **FileZilla** (or Hestia File Manager) and navigate to `/home/<username>/web/<domain>/public_html`.
2. Upload your `server` folder, `.env` file, `package.json`, and `package-lock.json`.
3. Ensure your server `.env` file looks like this:
   ```env
   PORT=3001
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name
   JWT_SECRET=supersecret123
   ```
4. Open your **SSH Terminal** (Putty/Terminal) and connect to the VPS as root.
5. Navigate to your project folder:
   ```bash
   cd /home/<username>/web/<domain>/public_html
   ```
6. Install the backend dependencies:
   ```bash
   npm install
   ```
7. Start the backend server using PM2 so it runs forever in the background:
   ```bash
   pm2 start server/index.js --name "barcode-api"
   pm2 save
   pm2 startup
   ```
8. Verify it is running properly:
   ```bash
   pm2 logs barcode-api
   ```
   *(You should see "Database initialized" and "Backend server running on http://localhost:3001")*

## Step 3: Nginx Reverse Proxy Setup (Crucial)
By default, HestiaCP doesn't know how to route API traffic to your Node.js server on port `3001`. We must create a custom Nginx rule.

1. In your SSH Terminal, create the custom configuration file. 
   **CRITICAL RULE:** For an HTTPS domain, the file name **MUST** start with `nginx.ssl.conf_` (e.g., `nginx.ssl.conf_api`). If you use the old `snginx.conf_*` naming, Hestia will completely ignore it and you will get a 404 error!

   Run this command (replace `<username>` and `<domain>` with your actual details):
   ```bash
   cat << 'EOF' > /home/<username>/conf/web/<domain>/nginx.ssl.conf_api
   location ^~ /api/ {
       proxy_pass http://127.0.0.1:3001;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "upgrade";
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
   }
   EOF
   ```
2. Test the Nginx configuration to ensure there are no syntax errors:
   ```bash
   nginx -t
   ```
3. Restart Nginx to apply the new proxy rule:
   ```bash
   systemctl restart nginx
   ```
4. **Test the API manually:** 
   Open `https://<your-domain>/api/products?userId=default` in your web browser. You should see `[]` or a JSON array instead of a 404 page.

## Step 4: Frontend Build & Deployment
1. On your **Local Computer**, open your code editor (VS Code).
2. Open the local `.env` file and ensure `VITE_API_URL` points to your production domain:
   ```env
   VITE_API_URL=https://<your-domain>/api
   ```
3. Build the frontend for production:
   ```bash
   npm run build
   ```
4. Compress the contents of the newly generated `dist` folder into a file named `dist.zip`.
5. Upload `dist.zip` into the `public_html` folder on your VPS via File Manager.
6. **CRITICAL RULE:** Inside the HestiaCP File Manager, you MUST click `dist.zip` and press the **Unzip / Extract** button. Ensure that it successfully overwrites the existing `index.html` file in `public_html`. (If you don't extract it, the server will continue serving your old broken website!).

## Step 5: Clear Browser Cache
HestiaCP aggressively caches `.html` and `.js` files to make websites load faster (`expires max;`). 
- When you first visit your newly deployed website, press **`Ctrl + Shift + R`** (or `Cmd + Shift + R` on Mac) to force a Hard Refresh.
- If you see a white screen or a 404 error, test it in an **Incognito / Private window** to guarantee you aren't looking at an old cached version.

---
### Quick Troubleshooting Cheatsheet
- **White Screen on Clicking Product:** This was caused by the database returning the `DECIMAL` price as a String, and React crashing when calling `.toFixed()`. We fixed this locally by wrapping it in `Number()`. If it happens again, ensure you uploaded the latest `dist` build!
- **Access Denied in PM2 Logs:** You either used a `#` in your `.env` password, or you forgot to grant privileges to the MySQL user.
- **404 Not Found on /api/:** Your Nginx proxy file is named incorrectly, or you forgot to run `systemctl restart nginx`.
