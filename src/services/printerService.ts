import { Product } from '../types';

// Store the claimed USB device globally so it persists across prints
let connectedDevice: USBDevice | null = null;

export const printerService = {

  /**
   * Returns true if there is a currently connected and open device.
   */
  isConnected: (): boolean => {
    return connectedDevice !== null && connectedDevice.opened;
  },

  /**
   * Prompts the user to select the TSC TE-210 USB printer and claims the interface.
   * Stores the device for reuse across multiple print jobs.
   */
  connect: async (): Promise<{ success: boolean; deviceName: string; error?: string }> => {
    try {
      if (!('usb' in navigator)) {
        return { success: false, deviceName: '', error: 'WebUSB is not supported in this browser. Please use Chrome or Edge.' };
      }

      const device = await (navigator as any).usb.requestDevice({
        filters: [{ vendorId: 0x1203 }] // TSC vendor ID (as set via Zadig on Windows)
      });

      await device.open();

      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }

      await device.claimInterface(0);

      connectedDevice = device;
      return { success: true, deviceName: device.productName || 'TSC TE-210' };
    } catch (err: any) {
      connectedDevice = null;
      if (err?.name === 'NotFoundError') {
        return { success: false, deviceName: '', error: 'No printer was selected.' };
      }
      return { success: false, deviceName: '', error: err?.message || 'Unknown connection error.' };
    }
  },

  /**
   * Disconnects and releases the USB device.
   */
  disconnect: async (): Promise<void> => {
    if (connectedDevice && connectedDevice.opened) {
      try {
        await connectedDevice.releaseInterface(0);
        await connectedDevice.close();
      } catch (_) {
        // Ignore errors on disconnect
      }
    }
    connectedDevice = null;
  },

  /**
   * Builds the TSPL command string dynamically from product data.
   * Label size: 2" x 1" (50.8mm x 25.4mm) — matches TSC TE-210 sticker roll.
   */
  buildTSPLCommand: (
    product: Product,
    shopName: string,
    quantity: number
  ): string => {
    const mrpFormatted = `Rs. ${product.mrp.toFixed(2)}`;

    // Truncate product name if too long to fit on the label
    const productName = product.name.length > 20 ? product.name.substring(0, 20) : product.name;

    const cmd =
      'SIZE 2, 1\n' +                              // 2" wide x 1" high
      'GAP 0.12, 0\n' +                            // Gap between labels
      'DIRECTION 1\n' +                            // Top-to-bottom print direction
      'CODEPAGE 1252\n' +                          // Windows Latin-1 encoding
      'CLS\n' +                                    // Clear image buffer

      // Shop name - top center
      `TEXT 55, 15, "3", 0, 1, 1, "${shopName}"\n` +

      // Product name - below shop name
      `TEXT 55, 45, "1", 0, 1, 1, "${productName}"\n` +

      // Barcode (CODE128) - middle of label
      // Format: BARCODE x, y, type, height, human_readable, rotation, narrow, wide, data
      `BARCODE 55, 70, "128", 50, 1, 0, 2, 4, "${product.barcode}"\n` +

      // Price - bottom right, large ROMAN font
      `TEXT 260, 140, "ROMAN.TTF", 0, 10, 10, "${mrpFormatted}"\n` +

      // Print: 1 label layout, N copies
      `PRINT 1, ${quantity}\n`;

    return cmd;
  },

  /**
   * Sends the TSPL command to the connected printer.
   */
  print: async (
    product: Product,
    shopName: string,
    quantity: number
  ): Promise<{ success: boolean; error?: string }> => {
    if (!connectedDevice || !connectedDevice.opened) {
      return { success: false, error: 'Printer not connected. Please connect first.' };
    }

    try {
      const tsplCommand = printerService.buildTSPLCommand(product, shopName, quantity);
      const encoder = new TextEncoder();
      const data = encoder.encode(tsplCommand);

      // Find the output USB endpoint dynamically
      const endpoint = (connectedDevice as any).configuration.interfaces[0].alternate.endpoints
        .find((e: any) => e.direction === 'out');

      if (!endpoint) {
        return { success: false, error: 'No USB output endpoint found on printer.' };
      }

      await (connectedDevice as any).transferOut(endpoint.endpointNumber, data);
      return { success: true };
    } catch (err: any) {
      // If the device was disconnected, clear it
      if (err?.name === 'NetworkError' || err?.name === 'NotFoundError') {
        connectedDevice = null;
      }
      return { success: false, error: err?.message || 'Print transfer failed.' };
    }
  },
};
