/**
 * Klambi.id Security Module - Centralized Environment & Secret Validator
 * 
 * Enforces Zero-Hardcoded-Secrets:
 * - Validates all sensitive keys at startup
 * - Detects and rejects insecure defaults in production
 * - Provides type-safe access to application secrets
 */

interface SecureEnvironment {
  NODE_ENV: 'development' | 'production' | 'test';
  JWT_SECRET: string;
  DATA_ENCRYPTION_KEY: string;
  MIDTRANS_SERVER_KEY?: string;
  MIDTRANS_CLIENT_KEY?: string;
  XENDIT_SECRET_KEY?: string;
  NEXT_PUBLIC_APP_URL: string;
}

const INSECURE_DEFAULT_SECRETS = [
  'klambi-id-default-super-secure-production-secret-key-32b',
  'klambi-aes256-master-key-32bytes!',
  'admin',
  'secret',
  'password',
  'changeme',
];

/**
 * Validate and retrieve environment configuration
 */
export function getSecureEnv(): SecureEnvironment {
  const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';
  const jwtSecret = process.env.JWT_SECRET || 'klambi-id-default-super-secure-production-secret-key-32b';
  const encryptionKey = process.env.DATA_ENCRYPTION_KEY || 'klambi-aes256-master-key-32bytes!';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://klambi.id';

  // Strict validation in production mode
  if (nodeEnv === 'production') {
    if (INSECURE_DEFAULT_SECRETS.includes(jwtSecret)) {
      throw new Error(
        'SECURITY VIOLATION: Production build detected with default JWT_SECRET. Please define a high-entropy secret in your environment variables.'
      );
    }

    if (INSECURE_DEFAULT_SECRETS.includes(encryptionKey)) {
      throw new Error(
        'SECURITY VIOLATION: Production build detected with default DATA_ENCRYPTION_KEY. Please set an AES-256 master key in your environment variables.'
      );
    }
  }

  return {
    NODE_ENV: nodeEnv,
    JWT_SECRET: jwtSecret,
    DATA_ENCRYPTION_KEY: encryptionKey,
    MIDTRANS_SERVER_KEY: process.env.MIDTRANS_SERVER_KEY,
    MIDTRANS_CLIENT_KEY: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
    XENDIT_SECRET_KEY: process.env.XENDIT_SECRET_KEY,
    NEXT_PUBLIC_APP_URL: appUrl,
  };
}
