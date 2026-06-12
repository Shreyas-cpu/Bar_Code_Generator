import JsBarcode from 'jsbarcode';

export const barcodeService = {
  // Generate a PNG barcode sized to a target physical width (mm) for better print fidelity.
  // Defaults assume 203 DPI (approx 8 dots/mm). For higher quality, devicePixelRatio is applied.
  generateBarcode: async (value: string, _widthMm: number = 49.8, format: string = 'CODE128'): Promise<string> => {
    try {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      JsBarcode(svg, value, {
        format: format,
        width: 2, // Base width, scales via SVG
        height: 50, // Base height, scales via SVG
        displayValue: false,
        margin: 0,
      });

      // Force SVG to stretch to container's width/height ignoring aspect ratio
      svg.setAttribute('preserveAspectRatio', 'none');
      // Remove hardcoded width/height so it fills CSS dimensions
      svg.removeAttribute('width');
      svg.removeAttribute('height');

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      return 'data:image/svg+xml;base64,' + btoa(svgString);
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
