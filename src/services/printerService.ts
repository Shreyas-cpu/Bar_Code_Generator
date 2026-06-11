import { PrinterSettings } from '../types';

// ESC/POS protocol commands
const ESC = '\x1B';
const GS = '\x1D';

export const printerService = {
  // Detect available USB printers
  detectUSBPrinters: async (): Promise<any[]> => {
    try {
      if (!('usb' in navigator)) {
        throw new Error('USB API not supported in this browser');
      }
      
      const devices = await (navigator as any).usb.getDevices();
      return devices;
    } catch (error) {
      console.error('USB detection error:', error);
      return [];
    }
  },

  // Request USB printer connection
  connectUSBPrinter: async (): Promise<any | null> => {
    try {
      if (!('usb' in navigator)) {
        throw new Error('USB API not supported');
      }
      
      const device = await (navigator as any).usb.requestDevice({
        filters: [
          { vendorId: 0x04b8 }, // Epson
          { vendorId: 0x0a81 }, // Zebra
          { vendorId: 0x067b }, // Prolific
        ],
      });
      
      await device.open();
      return device;
    } catch (error) {
      console.error('USB connection error:', error);
      return null;
    }
  },

  // Check Bluetooth support
  isBluetoothSupported: (): boolean => {
    return 'bluetooth' in navigator;
  },

  // Connect to Bluetooth printer
  connectBluetoothPrinter: async (): Promise<any | null> => {
    try {
      if (!('bluetooth' in navigator)) {
        throw new Error('Bluetooth API not supported');
      }

      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [
          { services: ['000000FF-0000-1000-8000-00805F9B34FB'] }, // Generic BT service
        ],
      });

      const server = await device.gatt.connect();
      return server;
    } catch (error) {
      console.error('Bluetooth connection error:', error);
      return null;
    }
  },

  // Print thermal sticker via USB
  printUSBSticker: async (
    device: any,
    _stickerImage: string,
    _settings: PrinterSettings
  ): Promise<boolean> => {
    try {
      // Initialize printer
      const initSeq = new Uint8Array([
        0x1B, 0x40, // ESC @ - Initialize
      ]);

      // Image data would be converted here
      // This is a simplified example - actual implementation would need image rasterization

      await device.controlTransferOut(
        {
          requestType: 'vendor',
          recipient: 'device',
          request: 0x09,
          value: 0x0200,
          index: 0x00,
        },
        initSeq
      );

      console.log('USB print command sent');
      return true;
    } catch (error) {
      console.error('USB print error:', error);
      return false;
    }
  },

  // Print thermal sticker via Bluetooth
  printBluetoothSticker: async (
    server: any,
    _stickerImage: string,
    _settings: PrinterSettings
  ): Promise<boolean> => {
    try {
      const service = await server.getPrimaryService('000000FF-0000-1000-8000-00805F9B34FB');
      const characteristic = await service.getCharacteristic('0000FF01-0000-1000-8000-00805F9B34FB');

      // Build ESC/POS commands for thermal printer
      const commands = new TextEncoder().encode(
        ESC + '@' + // Initialize
        GS + 'v' + '0' // Image print
      );

      await characteristic.writeValue(commands);
      console.log('Bluetooth print command sent');
      return true;
    } catch (error) {
      console.error('Bluetooth print error:', error);
      return false;
    }
  },

  // Generate ESC/POS commands for sticker content
  generateESCPOSCommands: (
    productCode: string,
    productName: string,
    mrp: string,
    barcodeData: string
  ): string => {
    let commands = '';
    
    // Initialize printer
    commands += ESC + '@';
    
    // Set alignment to center
    commands += ESC + 'a' + '\x01';
    
    // Set double height and width
    commands += ESC + '!' + '\x30';
    
    // Print product name
    commands += productName + '\n';
    
    // Reset font size
    commands += ESC + '!' + '\x00';
    
    // Print product code
    commands += 'Code: ' + productCode + '\n';
    
    // Print MRP
    commands += 'MRP: ₹' + mrp + '\n\n';
    
    // Barcode would be printed as image data here
    commands += 'Barcode: ' + barcodeData + '\n';
    
    // Cut paper
    commands += GS + 'V' + '\x41' + '\x00';
    
    return commands;
  },
};
