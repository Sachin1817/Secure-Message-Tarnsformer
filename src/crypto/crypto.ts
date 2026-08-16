// Dynamic import wrapper to prevent Vitest/Node environment from crashing on initialization
let argon2LoadedModule: any = null;

async function getArgon2() {
  if (argon2LoadedModule) return argon2LoadedModule;
  if (typeof window === 'undefined') return null;
  try {
    const mod = await import('argon2-browser/dist/argon2-bundled.min.js');
    argon2LoadedModule = mod.default || mod;
    return argon2LoadedModule;
  } catch (e) {
    console.warn("Argon2 WASM module failed to import:", e);
    return null;
  }
}

/**
 * Utility: Convert a hex string to Uint8Array
 */
export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.replace(/[^0-9a-fA-F]/g, '');
  if (cleanHex.length % 2 !== 0) {
    throw new Error("Invalid hex string length");
  }
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Utility: Convert a Uint8Array to a hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Utility: Generate a random 32-byte pre-shared key (64 hex characters)
 */
export function generatePreSharedKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return bytesToHex(bytes);
}

/**
 * Derives an AES-GCM 256-bit key from a passphrase and salt.
 * Tries Argon2id first, falling back to PBKDF2-SHA256 if Argon2id fails or is unavailable.
 */
export async function deriveKeyFromPassphrase(
  passphrase: string,
  salt: Uint8Array,
  preferredMethod: 'argon2id' | 'pbkdf2' = 'argon2id'
): Promise<{ key: CryptoKey; methodUsed: 'argon2id' | 'pbkdf2' }> {
  if (preferredMethod === 'argon2id') {
    try {
      const argon2Module = await getArgon2();
      if (argon2Module && typeof argon2Module.hash === 'function') {
        const result = await argon2Module.hash({
          pass: passphrase,
          salt: salt,
          time: 2, // iterations
          mem: 16384, // 16 MB (safe for browser performance)
          hashLen: 32, // 256 bits (for AES-256)
          parallelism: 1,
          type: 2 // Argon2id
        });
        
        const rawKey = result.hash;
        const key = await crypto.subtle.importKey(
          "raw",
          rawKey,
          { name: "AES-GCM" },
          false,
          ["encrypt", "decrypt"]
        );
        return { key, methodUsed: 'argon2id' };
      }
    } catch (e) {
      console.warn("Argon2id failed. Falling back to PBKDF2-SHA256 (600,000 iterations). Error:", e);
    }
  }

  // Fallback to PBKDF2
  // Trade-off: PBKDF2 is slower to compute on some devices compared to WASM Argon2,
  // but it is natively supported by the Web Crypto API, works completely offline, 
  // requires zero external JS files/WASM to load, and is secure against custom hardware 
  // cracking when iterations are sufficiently high (>= 600,000).
  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as any,
      iterations: 600000,
      hash: "SHA-256"
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  return { key, methodUsed: 'pbkdf2' };
}

/**
 * Packs the components of the encrypted payload into a unified binary format.
 * Format:
 * [1 byte: version]
 * [1 byte: mode flag (0x01 passphrase, 0x02 pre-shared key)]
 * [16 bytes: salt] (only if mode == 0x01)
 * [12 bytes: nonce]
 * [N bytes: ciphertext + 16 bytes GCM auth tag]
 */
export function packPayload(
  version: number,
  mode: number,
  salt: Uint8Array | null,
  nonce: Uint8Array,
  encryptedData: Uint8Array
): Uint8Array {
  if (nonce.length !== 12) {
    throw new Error("Nonce must be exactly 12 bytes");
  }
  
  const isPassphrase = (mode & 0x0F) === 0x01;
  if (isPassphrase) {
    if (!salt || salt.length !== 16) {
      throw new Error("Salt must be exactly 16 bytes in passphrase mode");
    }
  }

  const saltLength = isPassphrase ? 16 : 0;
  const totalLength = 1 + 1 + saltLength + 12 + encryptedData.length;
  const payload = new Uint8Array(totalLength);

  let offset = 0;
  payload[offset] = version;
  offset += 1;
  
  payload[offset] = mode;
  offset += 1;

  if (isPassphrase && salt) {
    payload.set(salt, offset);
    offset += 16;
  }

  payload.set(nonce, offset);
  offset += 12;

  payload.set(encryptedData, offset);

  return payload;
}

/**
 * Unpacks the unified binary payload back into its component parts.
 */
export function unpackPayload(payload: Uint8Array): {
  version: number;
  mode: number;
  salt: Uint8Array | null;
  nonce: Uint8Array;
  encryptedData: Uint8Array;
} {
  if (payload.length < 14) { // version(1) + mode(1) + nonce(12)
    throw new Error("Invalid payload: too short");
  }

  let offset = 0;
  const version = payload[offset];
  offset += 1;

  const mode = payload[offset];
  offset += 1;

  let salt: Uint8Array | null = null;
  const actualMode = mode & 0x0F;
  if (actualMode === 0x01) {
    if (payload.length < 30) { // version(1) + mode(1) + salt(16) + nonce(12)
      throw new Error("Invalid payload: passphrase mode payload too short");
    }
    salt = payload.slice(offset, offset + 16);
    offset += 16;
  }

  const nonce = payload.slice(offset, offset + 12);
  offset += 12;

  const encryptedData = payload.slice(offset);

  return {
    version,
    mode,
    salt,
    nonce,
    encryptedData
  };
}

/**
 * Encrypts a plaintext string to a binary payload.
 */
export async function encryptMessage(
  plaintext: string,
  secret: string,
  mode: 'passphrase' | 'preshared',
  preferredKdf: 'argon2id' | 'pbkdf2' = 'argon2id',
  burnAfterReading = false
): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const plaintextBytes = encoder.encode(plaintext);

  // Generate a fresh random 12-byte nonce
  const nonce = crypto.getRandomValues(new Uint8Array(12));

  let payload: Uint8Array;

  if (mode === 'passphrase') {
    // Generate fresh random 16-byte salt
    const salt = crypto.getRandomValues(new Uint8Array(16));
    
    // Derive key
    const { key } = await deriveKeyFromPassphrase(secret, salt, preferredKdf);
    
    // Encrypt (Web Crypto automatically appends the 16-byte auth tag at the end of the ciphertext)
    const encryptedDataBuffer = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: nonce,
        tagLength: 128
      },
      key,
      plaintextBytes
    );

    const encryptedData = new Uint8Array(encryptedDataBuffer);
    const modeFlag = burnAfterReading ? (0x01 | 0x10) : 0x01;
    payload = packPayload(1, modeFlag, salt, nonce, encryptedData);
  } else {
    // Pre-shared key mode
    const keyBytes = hexToBytes(secret);
    if (keyBytes.length !== 32) {
      throw new Error("Pre-shared key must be 32 bytes (64 hex characters)");
    }

    const key = await crypto.subtle.importKey(
      "raw",
      keyBytes as any,
      { name: "AES-GCM" },
      false,
      ["encrypt"]
    );

    // Encrypt
    const encryptedDataBuffer = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: nonce as any,
        tagLength: 128
      },
      key,
      plaintextBytes as any
    );

    const encryptedData = new Uint8Array(encryptedDataBuffer);
    const modeFlag = burnAfterReading ? (0x02 | 0x10) : 0x02;
    payload = packPayload(1, modeFlag, null, nonce, encryptedData);
  }

  return payload;
}

/**
 * Decrypts a binary payload to a plaintext string.
 * Fails with a generic error on verification failure to prevent oracle attacks.
 */
export async function decryptMessage(
  payload: Uint8Array,
  secret: string
): Promise<string> {
  try {
    const { version, mode, salt, nonce, encryptedData } = unpackPayload(payload);

    if (version !== 1) {
      throw new Error("Unsupported format version");
    }

    let key: CryptoKey;
    const actualMode = mode & 0x0F;

    if (actualMode === 0x01) {
      // Passphrase mode
      if (!salt) {
        throw new Error("Salt missing in passphrase mode payload");
      }
      
      const derivationResult = await deriveKeyFromPassphrase(secret, salt, 'argon2id');
      key = derivationResult.key;
    } else if (actualMode === 0x02) {
      // Pre-shared key mode
      const keyBytes = hexToBytes(secret);
      if (keyBytes.length !== 32) {
        throw new Error("Pre-shared key must be 32 bytes");
      }

      key = await crypto.subtle.importKey(
        "raw",
        keyBytes as any,
        { name: "AES-GCM" },
        false,
        ["decrypt"]
      );
    } else {
      throw new Error("Unknown mode flag");
    }

    // Decrypt
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: nonce as any,
        tagLength: 128
      },
      key,
      encryptedData as any
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (err) {
    // Generic error as requested
    throw new Error("Decryption failed. Please check the passphrase/key or the QR code payload.");
  }
}

/**
 * Utility: Convert a Uint8Array to a base64 string
 */
export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Utility: Convert a base64 string to a Uint8Array
 */
export function base64ToBytes(base64: string): Uint8Array {
  const binaryString = atob(base64.trim());
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

