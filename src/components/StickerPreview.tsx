import { useEffect, useState } from 'react';
import { Product } from '../types';
import { barcodeService } from '../services/barcodeService';
import { printerService } from '../services/printerService';

interface StickerPreviewProps {
  product: Product;
  quantity?: number;
  shopName?: string;
}

export const StickerPreview: React.FC<StickerPreviewProps> = ({ product, quantity = 1, shopName = 'Shop Name' }) => {
  const [barcodeImage, setBarcodeImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printMsg, setPrintMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // ── Global label variables (mirrors printerService.buildTSPLCommand) ───────
  const SHOP_NAME    = shopName.toUpperCase();
  const PRODUCT_NAME = product.name.length > 20 ? product.name.substring(0, 20) : product.name;
  const BARCODE_DATA = `${product.name}*${product.mrp}`;  // e.g. "T-SHIRT*199"
  const PRICE        = `Rs. ${product.mrp.toFixed(2)}`;
  // ────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const generateBarcode = async () => {
      try {
        setIsLoading(true);
        // Use the same BARCODE_DATA string that the printer will encode
        const barcode = await barcodeService.generateBarcode(BARCODE_DATA, 49.8);
        setBarcodeImage(barcode);
      } catch (error) {
        console.error('Failed to generate barcode:', error);
      } finally {
        setIsLoading(false);
      }
    };
    generateBarcode();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [BARCODE_DATA]);

  // Poll connection status every second so the button stays in sync
  useEffect(() => {
    const check = () => setIsConnected(printerService.isConnected());
    check();
    const id = setInterval(check, 1000);
    return () => clearInterval(id);
  }, []);

  const handlePrint = async () => {
    if (!isConnected) {
      setPrintMsg({ text: 'Printer not connected. Go to Settings → Connect TSC Printer.', ok: false });
      return;
    }

    setIsPrinting(true);
    setPrintMsg(null);

    const result = await printerService.print(product, shopName, quantity);

    if (result.success) {
      setPrintMsg({ text: `✓ Sent ${quantity} label${quantity > 1 ? 's' : ''} to printer!`, ok: true });
    } else {
      setPrintMsg({ text: result.error || 'Print failed.', ok: false });
    }

    setIsPrinting(false);

    // Auto-clear message after 4 seconds
    setTimeout(() => setPrintMsg(null), 4000);
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


  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Sticker Preview</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {product.name} — {product.code} •{' '}
            <strong className="text-slate-600 dark:text-slate-300">{quantity}</strong> sticker{quantity > 1 ? 's' : ''}
          </p>
        </div>

        {/* Print Button */}
        <button
          onClick={handlePrint}
          disabled={isPrinting}
          className={`flex items-center gap-2 font-semibold py-2.5 px-5 rounded-xl transition-all duration-200 shadow-md ${
            isConnected
              ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-emerald-500/20'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
          }`}
          title={!isConnected ? 'Connect printer in Settings first' : `Print ${quantity} label(s)`}
        >
          {isPrinting ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Printing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              {isConnected
                ? `Print ${quantity > 1 ? `${quantity} Stickers` : 'Sticker'}`
                : 'Printer Not Connected'}
            </>
          )}
        </button>
      </div>

      {/* Print status message */}
      {printMsg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-slide-down ${
          printMsg.ok
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
            : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/40'
        }`}>
          {printMsg.ok
            ? <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            : <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          }
          {printMsg.text}
        </div>
      )}

      {/* On-screen sticker preview */}
      <div className="screen-preview">
        <div
          className="sticker-preview bg-white border border-black rounded-sm flex flex-col items-center justify-between text-black box-border overflow-hidden"
          style={{ padding: '1mm 1.5mm' }}
        >
          {/* 1. SHOP NAME */}
          <div className="w-full text-center font-black uppercase tracking-wider mb-[0.5mm]" style={{ fontSize: '2.5mm' }}>
            {SHOP_NAME}
          </div>

          {/* 2. PRODUCT NAME */}
          <div className="w-full text-center font-bold" style={{ fontSize: '2mm' }}>
            {PRODUCT_NAME}
          </div>

          {/* 3. BARCODE — encodes BARCODE_DATA = "name*mrp" */}
          <div className="w-full flex-1 flex items-center justify-center min-h-0 overflow-hidden">
            {barcodeImage && (
              <img src={barcodeImage} alt={BARCODE_DATA} className="w-full h-full block" />
            )}
          </div>

          {/* 4. PRICE */}
          <div className="w-full text-right font-black" style={{ fontSize: '2.5mm' }}>
            {PRICE}
          </div>
        </div>
      </div>

      {/* Info strip */}
      <div className="mt-6 p-4 rounded-xl bg-brand-50/60 dark:bg-brand-950/20 border border-brand-100/50 dark:border-brand-900/30">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          <strong className="text-slate-700 dark:text-slate-300">How it works:</strong> Clicking Print sends raw TSPL commands directly to your{' '}
          <strong>TSC TE-210</strong> via USB — no print dialog, no rotation issues.
          {!isConnected && (
            <span className="text-amber-600 dark:text-amber-400 ml-1">
              → Go to <strong>Settings</strong> tab to connect your printer first.
            </span>
          )}
        </p>
      </div>
    </div>
  );
};
