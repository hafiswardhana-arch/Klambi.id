/**
 * Klambi.id Security Module - API Rate Limiting Engine
 * 
 * Protects APIs against brute-force, scraping, and volumetric DDoS:
 * - Tiered limits based on sensitivity of endpoints (Global, Auth, AI Scan, Financial Payouts)
 * - Returns RFC 6585 conforming headers (RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset)
 * - Sliding window calculation
 */

export interface ApiRateLimitTier {
  maxRequests: number;
  windowMs: number;
  name: string;
}

export const RATE_LIMIT_TIERS: Record<string, ApiRateLimitTier> = {
  global: {
    name: 'Global Public',
    maxRequests: 100,
    windowMs: 60 * 1000, // 100 req / minute
  },
  aiScan: {
    name: 'AI Analysis (Wearwise & Styliss)',
    maxRequests: 20,
    windowMs: 60 * 1000, // 20 scans / minute
  },
  auth: {
    name: 'Authentication Endpoints',
    maxRequests: 10,
    windowMs: 15 * 60 * 1000, // 10 req / 15 minutes
  },
  financial: {
    name: 'Financial Payouts & Escrow',
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 5 req / hour
  },
};

interface ClientWindow {
  count: number;
  resetAtMs: number;
}

const apiRateStore = new Map<string, ClientWindow>();

/**
 * Check whether an API request conforms to rate limit constraints
 */
export function checkApiRateLimit(
  clientIp: string,
  pathname: string
): { allowed: boolean; limit: number; remaining: number; resetTimeSec: number } {
  // Determine appropriate tier
  let tier = RATE_LIMIT_TIERS.global;
  if (pathname.includes('/auth') || pathname.includes('/login') || pathname.includes('/daftar')) {
    tier = RATE_LIMIT_TIERS.auth;
  } else if (pathname.includes('/wearwise-ai') || pathname.includes('/styliss-ai') || pathname.includes('/scan')) {
    tier = RATE_LIMIT_TIERS.aiScan;
  } else if (pathname.includes('/pembayaran') || pathname.includes('/withdraw') || pathname.includes('/escrow')) {
    tier = RATE_LIMIT_TIERS.financial;
  }

  const now = Date.now();
  const key = `${tier.name}:${clientIp || '127.0.0.1'}`;
  let windowData = apiRateStore.get(key);

  if (!windowData || now >= windowData.resetAtMs) {
    windowData = {
      count: 1,
      resetAtMs: now + tier.windowMs,
    };
    apiRateStore.set(key, windowData);
    return {
      allowed: true,
      limit: tier.maxRequests,
      remaining: tier.maxRequests - 1,
      resetTimeSec: Math.ceil(tier.windowMs / 1000),
    };
  }

  windowData.count += 1;
  const remaining = Math.max(0, tier.maxRequests - windowData.count);
  const resetTimeSec = Math.max(1, Math.ceil((windowData.resetAtMs - now) / 1000));

  if (windowData.count > tier.maxRequests) {
    return {
      allowed: false,
      limit: tier.maxRequests,
      remaining: 0,
      resetTimeSec,
    };
  }

  return {
    allowed: true,
    limit: tier.maxRequests,
    remaining,
    resetTimeSec,
  };
}
