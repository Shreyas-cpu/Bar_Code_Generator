import { useState } from 'react';
import { useStore } from '../store/productStore';
import { printerService } from '../services/printerService';

export const PrinterSettings: React.FC = () => {
  const printerSettings = useStore((state) => state.getPrinterSettings());
  const setPrinterSettings = useStore((state) => state.setPrinterSettings);

  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState('');

  const handlePrinterTypeChange = (type: 'usb' | 'bluetooth') => {
    setPrinterSettings({ type });
    setConnectionMessage('');
  };

  const handleConnectUSB = async () => {
    setIsConnecting(true);
    setConnectionMessage('Searching for USB printers...');

    try {
      const device = await printerService.connectUSBPrinter();
      if (device) {
        setPrinterSettings({
          type: 'usb',
          deviceName: device.productName || 'Unknown USB Printer',
          isConnected: true,
        });
        setConnectionMessage(`✅ Connected to: ${device.productName || 'USB Printer'}`);
      } else {
        setConnectionMessage('❌ No USB printer found or permission denied');
      }
    } catch (error) {
      setConnectionMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectBluetooth = async () => {
    setIsConnecting(true);
    setConnectionMessage('Searching for Bluetooth printers...');

    try {
      if (!printerService.isBluetoothSupported()) {
        setConnectionMessage('❌ Bluetooth not supported on this device');
        setIsConnecting(false);
        return;
      }

      const server = await printerService.connectBluetoothPrinter();
      if (server) {
        setPrinterSettings({
          type: 'bluetooth',
          deviceName: 'Bluetooth Printer',
          isConnected: true,
        });
        setConnectionMessage('✅ Connected to Bluetooth printer');
      } else {
        setConnectionMessage('❌ Bluetooth connection failed');
      }
    } catch (error) {
      setConnectionMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handlePaperWidthChange = (width: number) => {
    setPrinterSettings({ paperWidth: width });
  };

  return (
    <div className="glass-card p-6">
      <h2 className="text-lg font-bold mb-5 text-slate-800 dark:text-slate-100">Printer Settings</h2>

      <div className="space-y-5">
        {/* Printer Type Toggle */}
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Connection Type</label>
          <div className="flex gap-2">
            {(['usb', 'bluetooth'] as const).map((type) => (
              <button
                key={type}
                onClick={() => handlePrinterTypeChange(type)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                  printerSettings.type === type
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {type === 'usb' ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    USB
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.828a5 5 0 010-7.07m7.07 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                    Bluetooth
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* USB Connection */}
        {printerSettings.type === 'usb' && (
          <div className="p-4 rounded-xl bg-brand-50/60 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900/30 animate-fade-in">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Connect a thermal printer via USB. Supported: ESC/POS
            </p>
            <button
              onClick={handleConnectUSB}
              disabled={isConnecting}
              className="btn-primary w-full"
            >
              {isConnecting ? (
                'Connecting...'
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search USB Printer
                </span>
              )}
            </button>
          </div>
        )}

        {/* Bluetooth Connection */}
        {printerSettings.type === 'bluetooth' && (
          <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 animate-fade-in">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Pair your Bluetooth printer in device settings first.
            </p>
            <button
              onClick={handleConnectBluetooth}
              disabled={isConnecting || !printerService.isBluetoothSupported()}
              className="btn-success w-full"
            >
              {isConnecting ? (
                'Connecting...'
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.828a5 5 0 010-7.07m7.07 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                  Connect Bluetooth
                </span>
              )}
            </button>
          </div>
        )}

        {/* Connection Status Message */}
        {connectionMessage && (
          <div className={`p-3 rounded-xl text-sm font-medium animate-slide-down flex items-center gap-2 ${
            connectionMessage.includes('Connected')
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
              : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50'
          }`}>
            {connectionMessage.includes('Connected') ? (
              <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            <span>{connectionMessage.replace(/[✅❌⚠️]/g, '').trim()}</span>
          </div>
        )}

        {/* Current Status */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-850">
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
            Current Status
          </p>
          <div className="text-sm font-medium">
            {printerSettings.isConnected ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Connected ({printerSettings.deviceName || printerSettings.type.toUpperCase()})
              </span>
            ) : (
              <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                Not Connected
              </span>
            )}
          </div>
        </div>

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
              <strong>Note:</strong> USB and Bluetooth printing works best on Chrome, Edge, Firefox.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
