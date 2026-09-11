/**
 * Klambi.id Security Module - Session Management & Validation
 * 
 * Enforces server-side and client-side session validation:
 * - Session re-validation for sensitive actions (payments, withdrawals, profile changes)
 * - Idle session timeout (30 minutes of inactivity)
 * - Device fingerprinting to catch session hijacking
 */

export interface UserSession {
  sessionId: string;
  userId: string;
  username: string;
  role: 'user' | 'mitra' | 'admin' | 'cs';
  deviceFingerprint: string;
  createdAt: number;
  lastActiveAt: number;
  ipAddress?: string;
  isValid: boolean;
}

const SESSION_INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const activeSessions = new Map<string, UserSession>();

/**
 * Generate simple browser / device fingerprint string
 */
export function getDeviceFingerprint(): string {
  if (typeof window === 'undefined') return 'server_runtime';
  const nav = window.navigator;
  const screen = window.screen;
  const raw = `${nav.userAgent}|${screen.width}x${screen.height}|${nav.language}`;
  
  // Simple hash for fingerprint
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash) + raw.charCodeAt(i);
    hash |= 0;
  }
  return `fp_${Math.abs(hash).toString(16)}`;
}

/**
 * Create a new user session
 */
export function createSession(
  userId: string,
  username: string,
  role: 'user' | 'mitra' | 'admin' | 'cs' = 'user',
  deviceFingerprint?: string,
  ipAddress?: string
): UserSession {
  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = Date.now();
  const session: UserSession = {
    sessionId,
    userId,
    username,
    role,
    deviceFingerprint: deviceFingerprint || getDeviceFingerprint(),
    createdAt: now,
    lastActiveAt: now,
    ipAddress,
    isValid: true,
  };

  activeSessions.set(sessionId, session);
  return session;
}

/**
 * Validate an active session on sensitive actions
 */
export function validateSession(
  sessionId: string,
  currentFingerprint?: string
): { valid: boolean; session?: UserSession; reason?: string } {
  const session = activeSessions.get(sessionId);

  if (!session || !session.isValid) {
    return { valid: false, reason: 'Sesi tidak ditemukan atau telah berakhir.' };
  }

  const now = Date.now();

  // Check inactivity timeout
  if (now - session.lastActiveAt > SESSION_INACTIVITY_TIMEOUT_MS) {
    session.isValid = false;
    activeSessions.delete(sessionId);
    return { valid: false, reason: 'Sesi kedaluwarsa karena tidak ada aktivitas selama 30 menit.' };
  }

  // Check fingerprint match if provided (detect session hijacking)
  const fp = currentFingerprint || getDeviceFingerprint();
  if (fp !== 'server_runtime' && session.deviceFingerprint !== fp) {
    // Flag suspicious activity
    return { valid: false, reason: 'Perangkat tidak cocok dengan sesi awal. Silakan login kembali.' };
  }

  // Update activity timestamp
  session.lastActiveAt = now;
  return { valid: true, session };
}

/**
 * Terminate a session on logout
 */
export function destroySession(sessionId: string): void {
  activeSessions.delete(sessionId);
}
