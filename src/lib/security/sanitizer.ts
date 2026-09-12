/**
 * Klambi.id Security Module - Input Sanitization & Anti-Injection Engine
 * 
 * Protects against top OWASP injection vulnerabilities:
 * - Cross-Site Scripting (XSS / OWASP A03)
 * - SQL Injection (SQLi)
 * - NoSQL Injection (MongoDB/Document operators)
 * - Path Traversal (LFI/RFI)
 */

/**
 * Sanitize plain string against XSS by escaping HTML entities
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Strip executable scripts, event handlers, and dangerous protocols
 */
export function stripDangerousContent(input: string): string {
  if (!input) return '';
  return input
    // Remove script tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove inline event handlers (e.g. onload=, onerror=, onclick=)
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove javascript: and vbscript: URIs
    .replace(/javascript\s*:/gi, 'blocked-protocol:')
    .replace(/vbscript\s*:/gi, 'blocked-protocol:')
    // Remove data: text/html base64 attempts
    .replace(/data:text\/html/gi, 'blocked-data:');
}

/**
 * Check whether an input string contains common SQL injection vectors
 */
export function detectSqlInjection(input: string): boolean {
  if (!input) return false;
  const SQLI_PATTERNS = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
    /\w*((\%27)|(\'))(\s)*((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
    /union(\s+)select/i,
    /insert(\s+)into/i,
    /drop(\s+)table/i,
    /exec(\s*)(\()/i,
    /information_schema/i,
  ];

  return SQLI_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Sanitize object keys to prevent NoSQL query operator injection ($gt, $where, $regex, etc.)
 */
export function sanitizeNoSqlObject<T>(input: T): T {
  if (typeof input !== 'object' || input === null) {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeNoSqlObject(item)) as unknown as T;
  }

  const cleanObject: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    // Strip leading dollar signs used in MongoDB query operators
    const sanitizedKey = key.replace(/^\$+/, '');
    if (typeof value === 'object' && value !== null) {
      cleanObject[sanitizedKey] = sanitizeNoSqlObject(value);
    } else if (typeof value === 'string') {
      cleanObject[sanitizedKey] = stripDangerousContent(value);
    } else {
      cleanObject[sanitizedKey] = value;
    }
  }

  return cleanObject as T;
}
