import { useState } from 'react';
import { useStore } from '../store/productStore';

export const PrinterSettings: React.FC = () => {
  const printerSettings = useStore((state) => state.getPrinterSettings());
  const setPrinterSettings = useStore((state) => state.setPrinterSettings);

  const handlePaperWidthChange = (width: number) => {
    setPrinterSettings({ paperWidth: width });
  };

  return (
    <div className="glass-card p-6">
      <h2 className="text-lg font-bold mb-5 text-slate-800 dark:text-slate-100">Printer Settings</h2>

      <div className="space-y-5">
        {/* Paper Width */}
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Paper Width</label>
          <select
            value={printerSettings.paperWidth}
            onChange={(e) => handlePaperWidthChange(Number(e.target.value))}
            className="input-field"
          >
            <option value={58}>58mm (2.36")</option>
            <option value={80}>80mm (3.15") — Standard</option>
            <option value={100}>100mm (3.94")</option>
          </select>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
            Select the thermal paper width your printer uses.
          </p>
        </div>

        {/* Note */}
        <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
          <div className="flex items-start gap-2.5">
            <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              <strong>Note:</strong> Printing is managed by your external print module. Configure it separately to connect to your thermal printer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
