import { useEffect, useState } from 'react';
import { Product } from '../types';
import { barcodeService } from '../services/barcodeService';

interface StickerPreviewProps {
  product: Product;
  quantity?: number;
  shopName?: string;
}

export const StickerPreview: React.FC<StickerPreviewProps> = ({ product, quantity = 1, shopName = 'Shop Name' }) => {
  const [barcodeImage, setBarcodeImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateBarcode = async () => {
      try {
        setIsLoading(true);
        const barcode = await barcodeService.generateBarcode(product.barcode, 49.8);
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
    const printWindow = window.open('', '_blank', 'width=400,height=300');
    if (!printWindow) {
      alert('Unable to open print window. Please allow popups and try again.');
      return;
    }

    // Generate full quantity of stickers for printing
    const stickerHtml = Array(quantity).fill(null).map(() => (`
      <div class="sticker" style="width:50.8mm;height:25.4mm;display:flex;flex-direction:column;align-items:center;justify-content:space-between;font-family:Arial,Helvetica,sans-serif;box-sizing:border-box;padding:1mm 1.5mm;color:#000;background:#fff;overflow:hidden;">
        <div style="width:100%;text-align:center;font-size:2.5mm;font-weight:900;letter-spacing:0.5px;text-transform:uppercase;">${shopName}</div>
        <div style="width:100%;flex:1;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:0.5mm 0;">
          ${barcodeImage ? `<img src="${barcodeImage}" style="max-width:100%;max-height:100%;object-fit:contain;display:block;"/>` : ''}
        </div>
        <div style="width:100%;line-height:1.2;display:flex;flex-direction:column;">
          <div style="font-weight:900;font-size:2.5mm;text-align:center;">MRP: ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(product.mrp)}</div>
          <div style="display:flex;justify-content:space-between;align-items:center;width:100%;">
            <div style="font-weight:bold;font-size:2mm;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:left;">${product.name}</div>
            <div style="font-family:monospace;font-size:2mm;font-weight:bold;text-align:right;">${product.code}</div>
          </div>
        </div>
      </div>
    `)).join('\n');

    const html = `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Print Label</title>
          <style>
            @page {
              size: 50.8mm 25.4mm;
              margin: 0;
            }
            html, body {
              margin: 0;
              padding: 0;
              width: 50.8mm;
              height: 25.4mm;
            }
            .sticker {
              page-break-after: always;
              page-break-inside: avoid;
              width: 50.8mm;
              height: 25.4mm;
              overflow: hidden;
              box-sizing: border-box;
            }
            .sticker:last-child {
              page-break-after: avoid;
            }
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
      <div className="glass-card flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-200 border-t-brand-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Generating barcode...</p>
        </div>
      </div>
    );
  }

  const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

  // Only render 1 sticker for on-screen preview
  const previewSticker = (
    <div
      className="sticker-preview bg-white border border-black rounded-sm flex flex-col items-center justify-between text-black box-border overflow-hidden"
      style={{ padding: '1mm 1.5mm' }}
    >
      {/* Top Shop Name */}
      <div className="w-full text-center font-black uppercase tracking-wider mb-[0.5mm]" style={{ fontSize: '2.5mm' }}>
        {shopName}
      </div>

      {/* Barcode container taking available space */}
      <div className="w-full flex-1 flex items-center justify-center min-h-0 overflow-hidden">
        {barcodeImage && (
          <img src={barcodeImage} alt="barcode" className="w-full h-full block" />
        )}
      </div>

      {/* Text group below barcode */}
      <div className="w-full text-center mt-[1mm] mb-[0.5mm] leading-tight flex flex-col">
        <div className="font-black mb-[0.5mm]" style={{ fontSize: '2.5mm' }}>
          MRP: {formatter.format(product.mrp)}
        </div>
        <div className="w-full flex justify-between items-center">
          <div className="font-bold whitespace-nowrap overflow-hidden text-ellipsis text-left" style={{ fontSize: '2.2mm' }}>
            {product.name}
          </div>
          <div className="font-mono font-bold shrink-0 text-right" style={{ fontSize: '2.2mm' }}>
            {product.code}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="glass-card p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Sticker Preview</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {product.name} — {product.code} • Will print <strong className="text-slate-650 dark:text-slate-350">{quantity}</strong> sticker{quantity > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="btn-success print-hidden flex items-center gap-2"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print {quantity > 1 ? `${quantity} Stickers` : 'Sticker'}
        </button>
      </div>

      {/* On-screen preview — always show just 1 sticker */}
      <div className="screen-preview">
        {previewSticker}
      </div>

      <div className="mt-6 p-4 rounded-xl bg-brand-50/60 dark:bg-brand-950/20 border border-brand-100/50 dark:border-brand-900/30 print-hidden">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          <strong className="text-slate-700 dark:text-slate-300">Print Tips:</strong> This app prints TE‑210 labels (50.8×25.4mm). Use your TE‑210
          printer at its native DPI (commonly 203 DPI), set margins to 0, scaling 100%, and
          choose the printer's label or roll paper size for best results.
        </p>
      </div>
    </div>
  );
};
