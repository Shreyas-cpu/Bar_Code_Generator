import { useEffect, useState } from 'react';
import { Product } from '../types';
import { barcodeService } from '../services/barcodeService';

interface StickerPreviewProps {
  product: Product;
  quantity?: number;
}

export const StickerPreview: React.FC<StickerPreviewProps> = ({ product, quantity = 1 }) => {
  const [barcodeImage, setBarcodeImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateBarcode = async () => {
      try {
        setIsLoading(true);
        // For OS-210 (50.8mm width) leave small side margins; generate barcode at 46mm
        const barcode = await barcodeService.generateBarcode(product.barcode, 46);
        setBarcodeImage(barcode);
      } catch (error) {
        console.error('Failed to generate barcode:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generateBarcode();
  }, [product.barcode]);

  const handlePrint = () => {
    // Open a dedicated print window with only the sticker(s) content sized to TE-210
    const printWindow = window.open('', '_blank', 'width=400,height=300');
    if (!printWindow) {
      alert('Unable to open print window. Please allow popups and try again.');
      return;
    }

    const stickerHtml = Array(quantity).fill(null).map(() => (`
      <div class="sticker" style="width:50.8mm;height:25.4mm;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:system-ui, -apple-system, sans-serif;box-sizing:border-box;padding:2mm;">
        ${barcodeImage ? `<img src="${barcodeImage}" style="max-width:46mm;height:auto;display:block;margin-bottom:2px;"/>` : ''}
        <div style="font-family:monospace;font-size:9px;margin-bottom:1px;">${product.code}</div>
        <div style="font-weight:600;font-size:10px;margin-bottom:1px;">${product.name}</div>
        <div style="font-size:9px;color:#444;">MRP</div>
        <div style="font-weight:700;font-size:10px;">${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(product.mrp)}</div>
      </div>
    `)).join('\n');

    const html = `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Print Label</title>
          <style>
            @page { size: 50.8mm 25.4mm; margin: 0; }
            body { margin: 0; padding: 0; }
            .sticker { page-break-after: always; }
          </style>
        </head>
        <body>
          ${stickerHtml}
          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 250);
            }
          <\/script>
        </body>
      </html>`;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Generating barcode...</p>
        </div>
      </div>
    );
  }

  const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

  const stickers = Array(quantity).fill(null).map((_, idx) => (
    <div
      key={idx}
      className="sticker-preview bg-white border-0 rounded-sm p-1 flex flex-col items-center justify-center text-center"
      style={{ fontSize: '10px' }}
    >
      {/* Full-width barcode on top */}
      <div className="w-full mb-1 flex items-center justify-center">
        {barcodeImage && (
          <img src={barcodeImage} alt="barcode" className="max-w-full" style={{ height: 'auto' }} />
        )}
      </div>

      {/* Product code centered under barcode */}
      <div className="mt-0.5 mb-0.5">
        <p className="text-xs font-mono tracking-wider">{product.code}</p>
      </div>

      {/* Product name */}
      <div className="mb-1">
        <p className="text-sm font-semibold">{product.name}</p>
      </div>

      {/* MRP large */}
      <div className="mt-1">
        <p className="text-xs text-gray-600">MRP</p>
        <p className="text-sm font-bold">{formatter.format(product.mrp)}</p>
      </div>
    </div>
  ));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Sticker Preview</h2>
        <button
          onClick={handlePrint}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-200 print-hidden"
        >
          🖨️ Print Sticker
        </button>
      </div>

      {/* On-screen scaled preview (hidden during print) */}
      <div className="screen-preview">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stickers}
        </div>
      </div>

      {/* Print-only layout (hidden on screen scaling) */}
      <div className="print-only">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stickers}
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-md print-hidden">
        <p className="text-sm text-gray-700">
          <strong>Print Tips:</strong> This app prints TE‑210 labels (50.8×25.4mm). Use your TE‑210
          printer at its native DPI (commonly 203 DPI), set margins to 0, scaling 100%, and
          choose the printer's label or roll paper size for best results.
        </p>
      </div>
    </div>
  );
};
