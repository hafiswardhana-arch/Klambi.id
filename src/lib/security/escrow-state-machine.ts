/**
 * Klambi.id Security Module - Escrow State Machine
 * 
 * Enforces strict lifecycle transitions for circular marketplace & service escrows:
 * - Direct jumps (e.g. PAID directly to COMPLETED without IN_PROGRESS) are strictly rejected
 * - Role-based authorization per transition:
 *   - Only Mitra can accept and mark order IN_PROGRESS
 *   - Only Buyer (User) or System auto-release can mark COMPLETED
 *   - Only Admin can resolve DISPUTED orders
 */

import { TransactionStatus } from './audit-logger';

export type UserRole = 'user' | 'mitra' | 'admin' | 'system' | 'cs';

interface StateTransitionRule {
  from: TransactionStatus;
  to: TransactionStatus;
  allowedRoles: UserRole[];
  description: string;
}

// Authoritative transition table
const VALID_TRANSITIONS: StateTransitionRule[] = [
  // 1. Order Created -> Paid
  {
    from: 'CREATED',
    to: 'PAID',
    allowedRoles: ['user', 'system'],
    description: 'Pembeli melakukan pembayaran ke Rekening Bersama (Escrow)',
  },
  // 2. Order Created -> Cancelled (timeout / buyer abort)
  {
    from: 'CREATED',
    to: 'CANCELLED',
    allowedRoles: ['user', 'system'],
    description: 'Pembayaran kedaluwarsa atau dibatalkan sebelum dibayar',
  },
  // 3. Paid -> In Progress (Mitra accepts & starts work)
  {
    from: 'PAID',
    to: 'IN_PROGRESS',
    allowedRoles: ['mitra', 'system'],
    description: 'Mitra/Penjual memproses pesanan / memulai jasa perawatan pakaian',
  },
  // 4. Paid -> Refunded (Mitra declines order)
  {
    from: 'PAID',
    to: 'REFUNDED',
    allowedRoles: ['mitra', 'admin', 'system'],
    description: 'Mitra menolak pesanan; dana escrow dikembalikan 100% ke pembeli',
  },
  // 5. In Progress -> Completed (Buyer confirms receipt or 48h SLA auto-release)
  {
    from: 'IN_PROGRESS',
    to: 'COMPLETED',
    allowedRoles: ['user', 'system'],
    description: 'Pembeli mengonfirmasi kepuasan hasil layanan/barang; dana escrow dicairkan ke mitra',
  },
  // 6. In Progress -> Disputed (Problem reported)
  {
    from: 'IN_PROGRESS',
    to: 'DISPUTED',
    allowedRoles: ['user', 'mitra'],
    description: 'Ada kendala pada pesanan; eskalasi ke mediasi Customer Support / Admin',
  },
  // 7. Disputed -> Completed (Mediation resolved in favor of Mitra)
  {
    from: 'DISPUTED',
    to: 'COMPLETED',
    allowedRoles: ['admin'],
    description: 'Admin memutuskan penyelesaian dispute untuk pencairan dana ke mitra',
  },
  // 8. Disputed -> Refunded (Mediation resolved in favor of Buyer)
  {
    from: 'DISPUTED',
    to: 'REFUNDED',
    allowedRoles: ['admin'],
    description: 'Admin memutuskan pengembalian dana escrow kepada pembeli',
  },
];

/**
 * Validate whether a proposed escrow state transition is legally permissible
 */
export function validateStateTransition(
  currentStatus: TransactionStatus,
  targetStatus: TransactionStatus,
  actorRole: UserRole
): { isValid: boolean; reason?: string } {
  // Terminal states cannot transition further
  if (currentStatus === 'COMPLETED' || currentStatus === 'REFUNDED' || currentStatus === 'CANCELLED') {
    return {
      isValid: false,
      reason: `Status transaksi sudah final (${currentStatus}) dan tidak dapat diubah lagi.`,
    };
  }

  // Find matching transition in rule table
  const matchingRule = VALID_TRANSITIONS.find(
    (rule) => rule.from === currentStatus && rule.to === targetStatus
  );

  if (!matchingRule) {
    return {
      isValid: false,
      reason: `Transisi ilegal: Status transaksi tidak dapat berpindah dari '${currentStatus}' langsung ke '${targetStatus}'. Alur kerja wajib melalui status perantara.`,
    };
  }

  // Check role authorization
  if (!matchingRule.allowedRoles.includes(actorRole)) {
    return {
      isValid: false,
      reason: `Akses ditolak: Peran '${actorRole}' tidak memiliki hak otorisasi untuk mengubah status dari '${currentStatus}' ke '${targetStatus}'. Diperlukan peran: [${matchingRule.allowedRoles.join(', ')}].`,
    };
  }

  return { isValid: true };
}
