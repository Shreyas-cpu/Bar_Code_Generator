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
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Printer Settings</h2>

      <div className="space-y-6">
        {/* Printer Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Printer Connection Type</label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="printer-type"
                value="usb"
                checked={printerSettings.type === 'usb'}
                onChange={() => handlePrinterTypeChange('usb')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-2 text-gray-700">USB</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="printer-type"
                value="bluetooth"
                checked={printerSettings.type === 'bluetooth'}
                onChange={() => handlePrinterTypeChange('bluetooth')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-2 text-gray-700">Bluetooth</span>
            </label>
          </div>
        </div>

        {/* USB Connection */}
        {printerSettings.type === 'usb' && (
          <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
            <p className="text-sm text-gray-700 mb-4">
              Connect a thermal printer via USB. Supported formats: ESC/POS
            </p>
            <button
              onClick={handleConnectUSB}
              disabled={isConnecting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-md transition duration-200"
            >
              {isConnecting ? 'Connecting...' : '🔍 Search USB Printer'}
            </button>
          </div>
        )}

        {/* Bluetooth Connection */}
        {printerSettings.type === 'bluetooth' && (
          <div className="bg-green-50 p-4 rounded-md border border-green-200">
            <p className="text-sm text-gray-700 mb-4">
              Connect a thermal printer via Bluetooth. Pair your printer first in device settings.
            </p>
            <button
              onClick={handleConnectBluetooth}
              disabled={isConnecting || !printerService.isBluetoothSupported()}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-md transition duration-200"
            >
              {isConnecting ? 'Connecting...' : '📡 Connect Bluetooth'}
            </button>
          </div>
        )}

        {/* Connection Status */}
        {connectionMessage && (
          <div className={`p-3 rounded-md text-sm ${
            connectionMessage.includes('✅')
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            {connectionMessage}
          </div>
        )}

        {/* Current Connection Status */}
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Current Status:</strong>
          </p>
          <p className="text-sm">
            {printerSettings.isConnected ? (
              <span className="text-green-600">
                ✅ Connected ({printerSettings.deviceName || printerSettings.type.toUpperCase()})
              </span>
            ) : (
              <span className="text-gray-500">⚠️ Not Connected</span>
            )}
          </p>
        </div>

        {/* Paper Width Settings */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Paper Width</label>
          <select
            value={printerSettings.paperWidth}
            onChange={(e) => handlePaperWidthChange(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={58}>58mm (2.36")</option>
            <option value={80}>80mm (3.15") - Standard</option>
            <option value={100}>100mm (3.94")</option>
          </select>
          <p className="text-xs text-gray-500 mt-2">
            Select the thermal paper width your printer uses.
          </p>
        </div>

        {/* Printer Info */}
        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>ℹ️ Note:</strong> For web browsers, USB and Bluetooth printing works best on modern
            browsers (Chrome, Edge, Firefox). Mobile browsers have different permission models.
          </p>
        </div>
      </div>
    </div>
  );
};
