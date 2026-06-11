# Thermal Barcode Printer - Sticker Generator

A responsive web application for printing barcode stickers on thermal printers. Perfect for clothing shops, retail stores, and product labeling. Supports USB and Bluetooth thermal printers via mobile devices and desktop browsers.

## 🎯 Features

- ✅ **Responsive Design** - Works on desktop, tablet, and mobile devices
- 🖨️ **USB Thermal Printer Support** - Connect via USB for direct printing
- 📡 **Bluetooth Printer Support** - Connect wireless thermal printers
- 📱 **Mobile Device Support** - Print from smartphones and tablets via USB-OTG adapters
- 🏷️ **Barcode Generation** - Automatic CODE128 barcode creation
- 💾 **Product Database** - Save and manage product information
- 🎨 **Professional Stickers** - Display product code, name, MRP, and barcode
- 🖥️ **Batch Printing** - Print multiple stickers at once
- ⚡ **Local Storage** - All data saved locally on your device

## 📋 Sticker Content

Each thermal sticker displays:
- **Product Name** - Clear, large text
- **Product Code** - Unique identifier
- **MRP** - Maximum Retail Price in Indian Rupees
- **Barcode** - Auto-generated barcode image
- **Barcode Number** - For reference

## 🛠️ System Requirements

### Desktop/Laptop
- Modern web browser (Chrome, Edge, Firefox, Safari)
- USB thermal printer (ESC/POS compatible)
- USB port or Bluetooth adapter

### Mobile Device
- Android phone/tablet with:
  - USB-OTG (On-The-Go) adapter
  - Thermal printer compatible with mobile
  - Modern mobile browser
- OR Bluetooth-enabled thermal printer

### Thermal Printer
- 58mm or 80mm thermal paper width
- ESC/POS command support
- 200+ DPI resolution (recommended)
- Examples: Zebra, Epson, Star Micronics

## 🚀 Installation & Setup

### 1. Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### 2. Clone/Download
```bash
# Navigate to project directory
cd thermal-barcode-printer
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start Development Server
```bash
npm run dev
```
The application will open at `http://localhost:5173`

### 5. Build for Production
```bash
npm run build
```
Optimized build will be created in the `dist` folder.

## 📖 Usage Guide

### Adding Products

1. Go to the **Products** tab
2. Fill in the product details:
   - **Product Code**: Unique identifier (e.g., WM001)
   - **Product Name**: Display name (e.g., Women's Top)
   - **MRP**: Price in Indian Rupees
   - **Barcode**: EAN-13 or any barcode number
   - **Category**: Optional (e.g., Tops, Sarees)
3. Click "Add Product"

### Printing Stickers

1. Go to **Products** tab and click on any product to select it
2. The app automatically switches to **Preview** tab
3. Adjust the quantity of stickers needed
4. Configure printer in **Printer Settings** if not already connected
5. Click **🖨️ Print Sticker** button
6. Choose your printer and print

### Connecting Thermal Printer

#### USB Printer
1. Go to **Printer Settings** tab
2. Select **USB** option
3. Click **🔍 Search USB Printer**
4. When found, it will show connection status
5. Choose paper width (58mm, 80mm, or 100mm)

#### Bluetooth Printer
1. Pair printer in device Bluetooth settings first
2. Go to **Printer Settings** tab
3. Select **Bluetooth** option
4. Click **📡 Connect Bluetooth**
5. Select your printer from the list
6. Confirm connection

### Mobile Device Setup (USB)

1. Get a USB-OTG adapter (micro-USB or USB-C depending on phone)
2. Connect thermal printer to the OTG adapter
3. Open the application in your mobile browser
4. Add products as normal
5. In Printer Settings, connect the USB printer
6. Print directly from your phone

## 🔧 Technical Details

### Built With
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Responsive styling
- **Vite** - Fast build tool
- **Zustand** - State management
- **JsBarcode** - Barcode generation
- **ESC/POS** - Thermal printer protocol

### Browser Support
- Chrome 90+
- Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with USB/Bluetooth API support

### Data Storage
- Products stored in browser's LocalStorage
- Printer settings saved locally
- No cloud synchronization (runs offline)

## 📱 Mobile Considerations

### iOS/iPadOS
- Limited USB support; primarily works with Bluetooth printers
- Bluetooth thermal printer recommended

### Android
- Full USB support via USB-OTG
- Both USB and Bluetooth printers work
- Requires appropriate permissions

## 🎨 Customization

### Paper Width Settings
- **58mm** - Smaller, compact labels
- **80mm** - Standard thermal printer width
- **100mm** - Larger labels with more space

### Barcode Format
Default: CODE128 (works with most thermal printers)

To change format, edit `src/services/barcodeService.ts`:
```typescript
format: 'CODE128' // Change to CODE39, EAN-13, UPC-A, etc.
```

## 🔒 Data Privacy

- All data is stored locally on your device
- No data sent to external servers
- No tracking or analytics
- Fully offline capable

## 🐛 Troubleshooting

### Printer Not Detected
- Ensure printer is powered on
- Check USB connection or Bluetooth pairing
- Try refreshing the browser
- Check browser permissions for USB/Bluetooth access

### Barcode Not Printing
- Verify barcode number format
- Check printer paper is installed
- Ensure sufficient printer memory
- Test with a shorter barcode

### Poor Print Quality
- Check print temperature settings on printer
- Verify paper quality
- Ensure 200+ DPI printer
- Clean thermal head if available

### Mobile Connection Issues
- Use a quality USB-OTG adapter
- Try different USB port on printer
- Restart both phone and printer
- Update mobile browser

## 📝 Print Settings

### Recommended Print Settings
- **Orientation**: Landscape
- **Paper Size**: 80mm width
- **DPI**: 203 (default for thermal)
- **Quality**: Maximum
- **Margins**: None

## 🚀 Future Enhancements

- Multi-product batch printing
- Custom sticker templates
- Receipt printing support
- CSV import/export
- Cloud backup option
- Inventory management
- Sales history tracking

## 📞 Support

For issues or feature requests:
1. Check troubleshooting section above
2. Verify printer compatibility
3. Test with different browser
4. Clear browser cache and cookies

## 📄 License

Open source project for personal and commercial use.

## 🏪 Perfect For

- **Clothing Shops** - Boutiques, ready-made wear
- **Retail Stores** - General retail businesses
- **E-commerce Fulfillment** - Product labeling
- **Warehouses** - Inventory management
- **Small Businesses** - Cost-effective labeling

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Made for Ladies Cloth Shops** ✨
