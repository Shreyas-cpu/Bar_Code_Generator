# Barcode Generator - VPS Deployment Notes & Lessons Learned

These notes document the exact steps and pitfalls we encountered during the testing VPS deployment so that the final production deployment is seamless.

## 1. HestiaCP Nginx Reverse Proxy (Crucial)
**The Problem:** The frontend React app couldn't reach the Node.js backend. We tried custom Nginx configs, but HestiaCP completely ignored them, resulting in `404 Not Found`.
**The Fix:** 
- HestiaCP has strict naming conventions for custom Nginx files. For a secure (HTTPS) domain, the custom configuration file **MUST** be named starting with `nginx.ssl.conf_` (e.g., `nginx.ssl.conf_api`).
- Do **not** use the older `snginx.conf_*` naming convention, as it will be silently ignored.
- Use the maximum priority symbol (`^~`) to ensure Hestia's default static file templates don't override your proxy.

**Correct Nginx Proxy Block:**
```nginx
# File path: /home/<user>/conf/web/<domain>/nginx.ssl.conf_api
location ^~ /api/ {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```
*Always run `nginx -t` and `systemctl restart nginx` after creating this file!*

## 2. Environment Variables & Passwords (`#` symbol bug)
**The Problem:** The Node.js server kept throwing `Access denied for user` even though the MySQL password was 100% correct.
**The Fix:** 
- Do **not** use the hashtag symbol (`#`) in your database password inside a `.env` file! 
- The `dotenv` package treats `#` as an inline comment and automatically deletes the hashtag and everything after it. If your password is `Print@2026#`, Node.js will only send `Print@2026` to MySQL.
- Keep the password alphanumeric or use safe symbols like `@`.

## 3. Database User Permissions
**The Problem:** We created the database manually in phpMyAdmin by importing the tables, but Node.js was still rejected.
**The Fix:** 
- Creating a database in phpMyAdmin does **not** create the MySQL User Account for it.
- If creating it manually, you must explicitly run a command to create the user and grant privileges:
```sql
CREATE USER IF NOT EXISTS 'sgbadmin_print'@'localhost' IDENTIFIED BY 'Print@2026'; 
GRANT ALL PRIVILEGES ON `sgbadmin_print`.* TO 'sgbadmin_print'@'localhost'; 
FLUSH PRIVILEGES;
```
*(Alternatively, just create the Database through the HestiaCP Web UI, which handles this automatically).*

## 4. Mixed Content Errors (HTTPS vs HTTP)
**The Problem:** The browser console threw a "Mixed Content" error and blocked the API request.
**The Fix:** 
- If your frontend is running on a secure `https://` domain, your `VITE_API_URL` environment variable **must** also use `https://`.
- **Important:** Changing the `.env` file for the frontend requires you to run `npm run build` locally again, and upload the newly generated `dist` folder to the server!

## 5. Troubleshooting Steps checklist
If the API returns a 404 or connection error tomorrow, run this checklist:
1. `pm2 status` - Is the Node server online?
2. `pm2 logs index` - Does it say "Database initialized"?
3. `curl http://127.0.0.1:3001/api/products` - Run this in SSH. If it returns `[]`, the backend is perfect and Nginx is the problem.
4. `nginx -t` - Did you break Nginx syntax?
