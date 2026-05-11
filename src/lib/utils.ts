import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function stripHtml(html: string): string {
  if (!html) return '';
  if (typeof window === 'undefined') {
    return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
  }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
}

/**
 * Resolves a media URL safely.
 * - blob:/data: → returned as-is (local preview URLs).
 * - http(s)://host/uploads/... → /uploads/... (uses Next.js rewrite proxy).
 * - /api/uploads/... → /uploads/... (normalise old format).
 * - /uploads/... → returned as-is (already correct for rewrite).
 * - S3/CDN or other absolute URLs → returned as-is.
 * - Null / undefined / empty → empty string.
 */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('blob:') || url.startsWith('data:')) return url;
  // Old /api/uploads/ format → /uploads/ (uses Next.js rewrite)
  if (url.startsWith('/api/uploads/')) {
    return url.replace('/api/uploads/', '/uploads/');
  }
  // Absolute http(s) URLs (local server or S3/CDN) → return as-is.
  // <img> tags load cross-origin images without CORS restrictions.
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return url;
}
