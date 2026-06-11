export interface Product {
  id: string;
  code: string;
  name: string;
  mrp: number;
  barcode: string;
  category?: string;
  createdAt: Date;
}

export interface PrinterSettings {
  type: 'usb' | 'bluetooth';
  deviceName?: string;
  deviceId?: string;
  paperWidth: number; // in mm
  isConnected: boolean;
}

export interface PrintJob {
  id: string;
  productId: string;
  quantity: number;
  timestamp: Date;
  status: 'pending' | 'printing' | 'completed' | 'failed';
}
