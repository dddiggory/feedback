/**
 * Text manipulation utilities
 */

/**
 * Wraps text to fit within a maximum character length per line
 * @param text - The text to wrap
 * @param maxLength - Maximum characters per line (default: 16)
 * @returns Wrapped text with newlines
 */
export function wrapText(text: string, maxLength: number = 16): string {
  if (text.length <= maxLength) return text;

  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (currentLine.length === 0) {
      currentLine = word;
    } else if ((currentLine + ' ' + word).length <= maxLength) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  
  if (currentLine) lines.push(currentLine);
  return lines.join('\n');
}

/**
 * Gets initials from a name
 * @param name - Full name
 * @returns Initials (e.g., "John Doe" -> "JD")
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
}

/**
 * Cleans a website URL for logo services
 * @param website - Raw website URL
 * @returns Cleaned domain name
 */
export function cleanWebsiteUrl(website: string): string {
  if (!website) return '';
  
  return website
    .replace(/^https?:\/\//, '') // Remove protocol
    .replace(/^www\./, '')       // Remove www prefix
    .replace(/\/$/, '')          // Remove trailing slash
    .split('/')[0]               // Remove path - keep only domain
    .toLowerCase();              // Ensure lowercase
}

/**
 * Generates a logo URL from a website
 * @param website - Company website
 * @returns Logo URL or null if invalid
 */
export function generateLogoUrl(website: string | null): string | null {
  if (!website) return null;
  
  const cleanWebsite = cleanWebsiteUrl(website);
  return `https://img.logo.dev/${cleanWebsite}?token=pk_Lt5wNE7NT2qBNmqdZnx0og&size=20&format=webp`;
}