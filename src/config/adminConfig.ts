/**
 * Admin Configuration
 * 
 * ONLY 2 emails are granted Admin Dashboard access.
 * Configure your 2 admin emails via environment variables:
 * - VITE_ADMIN_EMAIL_1
 * - VITE_ADMIN_EMAIL_2
 */

export const DEFAULT_ADMIN_EMAILS: [string, string] = [
  'hk1100411004@gmail.com',
  'mithunjr.csesrm@gmail.com',
];

/**
 * Get the currently configured 2 admin emails
 */
export function getAuthorizedAdminEmails(): [string, string] {
  const email1 =
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_ADMIN_EMAIL_1) ||
    DEFAULT_ADMIN_EMAILS[0];
  const email2 =
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_ADMIN_EMAIL_2) ||
    DEFAULT_ADMIN_EMAILS[1];

  return [email1.trim().toLowerCase(), email2.trim().toLowerCase()];
}

/**
 * Checks if a given email is one of the two authorized admin emails
 */
export function isAuthorizedAdmin(email?: string | null): boolean {
  if (!email || !email.trim()) return false;
  const [admin1, admin2] = getAuthorizedAdminEmails();
  const normalized = email.trim().toLowerCase();
  
  if (!admin1 && !admin2) {
    return false;
  }
  return (Boolean(admin1) && normalized === admin1) || (Boolean(admin2) && normalized === admin2);
}
