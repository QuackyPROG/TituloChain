import crypto from 'crypto';

/**
 * Computes a deterministic 12-character uppercase hex verification token
 * from the title number and verification ISO timestamp.
 */
export function computeToken(titleNumber: string, verifiedAt: string): string {
  const data = `${titleNumber}|${verifiedAt}`;
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  return hash.substring(0, 12).toUpperCase();
}
