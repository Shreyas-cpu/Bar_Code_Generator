import { Product } from '../types';

// Store the claimed USB device globally so it persists across prints
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let connectedDevice: any = null;

export const generateDateCode = (dateInput: string | Date | undefined): string => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const day = d.getDate().toString().padStart(2, '0');
  const monthChar = String.fromCharCode(65 + d.getMonth()); // 0=A, 1=B, etc.
  const year = d.getFullYear().toString().slice(-2);
  return `${day}${monthChar}${year}`;
};

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
      return { success: true, deviceName: (device as any).productName || 'TSC TE-210' };
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
        await (connectedDevice as any).releaseInterface(0);
        await (connectedDevice as any).close();
      } catch (_) {
        // Ignore errors on disconnect
      }
    }
    connectedDevice = null;
  },

  /**
   * Builds the TSPL command string dynamically from product data.
   * Label size: 2" x 1" (50.8mm x 25.4mm) — matches TSC TE-210 sticker roll.
   *
   * All label fields are global variables driven from the UI/product store:
   *   SHOP_NAME    → shopName (from store)
   *   PRODUCT_NAME → product.name
   *   BARCODE_DATA → "{product.name}*{product.mrp}"  e.g. "T-SHIRT*199"
   *   PRICE        → "Rs. {product.mrp}"
   *   QUANTITY     → quantity (from UI)
   */
  buildTSPLCommand: (
    product: Product,
    shopName: string,
    quantity: number
  ): string => {
    // ── Global label variables (all driven from UI) ─────────────────────────────────────
    const SHOP_NAME    = shopName.toUpperCase();
    const PRODUCT_NAME = product.name.length > 20 ? product.name.substring(0, 20) : product.name;
    const BARCODE_DATA = product.code;
    const SELL_PRICE   = product.sellingPrice ?? product.mrp;
    const PRICE        = `Rs. ${Number(SELL_PRICE).toFixed(2)}`;     // e.g. "Rs. 399.00"
    const MRP_LABEL    = `MRP Rs.${Number(product.mrp).toFixed(2)}`; // e.g. "MRP Rs.499.00"
    const hasDiscount  = product.sellingPrice !== undefined && product.sellingPrice < product.mrp;
    const QUANTITY     = quantity;
    const DATE_CODE    = generateDateCode(product.createdAt);
    // ──────────────────────────────────────────────────────────────────────────────

    const cmd =
      'SIZE 2, 1\n' +           // Label: 2" wide × 1" high (50.8mm × 25.4mm)
      'GAP 0.12, 0\n' +         // Gap between labels
      'DIRECTION 1\n' +         // Print direction: top-to-bottom
      'CODEPAGE 1252\n' +       // Windows Latin-1 character encoding
      'CLS\n' +                 // Clear image buffer

      // 1. SHOP NAME — top of label
      `TEXT 55, 15, "2", 0, 1, 1, "${SHOP_NAME}"\n` +

      // 2. PRODUCT NAME — below shop name
      `TEXT 55, 45, "3", 0, 1, 1, "${PRODUCT_NAME}"\n` +
      `TEXT 320, 45, "1", 0, 1, 1, "${DATE_CODE}"\n` +

      // 3. BARCODE — CODE128, 50 dots tall, human-readable underneath
      //    Data format: "PRODUCTNAME*PRICE"  (e.g. "T-SHIRT*199")
      `BARCODE 55, 70, "128", 50, 1, 0, 2, 4, "${BARCODE_DATA}"\n` +

      // 4a. MRP (left) — only printed when there is a discount
      (hasDiscount
        ? `TEXT 50, 160, "1", 0, 1, 1, "${MRP_LABEL}"\n`
        : '') +

      // 4b. SELLING PRICE (right) — large ROMAN font
      `TEXT 260, 150, "ROMAN.TTF", 0, 10, 10, "${PRICE}"\n` +

      // 5. PRINT — 1 label layout, QUANTITY copies
      `PRINT 1, ${QUANTITY}\n`;

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
