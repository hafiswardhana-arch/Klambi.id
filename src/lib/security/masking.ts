/**
 * Klambi.id Security Module - Data Masking & PII Redaction
 * 
 * Enforces data privacy in API responses, user interfaces, and server logging:
 * - Redacts passwords, OTPs, API keys, and CVVs completely
 * - Masks bank account numbers, NIK/KTP, phone numbers, and emails
 * - Complies with UU No. 27/2022 (PDP) & OWASP Logging standards
 */

/**
 * Mask a bank account or card number: shows only last 4 digits
 * Example: "1234567890" -> "••••••7890"
 */
export function maskBankAccount(accountNumber: string): string {
  if (!accountNumber) return '';
  const clean = accountNumber.replace(/\s+/g, '');
  if (clean.length <= 4) return '••••';
  const visible = clean.slice(-4);
  return `${'•'.repeat(Math.min(clean.length - 4, 8))}${visible}`;
}

/**
 * Mask Indonesian NIK / KTP number: shows first 4 and last 2 digits
 * Example: "3171012345670001" -> "3171••••••••••01"
 */
export function maskKtp(ktpNumber: string): string {
  if (!ktpNumber) return '';
  const clean = ktpNumber.replace(/\D/g, '');
  if (clean.length < 6) return '••••••••';
  const prefix = clean.slice(0, 4);
  const suffix = clean.slice(-2);
  return `${prefix}${'•'.repeat(clean.length - 6)}${suffix}`;
}

/**
 * Mask email address: shows first letter and domain
 * Example: "hafiz@klambi.id" -> "h••••@klambi.id"
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '••••@••••.com';
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) {
    return `${localPart[0]}•@${domain}`;
  }
  const first = localPart[0];
  const last = localPart[localPart.length - 1];
  return `${first}${'•'.repeat(Math.max(localPart.length - 2, 3))}${last}@${domain}`;
}

/**
 * Mask phone number: shows country code and last 3 digits
 * Example: "08123456789" -> "0812•••••789"
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone) return '';
  const clean = phone.replace(/\D/g, '');
  if (clean.length < 7) return '••••••••';
  const prefix = clean.slice(0, 4);
  const suffix = clean.slice(-3);
  return `${prefix}${'•'.repeat(clean.length - 7)}${suffix}`;
}

/**
 * Deep-clone and sanitize an object for logging or public display:
 * Automatically scrubs sensitive keywords (password, token, otp, secret, cvv)
 */
export function sanitizeLogObject<T extends Record<string, unknown>>(data: T): Record<string, unknown> {
  const SENSITIVE_KEYS = [
    'password',
    'passwd',
    'secret',
    'token',
    'access_token',
    'refresh_token',
    'otp',
    'code',
    'pin',
    'cvv',
    'card_number',
    'apikey',
    'authorization',
  ];

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some((s) => lowerKey.includes(s))) {
      result[key] = '[REDACTED_BY_KLAMBI_SECURITY]';
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeLogObject(value as Record<string, unknown>);
    } else if (lowerKey.includes('rekening') || lowerKey.includes('account_number')) {
      result[key] = maskBankAccount(String(value));
    } else if (lowerKey.includes('ktp') || lowerKey.includes('nik')) {
      result[key] = maskKtp(String(value));
    } else if (lowerKey.includes('email')) {
      result[key] = maskEmail(String(value));
    } else if (lowerKey.includes('phone') || lowerKey.includes('telepon')) {
      result[key] = maskPhoneNumber(String(value));
    } else {
      result[key] = value;
    }
  }

  return result;
}
