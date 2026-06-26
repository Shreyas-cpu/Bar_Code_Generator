# Barcode Generator — Complete Data Flow Documentation

> **Project:** `thermal-barcode-printer` v1.0.0  
> **Author:** Shreyas  
> **License:** MIT  
> **Generated:** June 26, 2026

---

## 1. Overview

This document traces **every single data path** through the Barcode Generator application — from the moment a user types a character in the browser to the moment a physical sticker is printed or a row is saved in MySQL. It covers both the **Production (VPS)** and **Local Development** environments.

---

## 2. Environment Comparison

```mermaid
graph LR
    subgraph "Production Environment (VPS)"
        P_Browser["Browser"] -->|HTTPS :443| P_Nginx["Nginx"]
        P_Nginx -->|HTTP :3001| P_Node["Node.js (PM2)"]
        P_Node -->|TCP :3306| P_MySQL["MySQL"]
        P_Nginx -->|Static Files| P_Dist["public_html/dist/"]
    end

    subgraph "Local Development (Your PC)"
        L_Browser["Browser"] -->|HTTP :5173| L_Vite["Vite Dev Server"]
        L_Browser -->|HTTPS Cross-Origin| P_Nginx
        L_Vite -->|HMR WebSocket| L_Browser
    end

    style P_Nginx fill:#1a73e8,color:#fff
    style P_Node fill:#0d6e3f,color:#fff
    style P_MySQL fill:#e8710a,color:#fff
    style L_Vite fill:#7b1fa2,color:#fff
```

| Aspect | Production (VPS) | Local Development |
|--------|-----------------|-------------------|
| **Frontend served by** | Nginx (static files from `dist/`) | Vite Dev Server (`localhost:5173`) |
| **API calls go to** | Same-origin: `https://print.developeradda.com/api` | Cross-origin: `https://print.developeradda.com/api` |
| **Node.js runs on** | VPS via PM2 (port 3001) | VPS via PM2 (port 3001) — same server |
| **MySQL runs on** | VPS `localhost:3306` | VPS `localhost:3306` — same database |
| **Printer access** | WebUSB from user's browser | WebUSB from your browser |
| **Hot reload** | No (static build) | Yes (Vite HMR) |
| **VITE_API_URL** | `https://print.developeradda.com/api` | `https://print.developeradda.com/api` |

> **Critical Insight:** In both environments, the frontend talks to the **same live backend and database**. There is no separate "dev" database. Any product you add locally appears on the live site.

---

## 3. Data Flow #1: Application Boot Sequence

When a user navigates to the website, here is the exact sequence of data events:

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant Nginx as Nginx :443
    participant StaticFiles as public_html/
    participant React as React App
    participant AuthCtx as AuthContext
    participant LS as localStorage
    participant Store as productStore
    participant Node as Node.js :3001
    participant MySQL as MySQL :3306

    User->>Browser: Navigate to https://print.developeradda.com
    Browser->>Nginx: GET / (HTTPS)
    Nginx->>StaticFiles: Read index.html
    StaticFiles-->>Nginx: HTML file
    Nginx-->>Browser: index.html

    Browser->>Nginx: GET /assets/index-C3IZ6ON1.js
    Nginx->>StaticFiles: Read JS bundle
    StaticFiles-->>Nginx: JavaScript (276KB)
    Nginx-->>Browser: JS bundle

    Browser->>Browser: Execute React application

    Note over React,LS: Step 1: Check Authentication
    React->>AuthCtx: useEffect() on mount
    AuthCtx->>LS: getItem("user")
    
    alt User session exists in localStorage
        LS-->>AuthCtx: {id: "admin-0", username: "ETZEL", isAdmin: true}
        AuthCtx-->>React: user = {...}, isAuthLoading = false
        Note over React: Show Dashboard (skip login)
    else No session
        LS-->>AuthCtx: null
        AuthCtx-->>React: user = null
        Note over React: Show LoginPage
    end

    Note over React,MySQL: Step 2: Load Products (if authenticated)
    React->>Store: init()
    Store->>Store: LS.checkExpiration() — purge if >5 min inactive
    Store->>Node: GET /api/products?userId=admin-0
    Node->>MySQL: SELECT * FROM products WHERE userId='admin-0'
    MySQL-->>Node: [{id, name, mrp, code, ...}, ...]
    Node-->>Store: JSON array of products

    Store->>Node: GET /api/settings
    Node->>MySQL: SELECT * FROM settings
    MySQL-->>Node: [{key: "printerSettings", value: "..."}]
    Node-->>Store: JSON settings object

    Store-->>React: products=[], printerSettings={}, isLoaded=true
    React-->>User: Render Dashboard with product list
```

---

## 4. Data Flow #2: User Authentication (Login)

```mermaid
flowchart TD
    A["User enters<br/>Username + Password"] --> B["LoginPage.tsx<br/>handleLogin()"]
    B --> C["AuthContext.tsx<br/>login(username, password)"]
    C --> D["fetch() POST<br/>/api/auth/login"]
    D --> E{"Nginx<br/>URL match?"}
    E -->|"/api/" prefix| F["proxy_pass →<br/>http://127.0.0.1:3001"]
    F --> G["server/index.js<br/>app.post('/api/auth/login')"]
    G --> H["Extract {username, password}<br/>from req.body"]
    H --> I["MySQL Query:<br/>SELECT * FROM users<br/>WHERE username=? AND password=?"]
    I --> J{"Match<br/>found?"}
    J -->|Yes| K["res.json({user: {id, username, isAdmin}})"]
    J -->|No| L["res.status(401).json({error: 'Invalid...'})"]
    K --> M["AuthContext receives user object"]
    M --> N["localStorage.setItem('user', JSON.stringify(user))"]
    N --> O["setUser(user) → React re-renders"]
    O --> P["App.tsx shows Dashboard"]
    L --> Q["LoginPage shows error message"]

    style G fill:#0d6e3f,color:#fff
    style I fill:#e8710a,color:#fff
```

### Data Payload Trace

| Step | Component | Data Shape |
|------|-----------|-----------|
| User Input | LoginPage.tsx | `{username: "ETZEL", password: "ETZEL1029"}` |
| HTTP Request | fetch() | `POST /api/auth/login` Body: `{"username":"ETZEL","password":"ETZEL1029"}` |
| SQL Query | server/index.js | `SELECT * FROM users WHERE username='ETZEL' AND password='ETZEL1029'` |
| SQL Result | MySQL | `[{id: "admin-0", username: "ETZEL", password: "ETZEL1029", isAdmin: 1}]` |
| HTTP Response | server/index.js | `{user: {id: "admin-0", username: "ETZEL", isAdmin: 1}}` |
| localStorage | Browser | Key: `"user"`, Value: `'{"id":"admin-0","username":"ETZEL","isAdmin":1}'` |

---

## 5. Data Flow #3: Adding a New Product

```mermaid
sequenceDiagram
    actor User
    participant Form as ProductForm.tsx
    participant Store as productStore.ts
    participant LS as localStorage
    participant Fetch as fetch()
    participant Nginx as Nginx :443
    participant Node as server/index.js
    participant MySQL as MySQL :3306
    participant UI as ProductList.tsx

    User->>Form: Fill in: Code="WM001", Name="Cotton T-Shirt",<br/>MRP=499, Selling=399, Category="Clothing"
    User->>Form: Click "Add Product"

    Form->>Form: Validate: code unique? fields filled?
    Form->>Store: addProduct({code, name, mrp, sellingPrice, category})

    Note over Store: Step 1: Generate ID + Enrich
    Store->>Store: id = Date.now().toString()<br/>barcode = code<br/>createdAt = new Date().toISOString()

    Note over Store: Step 2: Optimistic UI Update
    Store->>Store: Zustand: set({products: [...existing, newProduct]})
    Store-->>UI: React re-renders → new product appears instantly

    Note over Store: Step 3: Persist to localStorage (backup)
    Store->>LS: setItem("products_admin-0", JSON.stringify(allProducts))

    Note over Store: Step 4: Persist to Backend (primary)
    Store->>Fetch: POST /api/products
    Fetch->>Nginx: HTTPS request with JSON body
    Nginx->>Node: proxy_pass HTTP to :3001
    Node->>Node: Extract {id, name, mrp, sellingPrice,<br/>barcode, code, category, createdAt, userId}
    Node->>MySQL: INSERT INTO products<br/>(id, name, mrp, sellingPrice, barcode,<br/>code, category, createdAt, userId)<br/>VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    MySQL-->>Node: OK (1 row inserted)
    Node-->>Nginx: {success: true}
    Nginx-->>Fetch: HTTPS response
    Fetch-->>Store: Response received (ignored — UI already updated)
```

### Data Transformation Pipeline

```
User Input (Form Fields)
    ↓
{code: "WM001", name: "Cotton T-Shirt", mrp: 499, sellingPrice: 399, category: "Clothing"}
    ↓  (addProduct enrichment)
{id: "1719389234567", code: "WM001", name: "Cotton T-Shirt", mrp: 499, 
 sellingPrice: 399, barcode: "WM001", category: "Clothing",
 createdAt: "2026-06-26T06:00:34.567Z"}
    ↓  (JSON.stringify for HTTP body, adds userId)
{"id":"1719389234567","code":"WM001","name":"Cotton T-Shirt","mrp":499,
 "sellingPrice":399,"barcode":"WM001","category":"Clothing",
 "createdAt":"2026-06-26T06:00:34.567Z","userId":"admin-0"}
    ↓  (MySQL stores with DECIMAL conversion)
| id              | name           | mrp    | sellingPrice | barcode | code  | category | userId  | createdAt                  |
|-----------------|----------------|--------|--------------|---------|-------|----------|---------|----------------------------|
| 1719389234567   | Cotton T-Shirt | 499.00 | 399.00       | WM001   | WM001 | Clothing | admin-0 | 2026-06-26T06:00:34.567Z   |
    ↓  (MySQL returns DECIMAL as STRING)
{mrp: "499.00", sellingPrice: "399.00"}
    ↓  (Frontend wraps in Number() before display)
Number("499.00").toFixed(2) → "499.00" ✓
```

---

## 6. Data Flow #4: Printing a Barcode Sticker

This is the only flow that **completely bypasses the server**. Data flows from the browser's memory directly to the USB hardware.

```mermaid
flowchart TD
    A["User clicks product<br/>in ProductList"] --> B["App.tsx:<br/>selectProduct(product)<br/>setActiveTab('preview')"]
    B --> C["StickerPreview.tsx<br/>receives product prop"]

    subgraph "Barcode Generation (Visual Only)"
        C --> D["barcodeService.generateBarcode('WM001')"]
        D --> E["JsBarcode creates SVG<br/>in memory (no DOM)"]
        E --> F["XMLSerializer → base64<br/>data:image/svg+xml;base64,..."]
        F --> G["<img src={base64}><br/>renders on screen"]
    end

    subgraph "TSPL Command Generation"
        C --> H["User clicks 'Print 3 Stickers'"]
        H --> I["printerService.print(product, shopName, 3)"]
        I --> J["buildTSPLCommand()"]
        J --> K["Generate TSPL text string:<br/>SIZE 2, 1<br/>TEXT ... SHOP NAME<br/>TEXT ... PRODUCT NAME<br/>BARCODE ... CODE128<br/>TEXT ... PRICE<br/>PRINT 1, 3"]
    end

    subgraph "USB Data Transfer"
        K --> L["TextEncoder.encode(tspl)"]
        L --> M["Uint8Array<br/>(raw binary bytes)"]
        M --> N["device.transferOut(<br/>endpointNumber, binaryData)"]
        N --> O["USB Controller"]
        O --> P["USB Cable"]
        P --> Q["TSC TE-210 Printer"]
        Q --> R["🏷️ Physical Sticker"]
    end

    style J fill:#7b1fa2,color:#fff
    style N fill:#1a73e8,color:#fff
    style Q fill:#0d6e3f,color:#fff
```

### Data at Each Stage

| Stage | Data Type | Example |
|-------|-----------|---------|
| Product object | TypeScript `Product` | `{name: "Cotton T-Shirt", mrp: 499, code: "WM001", ...}` |
| TSPL command string | Plain text | `"SIZE 2, 1\nTEXT 55, 15, \"2\", 0, 1, 1, \"ETZEL SHOP\"\n..."` |
| Encoded binary | `Uint8Array` | `[83, 73, 90, 69, 32, 50, 44, 32, 49, 10, ...]` |
| USB transfer | Raw bytes | Sent via `transferOut()` to endpoint `0x02` |
| Physical output | Ink on paper | 50.8mm × 25.4mm sticker with barcode |

---

## 7. Data Flow #5: The localStorage Fallback Mechanism

This is the graceful degradation system that allows the app to work even when the backend is unreachable.

```mermaid
stateDiagram-v2
    [*] --> AppBoot: App loads
    AppBoot --> TryAPI: productStore.init()

    TryAPI --> APISuccess: fetch() returns 200 OK
    TryAPI --> APIFail: fetch() throws Error / 404

    APISuccess --> BackendMode: useBackend = true
    APIFail --> FallbackMode: useBackend = false

    BackendMode --> DualWrite: User adds/edits/deletes product
    DualWrite --> WriteDB: 1. fetch() → Node.js → MySQL
    DualWrite --> WriteLS: 2. localStorage.setItem()

    FallbackMode --> LSOnly: User adds/edits/deletes product  
    LSOnly --> WriteLS: localStorage.setItem() only

    note right of BackendMode
        All reads come from Zustand (in-memory).
        All writes go to BOTH backend + localStorage.
    end note

    note right of FallbackMode
        No network requests are made.
        All data lives in browser only.
        Console shows: "Local API unavailable — using localStorage fallback"
    end note
```

### localStorage Key Map

| Key | Data | Format |
|-----|------|--------|
| `user` | Current logged-in user | `{"id":"admin-0","username":"ETZEL","isAdmin":true}` |
| `products_admin-0` | Products owned by user admin-0 | `[{id, name, mrp, ...}, ...]` |
| `products_user-1719...` | Products owned by another user | Same format |
| `printerSettings` | Printer configuration | `{"type":"usb","paperWidth":"80"}` |
| `shopName` | Shop name for sticker printing | `"ETZEL SHOP"` |
| `lastActive` | Timestamp of last user activity | `"1719389234567"` |
| `theme` | Dark/light mode preference | `"dark"` or `"light"` |

### Expiration Logic
If `lastActive` is older than **5 minutes**, all product and printer data in localStorage is automatically purged. This prevents stale data from persisting when the user returns after being away.

---

## 8. Data Flow #6: User Management (Admin Only)

```mermaid
sequenceDiagram
    actor Admin as Admin User
    participant UI as UsersManagement.tsx
    participant Fetch as fetch()
    participant Node as server/index.js
    participant MySQL as MySQL :3306

    Note over Admin,MySQL: Load existing users
    UI->>Fetch: GET /api/users
    Fetch->>Node: (via Nginx proxy)
    Node->>MySQL: SELECT id, username, isAdmin FROM users
    MySQL-->>Node: [{id:"admin-0", username:"ETZEL", isAdmin:1}, ...]
    Node-->>Fetch: JSON array
    Fetch-->>UI: Render user table

    Note over Admin,MySQL: Create new user
    Admin->>UI: Fill form: username="EMPLOYEE1", password="pass123"
    UI->>Fetch: POST /api/users {username, password, isAdmin: false}
    Fetch->>Node: (via Nginx proxy)
    Node->>Node: Generate id = "user-" + Date.now()
    Node->>MySQL: INSERT INTO users (id, username, password, isAdmin)<br/>VALUES ('user-171...', 'EMPLOYEE1', 'pass123', 0)
    MySQL-->>Node: OK
    Node-->>Fetch: {success: true, id: "user-171..."}
    Fetch-->>UI: Refresh user list

    Note over Admin,MySQL: Delete user (cascading)
    Admin->>UI: Click delete on "EMPLOYEE1"
    UI->>Fetch: DELETE /api/users/user-171...
    Fetch->>Node: (via Nginx proxy)
    Node->>Node: Check: id !== "admin-0" (protect primary admin)
    Node->>MySQL: DELETE FROM users WHERE id='user-171...'
    Node->>MySQL: DELETE FROM products WHERE userId='user-171...'
    Note over MySQL: All products owned by this user are also deleted!
    MySQL-->>Node: OK (cascaded delete)
    Node-->>Fetch: {success: true}
    Fetch-->>UI: Remove user from list
```

---

## 9. Network Request Map (Complete)

Every single HTTP request the frontend can make:

| # | Trigger | Method | URL | Request Body | Response | Component |
|---|---------|--------|-----|-------------|----------|-----------|
| 1 | App boot | GET | `/api/products?userId=X` | — | `[{Product}, ...]` | productStore.init() |
| 2 | App boot | GET | `/api/settings` | — | `{printerSettings: {...}}` | productStore.init() |
| 3 | Login | POST | `/api/auth/login` | `{username, password}` | `{user: {id, username, isAdmin}}` | AuthContext.login() |
| 4 | Add product | POST | `/api/products` | `{id, name, mrp, ...userId}` | `{success: true}` | productStore.addProduct() |
| 5 | Edit product | PUT | `/api/products/:id` | `{name?, mrp?, ...}` | `{success: true}` | productStore.updateProduct() |
| 6 | Delete product | DELETE | `/api/products/:id` | — | `{success: true}` | productStore.deleteProduct() |
| 7 | Save settings | POST | `/api/settings` | `{key, value}` | `{success: true}` | productStore.setPrinterSettings() |
| 8 | List users | GET | `/api/users` | — | `[{id, username, isAdmin}, ...]` | UsersManagement.tsx |
| 9 | Create user | POST | `/api/users` | `{username, password, isAdmin}` | `{success: true, id}` | UsersManagement.tsx |
| 10 | Delete user | DELETE | `/api/users/:id` | — | `{success: true}` | UsersManagement.tsx |

---

## 10. Component-to-Component Data Connections

This table shows exactly which component passes data to which other component, and what data flows between them:

| From | To | Data Passed | Mechanism |
|------|----|------------|-----------|
| `main.tsx` | `AuthProvider` | React children | JSX wrapping |
| `AuthProvider` | `App.tsx` | `{user, isAuthLoading, login, logout}` | React Context |
| `App.tsx` | `ProductForm` | *(none — reads from store)* | Zustand |
| `App.tsx` | `ProductList` | `{onSelectProduct, selectedProductId}` | Props |
| `App.tsx` | `StickerPreview` | `{product, quantity, shopName}` | Props |
| `App.tsx` | `PrinterSettings` | *(none — reads from store)* | Zustand |
| `App.tsx` | `UsersManagement` | *(none — fetches directly)* | fetch() |
| `ProductList` | `EditProductModal` | `{product, onClose}` | Props |
| `ProductList` | `App.tsx` | Selected product | `onSelectProduct` callback |
| `ProductForm` | `productStore` | New product data | `addProduct()` |
| `EditProductModal` | `productStore` | Updated product fields | `updateProduct()` |
| `StickerPreview` | `barcodeService` | Product code string | Function call |
| `StickerPreview` | `printerService` | `{product, shopName, quantity}` | `print()` |
| `printerService` | WebUSB | Binary TSPL data | `device.transferOut()` |
| `productStore` | `server/index.js` | JSON via HTTP | `fetch()` |
| `server/index.js` | MySQL | SQL queries | `pool.query()` |
| `AuthContext` | `productStore` | `reset()` on logout | Dynamic import |
