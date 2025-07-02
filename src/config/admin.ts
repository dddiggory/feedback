/**
 * Admin Configuration
 * 
 * Simple array-based admin system for internal use.
 * Add/remove email addresses to control admin access.
 */

// List of admin emails - modify this array to control who has admin access
const ADMIN_EMAILS = [
  // Add admin emails here
  'diggory.rycroft@vercel.com',
  // 'another-admin@vercel.com',
] as const;

/**
 * Check if an email address has admin permissions
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return (ADMIN_EMAILS as readonly string[]).includes(email.toLowerCase());
}

/**
 * Get the list of admin emails (for debugging/testing)
 */
export function getAdminEmails(): readonly string[] {
  return ADMIN_EMAILS;
}

/**
 * Type guard for admin user objects
 */
export function isAdminUser(user: { email?: string | null } | null | undefined): boolean {
  return isAdminEmail(user?.email);
} 