/**
 * Klambi.id Security Module - Rate Limiter
 * 
 * Implements sliding window rate limiter:
 * - Default: max 5 failed attempts per 15 minutes per IP/account key
 * - Lockout duration enforcement
 * - In-memory store with TTL and client-side / edge cache compatibility
 * - Supports reset on successful authentication
 */

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  resetTimeMs: number;
  retryAfterSeconds: number;
}

interface AttemptRecord {
  count: number;
  firstAttemptMs: number;
  blockedUntilMs?: number;
}

// In-memory tracker map for Node / Edge runtime
const memoryStore = new Map<string, AttemptRecord>();

// Default OWASP-compliant config for auth endpoints: 5 attempts per 15 minutes
export const DEFAULT_AUTH_RATE_LIMIT: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 15 * 60 * 1000, // 15 minutes lockout
};

/**
 * Check and consume a rate-limit attempt for a given identifier (IP or username)
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_AUTH_RATE_LIMIT
): RateLimitResult {
  const now = Date.now();
  const key = `ratelimit:${identifier.toLowerCase().trim()}`;
  let record = memoryStore.get(key);

  // Check client-side sessionStorage backup if in browser environment
  if (!record && typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(key);
      if (stored) {
        record = JSON.parse(stored);
      }
    } catch {
      // Ignore JSON parse errors
    }
  }

  // If no record exists or window has expired
  if (!record || now - record.firstAttemptMs > config.windowMs) {
    record = {
      count: 1,
      firstAttemptMs: now,
    };
    saveRecord(key, record);
    return {
      allowed: true,
      remainingAttempts: config.maxAttempts - 1,
      resetTimeMs: now + config.windowMs,
      retryAfterSeconds: 0,
    };
  }

  // Check if currently blocked
  if (record.blockedUntilMs && record.blockedUntilMs > now) {
    const retryAfterSeconds = Math.ceil((record.blockedUntilMs - now) / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      resetTimeMs: record.blockedUntilMs,
      retryAfterSeconds,
    };
  }

  // Increment attempt counter
  record.count += 1;

  if (record.count > config.maxAttempts) {
    record.blockedUntilMs = now + (config.blockDurationMs || config.windowMs);
    saveRecord(key, record);
    const retryAfterSeconds = Math.ceil((record.blockedUntilMs - now) / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      resetTimeMs: record.blockedUntilMs,
      retryAfterSeconds,
    };
  }

  saveRecord(key, record);

  return {
    allowed: true,
    remainingAttempts: config.maxAttempts - record.count,
    resetTimeMs: record.firstAttemptMs + config.windowMs,
    retryAfterSeconds: 0,
  };
}

/**
 * Reset rate limit tracker upon successful login/action
 */
export function resetRateLimit(identifier: string): void {
  const key = `ratelimit:${identifier.toLowerCase().trim()}`;
  memoryStore.delete(key);
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // Ignore
    }
  }
}

function saveRecord(key: string, record: AttemptRecord): void {
  memoryStore.set(key, record);
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(key, JSON.stringify(record));
    } catch {
      // Storage quota exceeded or disabled
    }
  }
}
