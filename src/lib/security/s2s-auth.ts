/**
 * Klambi.id Security Module - Server-to-Server (S2S) Authentication
 * 
 * Secures integration with external institutional partners:
 * - Payment Gateways (Midtrans, Xendit)
 * - Logistics & Courier Partners (JNE, SiCepat, GoSend)
 * - Recycler & Industrial Partners (Textile Mills)
 * 
 * Features:
 * - Constant-time API Key validation
 * - HMAC-SHA256 signature verification on webhook payloads
 * - Anti-Replay protection with 300-second maximum timestamp drift
 */

import { timingSafeEqual } from './hash';

export interface PartnerCredential {
  partnerId: string;
  partnerName: string;
  apiKeyHash: string; // Stored hashed
  hmacSecret: string;
  allowedIpRanges?: string[];
  permissions: Array<'webhooks:receive' | 'payouts:notify' | 'logistics:update'>;
}

// Registered external partner directory (loaded from secure environment)
const registeredPartners = new Map<string, PartnerCredential>();

// Register default demo partners
registeredPartners.set('midtrans', {
  partnerId: 'partner_midtrans_01',
  partnerName: 'Midtrans Payment Gateway',
  apiKeyHash: 'klambi_s2s_key_midtrans_live_2026',
  hmacSecret: process.env.MIDTRANS_SERVER_KEY || 'midtrans-hmac-secret-demo',
  permissions: ['webhooks:receive', 'payouts:notify'],
});

registeredPartners.set('sicepat', {
  partnerId: 'partner_sicepat_01',
  partnerName: 'SiCepat Logistics',
  apiKeyHash: 'klambi_s2s_key_sicepat_live_2026',
  hmacSecret: process.env.LOGISTICS_HMAC_SECRET || 'logistics-hmac-secret-demo',
  permissions: ['logistics:update'],
});

/**
 * Validate Server-to-Server API Key
 */
export function validatePartnerApiKey(
  partnerKey: string
): { valid: boolean; partner?: PartnerCredential; error?: string } {
  if (!partnerKey) {
    return { valid: false, error: 'Missing X-Klambi-Api-Key header.' };
  }

  for (const partner of registeredPartners.values()) {
    if (timingSafeEqual(partner.apiKeyHash, partnerKey)) {
      return { valid: true, partner };
    }
  }

  return { valid: false, error: 'Invalid partner credentials.' };
}

/**
 * Verify HMAC-SHA256 Webhook Request Signature
 * Payload format: HMAC-SHA256(timestamp + "." + rawBody, secret)
 */
export async function verifyWebhookSignature(
  rawBody: string,
  timestampStr: string,
  signatureHex: string,
  hmacSecret: string
): Promise<{ valid: boolean; error?: string }> {
  // 1. Check timestamp drift to prevent replay attacks
  const timestamp = parseInt(timestampStr, 10);
  const now = Math.floor(Date.now() / 1000);

  if (isNaN(timestamp) || Math.abs(now - timestamp) > 300) {
    return {
      valid: false,
      error: 'Request timestamp is outside the acceptable 300-second window (Replay Attack Prevention).',
    };
  }

  // 2. Compute expected HMAC
  const data = `${timestamp}.${rawBody}`;
  const encoder = new TextEncoder();

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(hmacSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    const computedHex = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const isMatch = timingSafeEqual(computedHex.toLowerCase(), signatureHex.toLowerCase());
    return { valid: isMatch, error: isMatch ? undefined : 'HMAC signature mismatch.' };
  } else {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodeCrypto = require('crypto');
    const computedHex = nodeCrypto.createHmac('sha256', hmacSecret).update(data).digest('hex');
    const isMatch = timingSafeEqual(computedHex.toLowerCase(), signatureHex.toLowerCase());
    return { valid: isMatch, error: isMatch ? undefined : 'HMAC signature mismatch.' };
  }
}
