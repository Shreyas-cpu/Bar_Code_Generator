import { useState, useEffect } from 'react';
import { printerService } from '../services/printerService';
import { useStore } from '../store/productStore';

export const PrinterSettings: React.FC = () => {
  const printerSettings = useStore((state) => state.getPrinterSettings());
  const setPrinterSettings = useStore((state) => state.setPrinterSettings);

  const [isConnecting, setIsConnecting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  // Sync connection state on mount
  useEffect(() => {
    setIsConnected(printerService.isConnected());
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    setStatusMsg('Opening USB device picker...');

    const result = await printerService.connect();

    if (result.success) {
      setIsConnected(true);
      setPrinterSettings({ isConnected: true, type: 'usb', deviceName: result.deviceName });
      setStatusMsg(`Connected: ${result.deviceName}`);
    } else {
      setIsConnected(false);
      setPrinterSettings({ isConnected: false });
      setStatusMsg(result.error || 'Connection failed.');
    }

    setIsConnecting(false);
  };

  const handleDisconnect = async () => {
    await printerService.disconnect();
    setIsConnected(false);
    setPrinterSettings({ isConnected: false, deviceName: undefined });
    setStatusMsg('Printer disconnected.');
  };

  const handlePaperWidthChange = (width: number) => {
    setPrinterSettings({ paperWidth: width });
  };

  return (
    <div className="glass-card p-6">
      <h2 className="text-lg font-bold mb-5 text-slate-800 dark:text-slate-100">Printer Settings</h2>

      <div className="space-y-5">

        {/* Printer Model Info */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
          <div className="w-9 h-9 rounded-lg bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">TSC TE-210</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">USB · TSPL Commands · 2" × 1" Labels</p>
          </div>
          {/* Live status dot */}
          <div className="ml-auto flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`} />
            <span className={`text-xs font-medium ${isConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
              {isConnected ? 'Connected' : 'Not Connected'}
            </span>
          </div>
        </div>

        {/* Connect / Disconnect Button */}
        {!isConnected ? (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isConnecting ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Connect TSC Printer via USB
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleDisconnect}
            className="btn-danger w-full flex items-center justify-center gap-2 !py-2.5 !px-5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Disconnect Printer
          </button>
        )}

        {/* Status message */}
        {statusMsg && (
          <div className={`p-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-slide-down ${
            statusMsg.toLowerCase().includes('connected') && !statusMsg.toLowerCase().includes('disconnected')
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
              : statusMsg.toLowerCase().includes('disconnected')
                ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/40'
          }`}>
            {statusMsg}
          </div>
        )}

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
        </div>

        {/* Note */}
        <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
          <div className="flex items-start gap-2.5">
            <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              <strong>Windows users:</strong> Install <strong>Zadig</strong> and replace the TSC driver with <strong>WinUSB</strong> so the browser can access the printer directly.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
