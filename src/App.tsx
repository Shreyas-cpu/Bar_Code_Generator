import { useState } from 'react';
import { useStore } from './store/productStore';
import { ProductForm } from './components/ProductForm';
import { ProductList } from './components/ProductList';
import { StickerPreview } from './components/StickerPreview';
import { PrinterSettings } from './components/PrinterSettings';
import './index.css';

function App() {
  const selectedProduct = useStore((state) => state.selectedProduct);
  const selectProduct = useStore((state) => state.selectProduct);
  const [activeTab, setActiveTab] = useState<'products' | 'preview' | 'settings'>('products');
  const [printQuantity, setPrintQuantity] = useState(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🏷️ Thermal Barcode Printer
              </h1>
              <p className="text-gray-600 mt-1">Sticker Generator for Thermal Printers</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">For Ladies Cloth Shop</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-4 border-b border-gray-300">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'products'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📦 Products
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              disabled={!selectedProduct}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'preview'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              } ${!selectedProduct ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              👁️ Preview
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ⚙️ Printer Settings
            </button>
          </nav>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <ProductForm />
            </div>
            <div className="lg:col-span-2">
              <ProductList
                onSelectProduct={(product) => {
                  selectProduct(product);
                  setActiveTab('preview');
                }}
                selectedProductId={selectedProduct?.id}
              />
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && selectedProduct && (
          <div className="space-y-6">
            {/* Quantity Selector */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">
                  Number of Stickers:
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={printQuantity}
                  onChange={(e) => setPrintQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => setActiveTab('settings')}
                  className="ml-auto bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition duration-200"
                >
                  ⚙️ Configure Printer
                </button>
              </div>
            </div>

            {/* Sticker Preview Grid */}
            <StickerPreview product={selectedProduct} quantity={printQuantity} />
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <PrinterSettings />
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Help & Information</h2>
              <div className="space-y-4 text-sm text-gray-700">
                <div>
                  <h3 className="font-bold mb-2">📱 Mobile & USB Support</h3>
                  <p>
                    This application supports printing from mobile devices via USB-OTG adapters.
                    The thermal printer connects through the mobile device's USB port.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">📡 Bluetooth Support</h3>
                  <p>
                    For Bluetooth-enabled thermal printers, pair the printer through your device
                    settings first, then use the printer settings to connect.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">🖨️ Printer Requirements</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>58mm or 80mm thermal paper</li>
                    <li>ESC/POS or similar command support</li>
                    <li>200+ DPI recommended for clear barcodes</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-2">✅ Supported Barcode Formats</h3>
                  <p>CODE128, CODE39, EAN-13, UPC-A, and more via barcode library.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-600 text-sm">
          <p>© 2024 Thermal Barcode Printer - Made for Ladies Cloth Shops</p>
          <p className="mt-2">Responsive • USB & Bluetooth • Mobile Friendly</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
