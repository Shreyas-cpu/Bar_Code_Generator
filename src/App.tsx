import { useState, useEffect } from 'react';
import { useStore } from './store/productStore';
import { ProductForm } from './components/ProductForm';
import { ProductList } from './components/ProductList';
import { StickerPreview } from './components/StickerPreview';
import { PrinterSettings } from './components/PrinterSettings';
import { LoginPage } from './components/LoginPage';
import { useAuth } from './context/AuthContext';
import './index.css';

type Tab = 'products' | 'preview' | 'settings';

function App() {
  const selectedProduct = useStore((state) => state.selectedProduct);
  const selectProduct = useStore((state) => state.selectProduct);
  const shopName = useStore((state) => state.shopName);
  const setShopName = useStore((state) => state.setShopName);
  const init = useStore((state) => state.init);
  const isLoaded = useStore((state) => state.isLoaded);
  const { user, isAllowed, isAuthLoading, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [printQuantity, setPrintQuantity] = useState(1);
  const [isEditingShop, setIsEditingShop] = useState(false);
  const [shopInput, setShopInput] = useState('');
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => { init(); }, [init]);

  useEffect(() => {
    if (isLoaded && !shopName) setIsEditingShop(true);
    setShopInput(shopName);
  }, [isLoaded, shopName]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) { root.classList.add('dark'); localStorage.setItem('theme', 'dark'); }
    else { root.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
  }, [isDark]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-700 border-t-brand-400" />
        <p className="text-slate-500 text-sm">Checking authentication...</p>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h2 className="text-white font-bold text-lg mb-2">Access Denied</h2>
          <p className="text-slate-400 text-sm mb-6">The account <strong className="text-slate-300">{user.email}</strong> is not authorized to access this application.</p>
          <button onClick={logout} className="btn-primary text-sm">Sign Out</button>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-200 border-t-brand-600" />
        <p className="text-slate-500 dark:text-slate-400 text-sm">Loading...</p>
      </div>
    );
  }

  const tabIcon = (key: Tab) => {
    if (key === 'products') return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    );
    if (key === 'preview') return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    );
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
  };

  const previewDisabled = !selectedProduct;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-brand-50/20 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300 flex flex-col">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 glass-card !rounded-none border-x-0 border-t-0 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          {/* Logo + shop name */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 shrink-0 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-brand-500/30">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                Barcode Generator
              </h1>
              {shopName && !isEditingShop ? (
                <button
                  onClick={() => { setIsEditingShop(true); setShopInput(shopName); }}
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:underline truncate max-w-[160px]"
                >
                  <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="truncate">{shopName}</span>
                </button>
              ) : (
                <p className="text-xs text-slate-400">Thermal Sticker Printer</p>
              )}
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Desktop tab bar */}
            <nav className="hidden md:flex glass-card !rounded-xl p-1 gap-0.5">
              {(['products', 'preview', 'settings'] as Tab[]).map(key => {
                const disabled = key === 'preview' && previewDisabled;
                return (
                  <button
                    key={key}
                    onClick={() => !disabled && setActiveTab(key)}
                    disabled={disabled}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200 flex items-center gap-1.5
                      ${activeTab === key ? 'bg-brand-600 text-white shadow shadow-brand-500/30' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}
                      ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    {tabIcon(key)}
                    {key}
                  </button>
                );
              })}
            </nav>

            {/* Theme toggle */}
            <button onClick={() => setIsDark(!isDark)} className="theme-toggle" aria-label="Toggle dark mode" />

            {/* Logout */}
            <button
              onClick={logout}
              title={`Sign out (${user?.email})`}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── SHOP NAME BANNER ───────────────────────────────────────────── */}
      {isEditingShop && (
        <div className="px-4 sm:px-6 lg:px-8 pt-3 max-w-7xl mx-auto w-full animate-slide-down">
          <div className="glass-card p-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <input
              type="text"
              value={shopInput}
              onChange={e => setShopInput(e.target.value)}
              placeholder="Enter your shop name..."
              className="input-field flex-1 !py-2 text-sm"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter' && shopInput.trim()) { setShopName(shopInput.trim()); setIsEditingShop(false); } }}
            />
            <button onClick={() => { if (shopInput.trim()) { setShopName(shopInput.trim()); setIsEditingShop(false); } }} disabled={!shopInput.trim()} className="btn-primary text-sm !py-2">Save</button>
            {shopName && <button onClick={() => { setIsEditingShop(false); setShopInput(shopName); }} className="btn-secondary text-sm !py-2">✕</button>}
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ───────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 pb-24 md:pb-6">

        {/* ── Products tab: Form + List side-by-side on lg ─── */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 tab-content">
            <div className="lg:col-span-1">
              <ProductForm />
            </div>
            <div className="lg:col-span-2">
              <ProductList
                onSelectProduct={product => { selectProduct(product); setActiveTab('preview'); }}
                selectedProductId={selectedProduct?.id}
              />
            </div>
          </div>
        )}

        {/* ── Preview tab ─────────────────────────────────── */}
        {activeTab === 'preview' && (
          <div className="space-y-4 tab-content">
            {selectedProduct ? (
              <>
                {/* Quantity + printer shortcut */}
                <div className="glass-card p-4 flex flex-wrap items-center gap-3">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Print Qty:</label>
                  <select
                    value={printQuantity}
                    onChange={e => setPrintQuantity(parseInt(e.target.value))}
                    className="input-field !w-20 !py-2"
                  >
                    {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <button onClick={() => setActiveTab('settings')} className="ml-auto btn-secondary text-sm flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Printer
                  </button>
                </div>
                <StickerPreview product={selectedProduct} quantity={printQuantity} shopName={shopName || 'Shop Name'} />
              </>
            ) : (
              <div className="glass-card p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">No product selected</p>
                <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Go to Products and tap a product to preview its sticker.</p>
                <button onClick={() => setActiveTab('products')} className="btn-primary mt-4 text-sm">Browse Products</button>
              </div>
            )}
          </div>
        )}

        {/* ── Settings tab ────────────────────────────────── */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 tab-content">
            <PrinterSettings />
            <div className="glass-card p-6">
              <h2 className="text-base font-bold mb-4 text-slate-800 dark:text-slate-100">Help & Information</h2>
              <div className="space-y-3 text-sm">
                {[
                  { icon: '🖨️', title: 'TSC TE-210 Printer', desc: 'Connects via USB (WinUSB driver via Zadig). Sends raw TSPL commands — no print dialog, no rotation issues.' },
                  { icon: '📱', title: 'Mobile Support', desc: 'Works on Android Chrome via USB-OTG. Pair your phone to the printer with an OTG cable, then connect here.' },
                  { icon: '💾', title: 'Data Storage', desc: 'Products are saved locally (SQLite when running locally, localStorage on Vercel). Data persists across sessions.' },
                  { icon: '🏷️', title: 'Barcode Format', desc: 'CODE128, data = ProductName*Price (e.g. T-SHIRT*199). Scannable and contains both product and price info.' },
                ].map(item => (
                  <div key={item.title} className="flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-xl shrink-0">{item.icon}</span>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-xs mb-0.5">{item.title}</h3>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-xs">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── MOBILE BOTTOM NAV ──────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/60 dark:border-slate-800/60 safe-area-bottom">
        <div className="flex">
          {(['products', 'preview', 'settings'] as Tab[]).map(key => {
            const disabled = key === 'preview' && previewDisabled;
            const active = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => !disabled && setActiveTab(key)}
                disabled={disabled}
                className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all duration-200
                  ${active ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}
                  ${disabled ? 'opacity-30' : 'active:scale-95'}`}
              >
                {tabIcon(key)}
                <span className="text-[10px] font-semibold capitalize">{key}</span>
                {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand-600 dark:bg-brand-400 rounded-full" />}
              </button>
            );
          })}
        </div>
      </nav>

    </div>
  );
}

export default App;
