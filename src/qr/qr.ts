import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { bytesToBase64, base64ToBytes } from '../crypto/crypto';

/**
 * Generate a QR Code representation (PNG dataURL or SVG source string) from a binary payload
 */
export async function generateQRCode(
  payload: Uint8Array,
  format: 'png' | 'svg' = 'png',
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H' = 'M'
): Promise<string> {
  const base64Data = bytesToBase64(payload);
  
  try {
    if (format === 'png') {
      return await QRCode.toDataURL(base64Data, {
        errorCorrectionLevel,
        margin: 2,
        width: 600,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
    } else {
      return await QRCode.toString(base64Data, {
        type: 'svg',
        errorCorrectionLevel,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
    }
  } catch (err: any) {
    if (err && err.message && (err.message.includes('too big') || err.message.includes('overflow'))) {
      throw new Error("Message size exceeds maximum QR code capacity. Please shorten your message or choose a lower error correction level.");
    }
    throw new Error("Failed to generate QR code: " + (err?.message || String(err)));
  }
}

/**
 * Decodes a base64 payload from an image's pixel data using jsQR
 */
export function decodeQRCodeFromImageData(
  rgbaPixels: Uint8ClampedArray,
  width: number,
  height: number
): Uint8Array | null {
  try {
    const code = jsQR(rgbaPixels, width, height, {
      inversionAttempts: "dontInvert"
    });
    
    if (!code || !code.data) {
      return null;
    }

    const cleanData = code.data.trim();
    // Strict Base64 check: only valid base64 characters, length multiple of 4, no whitespace
    const isBase64 = /^[A-Za-z0-9+/]+={0,2}$/.test(cleanData) && cleanData.length % 4 === 0;

    if (isBase64) {
      try {
        return base64ToBytes(cleanData);
      } catch (e) {
        // Fall through to raw string bytes if decoding fails
      }
    }

    // Fallback to raw string bytes
    const encoder = new TextEncoder();
    return encoder.encode(code.data);
  } catch (e) {
    console.error("jsQR decoding error:", e);
    return null;
  }
}
