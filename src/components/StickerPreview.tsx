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

  return (
    <div className="glass-card p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Sticker Preview</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {product.name} — {product.code} • <strong className="text-slate-650 dark:text-slate-350">{quantity}</strong> sticker{quantity > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* On-screen preview */}
      <div className="screen-preview">
        <div
          className="sticker-preview bg-white border border-black rounded-sm flex flex-col items-center justify-between text-black box-border overflow-hidden"
          style={{ padding: '1mm 1.5mm' }}
        >
          {/* Top Shop Name */}
          <div className="w-full text-center font-black uppercase tracking-wider mb-[0.5mm]" style={{ fontSize: '2.5mm' }}>
            {shopName}
          </div>

          {/* Barcode container */}
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
      </div>

      <div className="mt-6 p-4 rounded-xl bg-brand-50/60 dark:bg-brand-950/20 border border-brand-100/50 dark:border-brand-900/30">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          <strong className="text-slate-700 dark:text-slate-300">Note:</strong> Printing is handled by your external print module. Use it to send this label to your thermal printer.
        </p>
      </div>
    </div>
  );
};
