/**
 * LSB Steganography Engine for QRCrypt
 * Embeds and extracts raw binary payloads into/from PNG image pixels.
 * Uses 1 LSB per RGB channel (3 bits per pixel).
 */

// Magic prefix (4 bytes "QRC1" = 0x51, 0x52, 0x43, 0x31) to identify valid QRCrypt stego images
const STEGO_MAGIC = new Uint8Array([0x51, 0x52, 0x43, 0x31]);

/**
 * Calculate required dimensions (width x height) to fit a payload of given byte length
 */
export function calculateRequiredDimensions(payloadBytesLength: number): { width: number; height: number } {
  const fullBytesLength = 4 + 4 + payloadBytesLength;
  const totalBits = fullBytesLength * 8;
  // 3 bits per pixel (RGB)
  const neededPixels = Math.ceil(totalBits / 3);
  // Default minimum 600x600, otherwise square dimension rounded up to nearest 10
  const dim = Math.max(600, Math.ceil(Math.sqrt(neededPixels)));
  return { width: dim, height: dim };
}

/**
 * Generate a beautiful random geometric/gradient pattern as a cover image.
 */
export function generateRandomCoverImage(width = 600, height = 600): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create canvas context');

  // Random vibrant gradient
  const hues = [
    Math.floor(Math.random() * 360),
    Math.floor(Math.random() * 360),
    Math.floor(Math.random() * 360)
  ];
  
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, `hsl(${hues[0]}, 70%, 50%)`);
  gradient.addColorStop(0.5, `hsl(${hues[1]}, 80%, 45%)`);
  gradient.addColorStop(1, `hsl(${hues[2]}, 75%, 40%)`);
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Add subtle abstract shapes for aesthetic cover pattern
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = `hsla(${Math.floor(Math.random() * 360)}, 75%, 60%, ${0.15 + Math.random() * 0.2})`;
    ctx.beginPath();
    const radius = 50 + Math.random() * Math.min(width, height) * 0.3;
    const cx = Math.random() * width;
    const cy = Math.random() * height;
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Add fine noise to mask subtle LSB changes even further
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = Math.floor(Math.random() * 5) - 2;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  return canvas.toDataURL('image/png');
}

/**
 * Encodes a binary payload into a cover image using LSB steganography.
 * Payload layout: [4 bytes MAGIC] + [4 bytes payload length (uint32)] + [N bytes payload]
 * Automatically resizes canvas to accommodate up to 50MB payloads.
 */
export async function encodeStegoImage(
  coverSrc: string | null,
  payload: Uint8Array
): Promise<string> {
  const { width: requiredWidth, height: requiredHeight } = calculateRequiredDimensions(payload.length);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        // If image is smaller than required capacity, scale canvas to required dimensions
        const maxImageBits = (img.width * img.height) * 3;
        const totalNeededBits = (4 + 4 + payload.length) * 8;

        if (maxImageBits < totalNeededBits) {
          canvas.width = requiredWidth;
          canvas.height = requiredHeight;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }

        // Draw image onto canvas (scaling smoothly if needed)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Prepare header: Magic (4 bytes) + Payload length (4 bytes uint32 BE)
        const fullBuffer = new Uint8Array(4 + 4 + payload.length);
        fullBuffer.set(STEGO_MAGIC, 0);
        
        const lenView = new DataView(fullBuffer.buffer, 4, 4);
        lenView.setUint32(0, payload.length, false); // Big endian

        fullBuffer.set(payload, 8);

        // Convert full buffer to bit stream
        const totalBits = fullBuffer.length * 8;
        const maxBits = (data.length / 4) * 3;
        if (totalBits > maxBits) {
          reject(
            new Error(
              `Cover image is too small to fit file (${Math.round(payload.length / 1024)} KB). Required capacity: ${Math.round(fullBuffer.length / 1024)} KB.`
            )
          );
          return;
        }

        // Embed bits into LSB of RGB channels
        let bitIdx = 0;
        for (let i = 0; i < data.length && bitIdx < totalBits; i += 4) {
          for (let channel = 0; channel < 3 && bitIdx < totalBits; channel++) {
            const byteIdx = Math.floor(bitIdx / 8);
            const bitOffset = 7 - (bitIdx % 8);
            const bit = (fullBuffer[byteIdx] >> bitOffset) & 1;

            // Clear LSB and set new bit
            data[i + channel] = (data[i + channel] & 0xfe) | bit;
            bitIdx++;
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err: any) {
        reject(new Error('Failed to encode stego image: ' + (err?.message || String(err))));
      }
    };

    img.onerror = () => reject(new Error('Failed to load cover image.'));

    if (coverSrc) {
      img.src = coverSrc;
    } else {
      img.src = generateRandomCoverImage(requiredWidth, requiredHeight);
    }
  });
}

/**
 * Decodes a binary payload from a stego PNG image.
 */
export function decodeStegoFromImageData(
  rgbaPixels: Uint8ClampedArray
): Uint8Array | null {
  try {
    const totalPixels = rgbaPixels.length / 4;
    const maxAvailableBits = totalPixels * 3;
    
    // Header needs 8 bytes (4 magic + 4 length) = 64 bits
    if (maxAvailableBits < 64) {
      return null;
    }

    // Extract raw bit stream into a Uint8Array
    const extractBytes = (numBytes: number, startBitOffset = 0): Uint8Array => {
      const result = new Uint8Array(numBytes);
      let currentBit = startBitOffset;

      for (let i = 0; i < numBytes; i++) {
        let byteVal = 0;
        for (let b = 0; b < 8; b++) {
          const pixelIdx = Math.floor(currentBit / 3) * 4;
          const channel = currentBit % 3;
          const lsb = rgbaPixels[pixelIdx + channel] & 1;

          byteVal = (byteVal << 1) | lsb;
          currentBit++;
        }
        result[i] = byteVal;
      }
      return result;
    };

    // 1. Extract 8-byte header
    const header = extractBytes(8, 0);

    // 2. Validate magic bytes "QRC1"
    if (
      header[0] !== STEGO_MAGIC[0] ||
      header[1] !== STEGO_MAGIC[1] ||
      header[2] !== STEGO_MAGIC[2] ||
      header[3] !== STEGO_MAGIC[3]
    ) {
      return null;
    }

    // 3. Read payload length (uint32 BE)
    const view = new DataView(header.buffer, 4, 4);
    const payloadLength = view.getUint32(0, false);

    // Sanity check length
    const totalNeededBits = (8 + payloadLength) * 8;
    if (payloadLength <= 0 || totalNeededBits > maxAvailableBits) {
      return null;
    }

    // 4. Extract payload bytes starting at bit offset 64
    return extractBytes(payloadLength, 64);
  } catch (e) {
    console.error('Stego decoding error:', e);
    return null;
  }
}

/**
 * Decodes payload from an image data URL string or HTMLImageElement
 */
export async function decodeStegoImage(imageSrc: string): Promise<Uint8Array | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, img.width, img.height);
        const payload = decodeStegoFromImageData(imgData.data);
        resolve(payload);
      } catch (e) {
        resolve(null);
      }
    };

    img.onerror = () => resolve(null);
    img.src = imageSrc;
  });
}
