import { describe, it, expect } from 'vitest';
import { decodeStegoFromImageData } from './stego';

describe('Steganography Engine', () => {
  it('encodes and decodes payload correctly via raw pixel manipulation', () => {
    // Simulated 50x50 canvas pixel buffer (50*50*4 = 10,000 bytes)
    const width = 50;
    const height = 50;
    const rgbaPixels = new Uint8ClampedArray(width * height * 4);
    
    // Fill with sample color data (e.g. 128)
    for (let i = 0; i < rgbaPixels.length; i += 4) {
      rgbaPixels[i] = 120;     // R
      rgbaPixels[i + 1] = 150; // G
      rgbaPixels[i + 2] = 180; // B
      rgbaPixels[i + 3] = 255; // A
    }

    // Target payload
    const magic = new Uint8Array([0x51, 0x52, 0x43, 0x31]); // "QRC1"
    const secretMessage = new TextEncoder().encode("Hello Steganography World!");
    const payloadLength = secretMessage.length;

    const fullBuffer = new Uint8Array(4 + 4 + payloadLength);
    fullBuffer.set(magic, 0);
    const view = new DataView(fullBuffer.buffer, 4, 4);
    view.setUint32(0, payloadLength, false);
    fullBuffer.set(secretMessage, 8);

    // Embed bits into LSBs
    const totalBits = fullBuffer.length * 8;
    let bitIdx = 0;
    for (let i = 0; i < rgbaPixels.length && bitIdx < totalBits; i += 4) {
      for (let channel = 0; channel < 3 && bitIdx < totalBits; channel++) {
        const byteIdx = Math.floor(bitIdx / 8);
        const bitOffset = 7 - (bitIdx % 8);
        const bit = (fullBuffer[byteIdx] >> bitOffset) & 1;

        rgbaPixels[i + channel] = (rgbaPixels[i + channel] & 0xfe) | bit;
        bitIdx++;
      }
    }

    // Decode back
    const decodedPayload = decodeStegoFromImageData(rgbaPixels);
    expect(decodedPayload).not.toBeNull();
    expect(decodedPayload).toEqual(secretMessage);

    const decodedStr = new TextDecoder().decode(decodedPayload!);
    expect(decodedStr).toBe("Hello Steganography World!");
  });

  it('returns null for pixel data without magic stego header', () => {
    const rgbaPixels = new Uint8ClampedArray(100 * 4);
    // Random non-stego image data
    for (let i = 0; i < rgbaPixels.length; i++) {
      rgbaPixels[i] = Math.floor(Math.random() * 256);
    }

    const result = decodeStegoFromImageData(rgbaPixels);
    expect(result).toBeNull();
  });
});
