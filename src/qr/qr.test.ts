import { describe, it, expect, vi } from 'vitest';
import { generateQRCode, decodeQRCodeFromImageData } from './qr';
import jsQR from 'jsqr';

// Mock jsQR
vi.mock('jsqr', () => {
  return {
    default: vi.fn()
  };
});

describe('QR Module', () => {
  describe('QR Code Generation', () => {
    it('should generate a PNG data URL', async () => {
      const payload = new Uint8Array([1, 2, 3, 4, 5]);
      const result = await generateQRCode(payload, 'png');
      
      expect(result).toBeTypeOf('string');
      expect(result.startsWith('data:image/png;base64,')).toBe(true);
    });

    it('should generate an SVG string', async () => {
      const payload = new Uint8Array([1, 2, 3, 4, 5]);
      const result = await generateQRCode(payload, 'svg');
      
      expect(result).toBeTypeOf('string');
      expect(result.startsWith('<svg') || result.startsWith('<?xml')).toBe(true);
      expect(result.includes('</svg>')).toBe(true);
    });

    it('should throw an error for oversized payloads', async () => {
      // Version 40 maximum binary data is ~2953 bytes.
      // Let's create a 4000 byte payload to force an overflow error.
      const oversizedPayload = new Uint8Array(4000);
      
      await expect(generateQRCode(oversizedPayload, 'png')).rejects.toThrow(
        /exceeds maximum QR code capacity/i
      );
    });
  });

  describe('QR Code Decoding', () => {
    it('should return null when jsQR finds no code', () => {
      vi.mocked(jsQR).mockReturnValue(null);

      const pixels = new Uint8ClampedArray(400); // 10x10 rgba
      const result = decodeQRCodeFromImageData(pixels, 10, 10);
      
      expect(result).toBeNull();
    });

    it('should decode base64 encoded text correctly when code is found', () => {
      // Mock jsQR return value
      // "SGVsbG8=" is base64 for "Hello"
      vi.mocked(jsQR).mockReturnValue({
        data: "SGVsbG8=",
        version: 1,
        location: {
          topRightCorner: { x: 0, y: 0 },
          topLeftCorner: { x: 0, y: 0 },
          bottomRightCorner: { x: 0, y: 0 },
          bottomLeftCorner: { x: 0, y: 0 }
        },
        points: []
      } as any);

      const pixels = new Uint8ClampedArray(400);
      const result = decodeQRCodeFromImageData(pixels, 10, 10);
      
      expect(result).toBeInstanceOf(Uint8Array);
      
      const decoder = new TextDecoder();
      expect(decoder.decode(result!)).toBe("Hello");
    });

    it('should fall back to raw string decoding if data is not base64', () => {
      vi.mocked(jsQR).mockReturnValue({
        data: "Hello World",
        version: 1,
        location: {
          topRightCorner: { x: 0, y: 0 },
          topLeftCorner: { x: 0, y: 0 },
          bottomRightCorner: { x: 0, y: 0 },
          bottomLeftCorner: { x: 0, y: 0 }
        },
        points: []
      } as any);

      const pixels = new Uint8ClampedArray(400);
      const result = decodeQRCodeFromImageData(pixels, 10, 10);
      
      expect(result).toBeInstanceOf(Uint8Array);
      
      const decoder = new TextDecoder();
      expect(decoder.decode(result!)).toBe("Hello World");
    });
  });
});
