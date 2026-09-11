/**
 * Klambi.id Security Module - Cryptography Engine (AES-256-GCM)
 * 
 * Implements authenticated encryption at rest (AEAD) for sensitive user data:
 * - Nomor Rekening Bank
 * - Data NIK / KTP Mitra
 * - Alamat lengkap & kontak pribadi
 * 
 * Complies with OWASP Cryptographic Storage Cheat Sheet:
 * - AES-256 in Galois/Counter Mode (GCM)
 * - Unique 96-bit (12-byte) IV generated for every encryption operation
 * - 128-bit authentication tag to detect ciphertext tampering
 */

const CIPHER_ALGO = 'AES-GCM';
const IV_LENGTH_BYTES = 12; // 96 bits recommended for GCM
const KEY_LENGTH_BITS = 256;

// Encryption key fallback for prototype runtime (Overwritten by process.env.DATA_ENCRYPTION_KEY in production)
const ENCRYPTION_SECRET = process.env.DATA_ENCRYPTION_KEY || 'klambi-aes256-master-key-32bytes!';

/**
 * Derive 256-bit CryptoKey from secret string using SHA-256
 */
async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const rawKey = encoder.encode(secret);

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const keyHash = await crypto.subtle.digest('SHA-256', rawKey);
    return await crypto.subtle.importKey(
      'raw',
      keyHash,
      { name: CIPHER_ALGO, length: KEY_LENGTH_BITS },
      false,
      ['encrypt', 'decrypt']
    );
  }
  throw new Error('SubtleCrypto is required for AES-256-GCM encryption');
}

/**
 * Encrypt sensitive plain text into AES-256-GCM packaged format:
 * `aes256gcm:${ivHex}:${ciphertextAndTagHex}`
 */
export async function encryptSensitiveField(plainText: string, customKey?: string): Promise<string> {
  if (!plainText) return plainText;

  const key = await getCryptoKey(customKey || ENCRYPTION_SECRET);
  const iv = new Uint8Array(IV_LENGTH_BYTES);
  crypto.getRandomValues(iv);

  const encoder = new TextEncoder();
  const encodedData = encoder.encode(plainText);

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: CIPHER_ALGO, iv, tagLength: 128 },
    key,
    encodedData
  );

  const ivHex = Array.from(iv).map((b) => b.toString(16).padStart(2, '0')).join('');
  const cipherHex = Array.from(new Uint8Array(encryptedBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return `aes256gcm:${ivHex}:${cipherHex}`;
}

/**
 * Decrypt an AES-256-GCM packaged string back to plain text
 */
export async function decryptSensitiveField(packagedCipher: string, customKey?: string): Promise<string> {
  if (!packagedCipher || !packagedCipher.startsWith('aes256gcm:')) {
    return packagedCipher; // Not encrypted or legacy value
  }

  const parts = packagedCipher.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid AES-256-GCM cipher format');
  }

  const [, ivHex, cipherHex] = parts;
  const key = await getCryptoKey(customKey || ENCRYPTION_SECRET);

  // Convert hex to Uint8Array
  const iv = new Uint8Array(ivHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));
  const cipherBuffer = new Uint8Array(cipherHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: CIPHER_ALGO, iv, tagLength: 128 },
    key,
    cipherBuffer
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}
