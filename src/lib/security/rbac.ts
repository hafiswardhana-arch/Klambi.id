/**
 * Klambi.id Security Module - Role-Based Access Control (RBAC) & Ownership Engine
 * 
 * Enforces strict principle of least privilege across user tiers:
 * - Roles: 'user' | 'mitra' | 'admin' | 'cs'
 * - Resource ownership verification: prevents Insecure Direct Object References (IDOR / OWASP A01)
 * - Fine-grained capability matrix
 */

export type AppRole = 'user' | 'mitra' | 'admin' | 'cs';

export type Permission =
  // Orders & Transactions
  | 'orders:create'
  | 'orders:read:own'
  | 'orders:read:assigned'
  | 'orders:read:all'
  | 'orders:update:own'
  | 'orders:status:progress'
  | 'orders:confirm:receipt'
  | 'orders:dispute'
  | 'orders:dispute:resolve'
  // Escrow & Payouts
  | 'escrow:deposit'
  | 'escrow:withdraw:own'
  | 'escrow:release:admin'
  | 'escrow:audit:view'
  // Partner Services
  | 'mitra:profile:manage'
  | 'mitra:pricing:set'
  // Support & Compliance
  | 'support:chat:read'
  | 'support:chat:reply'
  | 'users:manage'
  | 'pdp:erasure:request'
  | 'pdp:erasure:approve';

const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  user: [
    'orders:create',
    'orders:read:own',
    'orders:confirm:receipt',
    'orders:dispute',
    'escrow:deposit',
    'support:chat:reply',
    'pdp:erasure:request',
  ],
  mitra: [
    'orders:read:assigned',
    'orders:status:progress',
    'orders:dispute',
    'escrow:withdraw:own',
    'mitra:profile:manage',
    'mitra:pricing:set',
    'support:chat:reply',
    'pdp:erasure:request',
  ],
  cs: [
    'orders:read:all',
    'orders:dispute',
    'support:chat:read',
    'support:chat:reply',
  ],
  admin: [
    'orders:create',
    'orders:read:own',
    'orders:read:assigned',
    'orders:read:all',
    'orders:update:own',
    'orders:status:progress',
    'orders:confirm:receipt',
    'orders:dispute',
    'orders:dispute:resolve',
    'escrow:deposit',
    'escrow:withdraw:own',
    'escrow:release:admin',
    'escrow:audit:view',
    'mitra:profile:manage',
    'mitra:pricing:set',
    'support:chat:read',
    'support:chat:reply',
    'users:manage',
    'pdp:erasure:request',
    'pdp:erasure:approve',
  ],
};

/**
 * Check whether a role possesses a specific permission
 */
export function hasPermission(role: AppRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(permission) : false;
}

/**
 * Verify resource ownership to prevent IDOR vulnerabilities (OWASP Broken Object Level Authorization)
 */
export function verifyResourceOwnership(
  actor: { id: string; role: AppRole },
  resourceOwnerId: string,
  requiredPermission?: Permission
): { allowed: boolean; reason?: string } {
  // Admins have universal management authority
  if (actor.role === 'admin') {
    return { allowed: true };
  }

  // Check general permission if specified
  if (requiredPermission && !hasPermission(actor.role, requiredPermission)) {
    return {
      allowed: false,
      reason: `Akses ditolak: Peran '${actor.role}' tidak memiliki izin '${requiredPermission}'.`,
    };
  }

  // Strict ownership check for users & partners
  const isOwner = actor.id === resourceOwnerId;
  if (!isOwner) {
    return {
      allowed: false,
      reason: 'Akses ditolak: Anda tidak memiliki otoritas atas data milik pengguna lain (Ownership Check Failed).',
    };
  }

  return { allowed: true };
}
