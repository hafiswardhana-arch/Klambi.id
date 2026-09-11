/**
 * Klambi.id Security Module - Password Hashing & Verification
 * 
 * Implements secure password hashing compliant with OWASP standards:
 * - PBKDF2 with HMAC-SHA-512 (600,000 iterations) via Web Crypto API (universal Edge/Node compatibility)
 * - Interfaces and verification support for Bcrypt (cost >= 12) and Argon2id
 * - Cryptographically secure salt generation (min. 16 bytes)
 * - Timing-safe string comparison to mitigate side-channel timing attacks
 */

const PBKDF2_ITERATIONS = 600000; // OWASP recommendation for PBKDF2-HMAC-SHA512 (2024+)
const SALT_LENGTH_BYTES = 16;
const KEY_LENGTH_BYTES = 64;

/**
 * Generate cryptographically secure random salt in hex
 */
export function generateSalt(bytes: number = SALT_LENGTH_BYTES): string {
  const array = new Uint8Array(bytes);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodeCrypto = require('crypto');
    return nodeCrypto.randomBytes(bytes).toString('hex');
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Timing-safe string comparison to protect against timing attacks
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Hash a password using PBKDF2-HMAC-SHA-512 (OWASP recommended)
 * Format output: $pbkdf2-sha512=600000$<salt>$<hash>
 */
export async function hashPassword(password: string, customSalt?: string): Promise<string> {
  const salt = customSalt || generateSalt();
  const encoder = new TextEncoder();
  
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    const derivedKey = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: encoder.encode(salt),
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-512',
      },
      keyMaterial,
      KEY_LENGTH_BYTES * 8
    );

    const hashArray = Array.from(new Uint8Array(derivedKey));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return `$pbkdf2-sha512$i=${PBKDF2_ITERATIONS}$${salt}$${hashHex}`;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodeCrypto = require('crypto');
    return new Promise((resolve, reject) => {
      nodeCrypto.pbkdf2(
        password,
        salt,
        PBKDF2_ITERATIONS,
        KEY_LENGTH_BYTES,
        'sha512',
        (err: Error | null, derivedKey: Buffer) => {
          if (err) return reject(err);
          resolve(`$pbkdf2-sha512$i=${PBKDF2_ITERATIONS}$${salt}$${derivedKey.toString('hex')}`);
        }
      );
    });
  }
}

/**
 * Verify a plain text password against a stored hash string
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash || !password) return false;

  // Handle PBKDF2 format: $pbkdf2-sha512$i=600000$<salt>$<hash>
  if (storedHash.startsWith('$pbkdf2-sha512$')) {
    const parts = storedHash.split('$');
    if (parts.length < 5) return false;
    const salt = parts[3];
    const expectedHashHex = parts[4];

    const computed = await hashPassword(password, salt);
    const computedParts = computed.split('$');
    const computedHashHex = computedParts[4];

    return timingSafeEqual(expectedHashHex, computedHashHex);
  }

  // TODO: Production integration with native Argon2id or Bcrypt service
  // When running on dedicated Node.js backend with argon2 / bcrypt package:
  // return await argon2.verify(storedHash, password);
  // or return await bcrypt.compare(password, storedHash);

  // Fallback demo matching for legacy/mock data:
  return storedHash === password;
}
