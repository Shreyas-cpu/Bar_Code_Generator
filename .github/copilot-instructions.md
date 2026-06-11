# Thermal Barcode Printer - Project Instructions

This is a responsive web application for printing barcode stickers on thermal printers, designed for ladies' clothing shops and retail businesses.

## Project Overview

- **Type**: React + TypeScript Web Application
- **Framework**: React 18, Vite, Tailwind CSS
- **Purpose**: USB and Bluetooth thermal printer support with barcode generation
- **Responsive**: Desktop, tablet, and mobile device support
- **Storage**: LocalStorage (offline-capable)

## Key Features

- Add and manage product inventory
- Generate professional barcode stickers
- Print via USB thermal printer (desktop/mobile with USB-OTG)
- Print via Bluetooth thermal printer
- Batch print multiple stickers
- No server required (runs offline)

## Project Structure

```
.
├── src/
│   ├── components/
│   │   ├── ProductForm.tsx       # Add new products
│   │   ├── ProductList.tsx       # View/manage products
│   │   ├── StickerPreview.tsx    # Preview stickers
│   │   └── PrinterSettings.tsx   # Printer configuration
│   ├── services/
│   │   ├── barcodeService.ts     # Barcode generation
│   │   └── printerService.ts     # USB/Bluetooth printing
│   ├── store/
│   │   └── productStore.ts       # Zustand state management
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   ├── App.tsx                   # Main application
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Tailwind styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── .eslintrc.json
└── README.md
```

## Development Commands

- `npm install` - Install dependencies
- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Check code quality

## Browser Requirements

- Modern browsers with USB/Bluetooth API support
- Chrome 90+, Edge 90+, Firefox 88+, Safari 14+
- Mobile browsers for responsive design

## Printer Requirements

- Thermal printer with ESC/POS support
- 58mm, 80mm, or 100mm paper width
- 200+ DPI recommended
- USB connection OR Bluetooth enabled

## Key Technologies

- React 18 - UI library
- TypeScript - Type safety
- Vite - Build tool and dev server
- Tailwind CSS - Styling framework
- Zustand - State management
- JsBarcode - Barcode generation
- USB Web API - Printer connection
- Web Bluetooth API - Wireless printing

## Development Notes

1. All product data is stored in browser LocalStorage
2. Barcode generation uses JsBarcode library
3. Printer communication uses ESC/POS protocol
4. Application is fully responsive and mobile-first
5. No backend server required

## Customization Points

- Edit `src/services/barcodeService.ts` to change barcode format
- Modify `src/components/StickerPreview.tsx` for sticker layout
- Adjust Tailwind config for custom colors/styling
- Update printer settings for different hardware

## Testing

1. Start dev server: `npm run dev`
2. Add test products manually
3. Test barcode generation in preview
4. Connect printer via USB/Bluetooth
5. Test print functionality
6. Verify responsive design on mobile

## Notes for Contributors

- Keep components modular and reusable
- Use TypeScript for type safety
- Follow existing code style
- Test responsiveness on multiple devices
- Document complex functions
- Use meaningful variable names

## Future Improvements

- CSV import/export for products
- Custom sticker templates
- Inventory tracking
- Receipt printing
- Multi-language support
- Cloud sync option
- Advanced printer settings
