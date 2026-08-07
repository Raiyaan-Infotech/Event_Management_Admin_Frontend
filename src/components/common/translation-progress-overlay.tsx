'use client';

/**
 * Full-screen loader for auto-translation, showing a real percentage.
 *
 * The percentage is genuine, not a simulation: the backend streams one
 * Server-Sent Event per translated field (see the auto-translate `/stream`
 * route), so `done` / `total` reflect actual work completed. Translation is
 * paced at ~350ms per field to stay inside the MyMemory rate limit, so a
 * section with many fields takes long enough that a determinate bar matters.
 */

import { Languages } from 'lucide-react';

interface TranslationProgressOverlayProps {
  open: boolean;
  /** Fields completed so far. */
  done: number;
  /** Total fields in this run. 0 until the first event arrives. */
  total: number;
  /** Label of the field currently being translated. */
  field?: string;
  /** Target language name, e.g. "Tamil". */
  languageName?: string;
}

export function TranslationProgressOverlay({
  open,
  done,
  total,
  field,
  languageName,
}: TranslationProgressOverlayProps) {
  if (!open) return null;

  // Before the first event `total` is 0 — show 0% rather than NaN.
  const percent = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;

  const RADIUS = 52;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const dashOffset = CIRCUMFERENCE * (1 - percent / 100);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm"
    >
      <div className="mx-4 flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl border border-white/10 bg-white p-8 shadow-2xl dark:bg-slate-900">
        <div className="relative h-32 w-32">
          <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r={RADIUS}
              fill="none"
              strokeWidth="8"
              className="stroke-slate-200 dark:stroke-slate-700"
            />
            <circle
              cx="60"
              cy="60"
              r={RADIUS}
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              className="stroke-primary transition-[stroke-dashoffset] duration-300 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold tabular-nums text-slate-900 dark:text-slate-50">
              {percent}%
            </span>
            {total > 0 && (
              <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">
                {done} / {total}
              </span>
            )}
          </div>
        </div>

        <div className="w-full space-y-1.5 text-center">
          <p className="flex items-center justify-center gap-1.5 text-sm font-bold text-slate-900 dark:text-slate-50">
            <Languages className="h-4 w-4 text-primary" />
            Translating{languageName ? ` to ${languageName}` : ''}...
          </p>
          {/* Reserve the line's height so the layout doesn't jump between fields. */}
          <p className="h-4 truncate text-xs text-muted-foreground" title={field}>
            {field || 'Preparing...'}
          </p>
          <p className="pt-1 text-[11px] leading-relaxed text-muted-foreground">
            Please keep this page open. Translations are saved when the run finishes.
          </p>
        </div>
      </div>
    </div>
  );
}
