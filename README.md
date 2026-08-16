# 🔒 Secure Message Transformer (QRCrypt)

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black&style=flat-square)](https://react.dev)
[![TypeScript 6.0](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white&style=flat-square)](https://www.typescriptlang.org)
[![Vite 8](https://img.shields.io/badge/Vite-8.2-646CFF?logo=vite&logoColor=white&style=flat-square)](https://vite.dev)
[![TailwindCSS 3.4](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwindcss&logoColor=white&style=flat-square)](https://tailwindcss.com)
[![Vitest](https://img.shields.io/badge/Vitest-Tests_Passing-47A13E?logo=vitest&logoColor=white&style=flat-square)](https://vitest.dev)

A complete, production-grade, serverless web application that encrypts confidential messages into high-density scannable QR codes and decrypts them back using camera scans or file uploads. 

Operating **entirely client-side** (offline-first), the application ensures that plaintext messages, passphrases, and derived keys never touch any external server.

---

## 🚀 Key Highlights

*   **🔒 End-to-End Client-Side Security:** Built using native `window.crypto.subtle` APIs for cryptographic operations. No servers, no tracking, no leakage.
*   **⚡ WebAssembly-Powered Key Derivation:** Uses Argon2id (compiled to WASM) for memory-hard, brute-force resistant key derivation. Automatically falls back to high-iteration PBKDF2 (600,000 rounds) if WASM is unavailable.
*   **🛠️ Two Versatile Security Modes:**
    *   *Passphrase Mode:* Derives keys from a custom password using Argon2id/PBKDF2.
    *   *Pre-Shared Key (PSK) Mode:* Instantly generates and encrypts using an ephemeral 256-bit AES key.
*   **📸 Dual Scanning Options:** Decode messages by pointing a live camera at a QR code, or simply upload/drag-and-drop a static QR image.
*   **⏱️ Auto-Wipe & Security Auditing:** Automatically purges decrypted values and key material from memory and the clipboard after a customizable countdown timer (default 60s). Includes client-side "Burn After Reading" tracking.
*   **🎨 Premium UI/UX:** Styled using a sleek Glassmorphism design system built on top of Tailwind CSS with native light/dark mode toggles.

---

## 📦 Cryptographic Payload Structure

When packed into the QR code, the message is stored as a URL-safe Base64 string wrapping a raw binary payload. This compact binary format maximizes data density to fit more text into the QR code limit:

| Offset (Bytes) | Length | Field | Description |
| :--- | :--- | :--- | :--- |
| `0` | `1` | **Version** | Format version byte (`0x01`). |
| `1` | `1` | **Mode Flag** | `0x01` = Passphrase Mode, `0x02` = PSK Mode \| bit `0x10` = Burn-After-Reading enabled. |
| `2` | `16` | **Salt** | Cryptographic salt for key derivation (only present in Passphrase Mode). |
| `Varies` | `12` | **Nonce** | Fresh initialization vector (IV) generated per-message. |
| `Varies` | `N` | **Ciphertext** | The AES-256-GCM encrypted payload. |
| `End` | `16` | **Authentication Tag** | GCM tag validating data integrity and authenticity. |

---

## 🛡️ Threat Model & Security Posture

### What QRCrypt Protects Against

1.  **Server & Network Snooping:** The server only serves static files. The cryptographic functions are fully containerized in the browser sandbox.
2.  **QR Code Tampering:** Because AES-GCM is an authenticated encryption scheme, modifying or scribbling on the physical QR code will invalidate the GCM auth tag. Decryption will fail cleanly rather than rendering corrupted or garbled text.
3.  **Key Brute-Forcing:** Passive eavesdroppers capturing the QR code face massive computational barriers trying to brute-force the password due to memory-hard Argon2id parameters.

### Limitations & Non-Goals

*   **Passphrase Sharing:** You must distribute your passwords out-of-band using secure channels (e.g. in person or signal).
*   **Ephemeral "Burn-After-Reading":** To remain serverless, the "burn" flag is tracked locally via `localStorage` hashes. A determined attacker with the raw QR image could replicate it to scan multiple times.
*   **Endpoint Security:** If the scanner/generator device has spyware, keyloggers, or malicious browser extensions, the memory registers could be read.

---

## ⚙️ Development & Quickstart

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Installation
Clone the repository and install the development dependencies:
```bash
git clone https://github.com/Sachin1817/Secure-Message-Tarnsformer.git
cd Secure-Message-Tarnsformer
npm install
```

### 2. Run Local Development Server
Start the Vite development server with hot-module replacement (HMR):
```bash
npm run dev
```
By default, the application is served at `http://localhost:5173`.

### 3. Run Cryptographic & QR Tests
Execute the unit testing suite built with Vitest:
```bash
npm run test
```
The suite runs 18 assertions validating AES-GCM implementations, key derivation fallbacks, and binary packing/unpacking routines.

### 4. Build for Production
To bundle and optimize the application into static files under the `dist/` directory:
```bash
npm run build
```

---

## 🛠️ Tech Stack & Architecture

- **Framework:** [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- **Programming Language:** [TypeScript 6.0](https://www.typescriptlang.org/)
- **Symmetric Encryption:** Native Web Crypto API (`AES-256-GCM`)
- **Key Derivation (KDF):** [Argon2-Browser](https://github.com/Antelle/argon2-browser) (Argon2id WASM) and `PBKDF2-SHA256`
- **QR Generation:** [qrcode](https://www.npmjs.com/package/qrcode)
- **QR Scanning/Decoding:** [jsQR](https://www.npmjs.com/package/jsqr)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Testing:** [Vitest](https://vitest.dev/)

---

## 📄 License
This project is licensed under the **MIT License**. Check [LICENSE](LICENSE) for more details.
