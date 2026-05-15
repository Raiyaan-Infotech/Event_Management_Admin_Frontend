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
 * - blob:/data: â†’ returned as-is (local preview URLs).
 * - http(s)://host/uploads/... â†’ /uploads/... (uses Next.js rewrite proxy).
 * - /api/uploads/... â†’ /uploads/... (normalise old format).
 * - /uploads/... â†’ returned as-is (already correct for rewrite).
 * - S3/CDN or other absolute URLs â†’ returned as-is.
 * - Null / undefined / empty â†’ empty string.
 */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('blob:') || url.startsWith('data:')) return url;
  // Old /api/uploads/ format â†’ /uploads/ (uses Next.js rewrite)
  if (url.startsWith('/api/uploads/')) {
    return url.replace('/api/uploads/', '/uploads/');
  }
  // Absolute http(s) URLs (local server or S3/CDN) â†’ return as-is.
  // <img> tags load cross-origin images without CORS restrictions.
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return url;
}

export interface NormalizedPagination {
  page: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

export function normalizeRows<T>(rows: T[] | { rows?: T[] } | null | undefined): T[] {
  if (Array.isArray(rows)) return rows;
  if (rows?.rows && Array.isArray(rows.rows)) return rows.rows;
  return [];
}

export function normalizePagination(
  pagination: Partial<NormalizedPagination & { total?: number; total_records?: number }> | null | undefined,
  page = 1,
  limit = 10,
): NormalizedPagination {
  const totalItems = Number(pagination?.totalItems ?? pagination?.total ?? pagination?.total_records ?? 0);
  const totalPages = Number(pagination?.totalPages ?? Math.max(1, Math.ceil(totalItems / limit)));
  const currentPage = Number(pagination?.page ?? page);

  return {
    page: currentPage,
    totalPages,
    totalItems,
    hasNextPage: Boolean(pagination?.hasNextPage ?? currentPage < totalPages),
    hasPrevPage: Boolean(pagination?.hasPrevPage ?? currentPage > 1),
    limit: Number(pagination?.limit ?? limit),
  };
}
