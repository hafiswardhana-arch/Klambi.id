/**
 * Klambi.id Security Module - Payment Idempotency Engine
 * 
 * Prevents double-charging and race-condition payments:
 * - Complies with IETF Draft: The Idempotency-Key HTTP Header Field
 * - In-flight execution locks to prevent parallel duplicate execution
 * - Returns cached response for exact replay within TTL window (24 hours)
 * - Flags payload mismatch errors if key is reused with modified parameters
 */

export interface IdempotencyRecord {
  key: string;
  status: 'processing' | 'completed' | 'failed';
  requestHash: string;
  responseBody?: unknown;
  createdAt: number;
  expiresAt: number;
}

const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const idempotencyStore = new Map<string, IdempotencyRecord>();

/**
 * Compute simple hash of request body
 */
function hashPayload(payload: unknown): string {
  const str = JSON.stringify(payload || {});
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return `hash_${Math.abs(hash).toString(16)}`;
}

/**
 * Acquire idempotency lock before executing a payment
 */
export function acquireIdempotencyLock(
  idempotencyKey: string,
  requestPayload: unknown
): { canExecute: boolean; cachedResponse?: unknown; error?: string } {
  const now = Date.now();
  const existing = idempotencyStore.get(idempotencyKey);
  const currentPayloadHash = hashPayload(requestPayload);

  // If key already exists
  if (existing) {
    if (now > existing.expiresAt) {
      idempotencyStore.delete(idempotencyKey);
    } else {
      // Check if request payload is identical
      if (existing.requestHash !== currentPayloadHash) {
        return {
          canExecute: false,
          error: 'Idempotency Conflict: Kunci idempotensi sudah digunakan dengan parameter transaksi yang berbeda.',
        };
      }

      if (existing.status === 'processing') {
        return {
          canExecute: false,
          error: 'Transaksi sedang diproses secara bersamaan. Harap tunggu beberapa saat.',
        };
      }

      if (existing.status === 'completed') {
        return {
          canExecute: false,
          cachedResponse: existing.responseBody,
        };
      }
    }
  }

  // Acquire lock
  idempotencyStore.set(idempotencyKey, {
    key: idempotencyKey,
    status: 'processing',
    requestHash: currentPayloadHash,
    createdAt: now,
    expiresAt: now + IDEMPOTENCY_TTL_MS,
  });

  return { canExecute: true };
}

/**
 * Release and complete idempotency lock with final response
 */
export function completeIdempotency(
  idempotencyKey: string,
  responseBody: unknown,
  success: boolean = true
): void {
  const record = idempotencyStore.get(idempotencyKey);
  if (record) {
    record.status = success ? 'completed' : 'failed';
    record.responseBody = responseBody;
  }
}
