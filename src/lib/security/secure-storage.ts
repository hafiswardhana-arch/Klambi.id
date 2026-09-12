/**
 * Klambi.id Security Module - Secure Client-Side Storage
 * 
 * Protects cached data on user mobile/desktop devices:
 * - Automatically encrypts all values using AES-256-GCM before writing to localStorage
 * - Obfuscates storage keys to prevent trivial inspection by untrusted browser extensions
 * - Mitigates plain-text token theft via physical device access or XSS
 */

import { encryptSensitiveField, decryptSensitiveField } from './crypto';

const STORAGE_PREFIX = 'klambi_sec_';

/**
 * Obfuscate storage key name
 */
function getStorageKey(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash) + key.charCodeAt(i);
    hash |= 0;
  }
  return `${STORAGE_PREFIX}${Math.abs(hash).toString(16)}`;
}

/**
 * Encrypt and store an item in localStorage
 */
export async function setSecureItem<T>(key: string, value: T): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const rawString = JSON.stringify(value);
    const encrypted = await encryptSensitiveField(rawString);
    const storageKey = getStorageKey(key);
    localStorage.setItem(storageKey, encrypted);
  } catch (err) {
    console.warn('[Klambi Security] Failed to save secure item to local storage:', err);
  }
}

/**
 * Retrieve and decrypt an item from localStorage
 */
export async function getSecureItem<T>(key: string): Promise<T | null> {
  if (typeof window === 'undefined') return null;

  try {
    const storageKey = getStorageKey(key);
    const cipherText = localStorage.getItem(storageKey);
    if (!cipherText) return null;

    const decrypted = await decryptSensitiveField(cipherText);
    return JSON.parse(decrypted) as T;
  } catch (err) {
    console.warn('[Klambi Security] Failed to read or decrypt secure item:', err);
    return null;
  }
}

/**
 * Remove an item from secure storage
 */
export function removeSecureItem(key: string): void {
  if (typeof window === 'undefined') return;
  const storageKey = getStorageKey(key);
  localStorage.removeItem(storageKey);
}
