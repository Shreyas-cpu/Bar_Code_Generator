import JsBarcode from 'jsbarcode';

export const barcodeService = {
  // Generate a PNG barcode sized to a target physical width (mm) for better print fidelity.
  // Defaults assume 203 DPI (approx 8 dots/mm). For higher quality, devicePixelRatio is applied.
  generateBarcode: async (value: string, widthMm: number = 46, format: string = 'CODE128'): Promise<string> => {
    try {
      const dpi = 203; // typical thermal printer dpi
      const dotsPerMm = dpi / 25.4; // ~8
      const pixelWidth = Math.max(200, Math.round(widthMm * dotsPerMm));
      const pixelHeight = Math.round(pixelWidth * 0.25); // make barcode height proportional

      const canvas = document.createElement('canvas');
      // Use a higher backing store for crisper print images
      const scale = window.devicePixelRatio || 1;
      canvas.width = pixelWidth * scale;
      canvas.height = pixelHeight * scale;
      canvas.style.width = `${pixelWidth}px`;
      canvas.style.height = `${pixelHeight}px`;

      const ctx = canvas.getContext('2d');
      if (ctx && scale !== 1) ctx.scale(scale, scale);

      JsBarcode(canvas, value, {
        format: format,
        width: 1, // single bar width in px; scaled canvas gives full width
        height: pixelHeight,
        displayValue: false,
        margin: 0,
      });

      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Barcode generation error:', error);
      throw new Error('Failed to generate barcode');
    }
  },

  // Helper to generate an SVG data URL (useful if you prefer vector output)
  generateBarcodeDataUrl: (value: string): string => {
    try {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      JsBarcode(svg, value, {
        format: 'CODE128',
        width: 1,
        height: 40,
        displayValue: false,
        margin: 0,
      });

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      return 'data:image/svg+xml;base64,' + btoa(svgString);
    } catch (error) {
      console.error('Barcode SVG generation error:', error);
      throw new Error('Failed to generate barcode SVG');
    }
  },

  validateBarcode: (barcode: string): boolean => {
    return barcode.length > 0 && barcode.length <= 128;
  },
};
