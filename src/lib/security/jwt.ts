/**
 * Klambi.id Security Module - JWT & Token Lifecycle
 * 
 * Implements short-lived access tokens + refresh tokens:
 * - Access Token TTL: 15 minutes (OWASP standard for sensitive financial apps)
 * - Refresh Token TTL: 7 days
 * - Cryptographic HMAC-SHA256 signature (Web Crypto API)
 * - Revocation Registry (Token Blacklist) on user logout or privilege change
 */

export interface TokenPayload {
  sub: string; // userId
  username: string;
  role: 'user' | 'mitra' | 'admin' | 'cs';
  iat: number;
  exp: number;
  jti: string; // unique token ID for revocation
  tokenType: 'access' | 'refresh';
}

const ACCESS_TOKEN_TTL_SEC = 15 * 60; // 15 minutes
const REFRESH_TOKEN_TTL_SEC = 7 * 24 * 60 * 60; // 7 days

// Default secret fallback (must be overwritten via process.env.JWT_SECRET in production)
const JWT_SECRET = process.env.JWT_SECRET || 'klambi-id-default-super-secure-production-secret-key-32b';

// Revoked token registry (JTI blacklist)
const tokenBlacklist = new Set<string>();

/**
 * Base64 URL encode
 */
function base64UrlEncode(str: string): string {
  const base64 = typeof btoa !== 'undefined'
    ? btoa(str)
    : Buffer.from(str).toString('base64');
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * Base64 URL decode
 */
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return typeof atob !== 'undefined'
    ? atob(base64)
    : Buffer.from(base64, 'base64').toString('utf8');
}

/**
 * Sign data with HMAC-SHA256 using Web Crypto / Node crypto
 */
async function createHmacSignature(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    const sigArray = Array.from(new Uint8Array(signature));
    const binary = String.fromCharCode(...sigArray);
    return base64UrlEncode(binary);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodeCrypto = require('crypto');
    return nodeCrypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }
}

/**
 * Generate Access and Refresh Token pair
 */
export async function generateTokenPair(
  userId: string,
  username: string,
  role: 'user' | 'mitra' | 'admin' | 'cs' = 'user'
): Promise<{ accessToken: string; refreshToken: string; accessExpiresAt: number; refreshExpiresAt: number }> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };

  // 1. Access Token (15m)
  const accessPayload: TokenPayload = {
    sub: userId,
    username,
    role,
    iat: now,
    exp: now + ACCESS_TOKEN_TTL_SEC,
    jti: `atk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    tokenType: 'access',
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedAccessPayload = base64UrlEncode(JSON.stringify(accessPayload));
  const accessData = `${encodedHeader}.${encodedAccessPayload}`;
  const accessSignature = await createHmacSignature(accessData, JWT_SECRET);
  const accessToken = `${accessData}.${accessSignature}`;

  // 2. Refresh Token (7 days)
  const refreshPayload: TokenPayload = {
    sub: userId,
    username,
    role,
    iat: now,
    exp: now + REFRESH_TOKEN_TTL_SEC,
    jti: `rtk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    tokenType: 'refresh',
  };

  const encodedRefreshPayload = base64UrlEncode(JSON.stringify(refreshPayload));
  const refreshData = `${encodedHeader}.${encodedRefreshPayload}`;
  const refreshSignature = await createHmacSignature(refreshData, JWT_SECRET);
  const refreshToken = `${refreshData}.${refreshSignature}`;

  return {
    accessToken,
    refreshToken,
    accessExpiresAt: accessPayload.exp * 1000,
    refreshExpiresAt: refreshPayload.exp * 1000,
  };
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<{ valid: boolean; payload?: TokenPayload; error?: string }> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Malformed token structure' };
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const data = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = await createHmacSignature(data, JWT_SECRET);

    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid token signature' };
    }

    const payload: TokenPayload = JSON.parse(base64UrlDecode(encodedPayload));

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return { valid: false, error: 'Token has expired' };
    }

    // Check revocation list
    if (tokenBlacklist.has(payload.jti)) {
      return { valid: false, error: 'Token has been revoked' };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false, error: 'Token decoding failed' };
  }
}

/**
 * Revoke a token by JTI on logout
 */
export function revokeToken(jti: string): void {
  tokenBlacklist.add(jti);
}
