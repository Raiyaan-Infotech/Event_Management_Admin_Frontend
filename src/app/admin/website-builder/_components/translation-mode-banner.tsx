'use client';

/**
 * Banner shown at the top of a section form while it is being edited in a
 * non-default language. Pairs with `useSectionTranslation` and
 * `TranslationSideCard`.
 */

import { ArrowLeft, Languages as LanguagesIcon, Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { TranslationProgressOverlay } from '@/components/common/translation-progress-overlay';
import type { SectionTranslation } from '@/hooks/useSectionTranslation';

interface TranslationModeBannerProps {
  translation: SectionTranslation;
  /** What is being translated, e.g. "Footer" or "Hero Section — Home Page". */
  label?: string;
}

export function TranslationModeBanner({ translation, label }: TranslationModeBannerProps) {
  const router = useRouter();
  const { isTranslationMode, activeLanguage, autoTranslate, isAutoTranslating, autoTranslateProgress, buildHref } =
    translation;

  if (!isTranslationMode || !activeLanguage) return null;

  return (
    <>
      {/* Rendered here so every wired form gets the full-screen progress
          loader without repeating it. */}
      <TranslationProgressOverlay
        open={isAutoTranslating}
        done={autoTranslateProgress?.done ?? 0}
        total={autoTranslateProgress?.total ?? 0}
        field={autoTranslateProgress?.field}
        // The run covers every active language, so show whichever one the
        // stream is currently on — falling back to the language being edited
        // until the first event arrives.
        languageName={autoTranslateProgress?.language || activeLanguage.name}
      />
      <div className="flex flex-col gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-2">
          <LanguagesIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="min-w-0 text-[11.5px] leading-relaxed text-slate-700">
            You are editing the <strong>{activeLanguage.name}</strong> version
            {label ? ` of ${label}` : ''}. Layout, images, and colors are shared across all languages —
            only the text fields below are translated. Translating fills every empty
            language and never overwrites a translation you already have.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={autoTranslate}
            disabled={isAutoTranslating}
            className="h-7 px-2 text-[11px] font-semibold"
          >
            {isAutoTranslating ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="mr-1 h-3 w-3" />
            )}
            {/* The run fills every active language, not just the one on screen,
                so "Translate from English" would understate it. */}
            Translate all languages
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push(buildHref(null))}
            className="h-7 px-2 text-[11px] font-semibold"
          >
            <ArrowLeft className="mr-1 h-3 w-3" />
            Back to English
          </Button>
        </div>
      </div>
    </>
  );
}
