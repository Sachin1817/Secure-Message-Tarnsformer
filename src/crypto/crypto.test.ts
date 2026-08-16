import { describe, it, expect } from 'vitest';
import {
  encryptMessage,
  decryptMessage,
  packPayload,
  unpackPayload,
  hexToBytes,
  bytesToHex,
  generatePreSharedKey
} from './crypto';

describe('Crypto Module', () => {
  const testMessage = "Hello, this is a secure message!";
  const testPassphrase = "SuperSecretPassword123";

  describe('Hex conversion utilities', () => {
    it('should convert bytes to hex and back', () => {
      const bytes = new Uint8Array([0, 1, 15, 16, 255]);
      const hex = bytesToHex(bytes);
      expect(hex).toBe('00010f10ff');
      
      const parsed = hexToBytes(hex);
      expect(parsed).toEqual(bytes);
    });

    it('should fail on odd hex strings', () => {
      expect(() => hexToBytes('abc')).toThrow();
    });
  });

  describe('Pre-shared key generation', () => {
    it('should generate a 64-char hex key (32 bytes)', () => {
      const key = generatePreSharedKey();
      expect(key.length).toBe(64);
      expect(/^[0-9a-fA-F]{64}$/.test(key)).toBe(true);
      
      const bytes = hexToBytes(key);
      expect(bytes.length).toBe(32);
    });
  });

  describe('Payload packing/unpacking', () => {
    it('should pack and unpack payload correctly (passphrase mode)', () => {
      const version = 1;
      const mode = 0x01;
      const salt = new Uint8Array(16).fill(5);
      const nonce = new Uint8Array(12).fill(9);
      const encryptedData = new Uint8Array([50, 60, 70, 80]);

      const packed = packPayload(version, mode, salt, nonce, encryptedData);
      expect(packed[0]).toBe(version);
      expect(packed[1]).toBe(mode);
      
      const unpacked = unpackPayload(packed);
      expect(unpacked.version).toBe(version);
      expect(unpacked.mode).toBe(mode);
      expect(unpacked.salt).toEqual(salt);
      expect(unpacked.nonce).toEqual(nonce);
      expect(unpacked.encryptedData).toEqual(encryptedData);
    });

    it('should pack and unpack payload correctly (pre-shared key mode)', () => {
      const version = 1;
      const mode = 0x02;
      const salt = null;
      const nonce = new Uint8Array(12).fill(9);
      const encryptedData = new Uint8Array([50, 60, 70, 80]);

      const packed = packPayload(version, mode, salt, nonce, encryptedData);
      expect(packed[0]).toBe(version);
      expect(packed[1]).toBe(mode);
      
      const unpacked = unpackPayload(packed);
      expect(unpacked.version).toBe(version);
      expect(unpacked.mode).toBe(mode);
      expect(unpacked.salt).toBeNull();
      expect(unpacked.nonce).toEqual(nonce);
      expect(unpacked.encryptedData).toEqual(encryptedData);
    });
  });

  describe('Encryption & Decryption Round-Trip', () => {
    it('should successfully encrypt and decrypt a message using passphrase mode (PBKDF2 preferred)', async () => {
      // Force PBKDF2 for reliability in node environments where Argon2id WASM might not load
      const payload = await encryptMessage(testMessage, testPassphrase, 'passphrase', 'pbkdf2');
      const decrypted = await decryptMessage(payload, testPassphrase);
      
      expect(decrypted).toBe(testMessage);
    });

    it('should successfully encrypt and decrypt a message using pre-shared key mode', async () => {
      const psk = generatePreSharedKey();
      const payload = await encryptMessage(testMessage, psk, 'preshared');
      const decrypted = await decryptMessage(payload, psk);
      
      expect(decrypted).toBe(testMessage);
    });
  });

  describe('Security and Tamper Resistance', () => {
    it('should fail decryption if wrong passphrase is provided', async () => {
      const payload = await encryptMessage(testMessage, testPassphrase, 'passphrase', 'pbkdf2');
      await expect(decryptMessage(payload, "wrongPassword")).rejects.toThrow(
        "Decryption failed. Please check the passphrase/key or the QR code payload."
      );
    });

    it('should fail decryption if wrong pre-shared key is provided', async () => {
      const psk1 = generatePreSharedKey();
      const psk2 = generatePreSharedKey();
      const payload = await encryptMessage(testMessage, psk1, 'preshared');
      await expect(decryptMessage(payload, psk2)).rejects.toThrow(
        "Decryption failed. Please check the passphrase/key or the QR code payload."
      );
    });

    it('should fail decryption if ciphertext is tampered with', async () => {
      const payload = await encryptMessage(testMessage, testPassphrase, 'passphrase', 'pbkdf2');
      
      // Tamper with the ciphertext portion (which resides at the end of the payload)
      payload[payload.length - 5] ^= 0xFF; 

      await expect(decryptMessage(payload, testPassphrase)).rejects.toThrow(
        "Decryption failed. Please check the passphrase/key or the QR code payload."
      );
    });

    it('should generate unique salts and nonces for repeated encryptions', async () => {
      const payload1 = await encryptMessage(testMessage, testPassphrase, 'passphrase', 'pbkdf2');
      const payload2 = await encryptMessage(testMessage, testPassphrase, 'passphrase', 'pbkdf2');

      const unpacked1 = unpackPayload(payload1);
      const unpacked2 = unpackPayload(payload2);

      // Verify salt uniqueness
      expect(unpacked1.salt).not.toEqual(unpacked2.salt);
      
      // Verify nonce uniqueness
      expect(unpacked1.nonce).not.toEqual(unpacked2.nonce);

      // Verify the resulting ciphertexts are different
      expect(unpacked1.encryptedData).not.toEqual(unpacked2.encryptedData);
    });

    it('should support burn-after-reading flag in the mode byte', async () => {
      const payload = await encryptMessage(testMessage, testPassphrase, 'passphrase', 'pbkdf2', true);
      const unpacked = unpackPayload(payload);
      expect((unpacked.mode & 0x10) !== 0).toBe(true);
      expect(unpacked.mode & 0x0F).toBe(0x01);

      const decrypted = await decryptMessage(payload, testPassphrase);
      expect(decrypted).toBe(testMessage);
    });
  });
});
