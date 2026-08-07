'use client';

import { useRouter } from 'next/navigation';
import { Languages, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  useBuilderLanguages,
  useContentTranslations,
} from '@/hooks/useWebsiteBuilderTranslations';

export interface TranslatableField {
  key: string;
  label: string;
  value: string; // current English/base value
  type?: 'input' | 'textarea';
  maxLength?: number;
}

interface TranslationSideCardProps {
  section: string;
  pageSlug?: string;
  recordId?: number;
  fields: TranslatableField[];
  /** Language id of the version currently being edited; null/undefined = English (source). */
  activeLanguageId?: number | null;
  /** Builds the URL to view/edit this same section in the given language (null = English). */
  buildHref: (languageId: number | null) => string;
  /**
   * Set false when the section has no saved row yet. Translations are stored
   * against a record id, so without one there is nothing to translate — the
   * card explains that instead of offering languages that lead nowhere.
   */
  canTranslate?: boolean;
}

export function TranslationSideCard({
  section,
  pageSlug,
  recordId,
  fields,
  activeLanguageId,
  buildHref,
  canTranslate = true,
}: TranslationSideCardProps) {
  const router = useRouter();
  const { data: languages, isLoading: languagesLoading } = useBuilderLanguages();
  const { data: translations } = useContentTranslations(section, pageSlug, recordId);


  const defaultLanguage = (languages || []).find((lang) => Number(lang.is_default) === 1);
  const otherLanguages = (languages || []).filter((lang) => Number(lang.is_default) !== 1);
  const isEnglishActive = !activeLanguageId;

  const filledCount = (languageId: number) => {
    const values = translations?.[languageId] || {};
    return fields.filter((f) => (values[f.key] || '').trim().length > 0).length;
  };


  const rowClass = (active: boolean) =>
    cn(
      'w-full flex items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors cursor-pointer',
      active
        ? 'border-primary bg-primary/5'
        : 'border-slate-200 hover:border-primary/40 hover:bg-primary/5'
    );

  // Radio-style dot on the left edge of the row — the selected language should
  // be readable at a glance without scanning to the far right.
  const radioDot = (active: boolean) => (
    <span
      aria-hidden
      className={cn(
        'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
        active ? 'border-primary' : 'border-slate-300'
      )}
    >
      {active && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
    </span>
  );

  return (
    <Card className="shadow-xs border-slate-200">
        <CardHeader className="py-2.5 px-3 border-b space-y-0">
          <CardTitle className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Languages className="h-3.5 w-3.5 text-primary" /> Languages
          </CardTitle>
          {/* Languages are managed centrally under Website Builder > Languages,
              not created ad hoc from inside a section form. */}
          <CardDescription className="text-[10px] mt-0.5">Click a language to edit this section in that language.</CardDescription>
        </CardHeader>
        <CardContent className="p-3 space-y-1.5" role="radiogroup" aria-label="Language">
          {!canTranslate ? (
            <p className="py-3 text-center text-[11px] leading-relaxed text-muted-foreground">
              Save this section first. A translation is stored against the saved record, so there is
              nothing to translate until it exists.
            </p>
          ) : languagesLoading ? (
            <div className="flex items-center justify-center py-4 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Loading languages...
            </div>
          ) : (
            <>
              {defaultLanguage && (
                <button
                  type="button"
                  role="radio"
                  aria-checked={isEnglishActive}
                  onClick={() => router.push(buildHref(null))}
                  className={rowClass(isEnglishActive)}
                >
                  {radioDot(isEnglishActive)}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800 truncate">{defaultLanguage.name}</p>
                    <p className="text-[10px] text-muted-foreground">Source language</p>
                  </div>
                </button>
              )}

              {otherLanguages.length === 0 ? (
                <p className="text-[11px] text-muted-foreground py-2 text-center">
                  No other languages yet. Add one under Website Builder &gt; Languages.
                </p>
              ) : (
                otherLanguages.map((lang) => {
                  const filled = filledCount(lang.id);
                  const total = fields.length;
                  const isActive = activeLanguageId === lang.id;
                  const isComplete = total > 0 && filled === total;
                  return (
                    <button
                      key={lang.id}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      onClick={() => router.push(buildHref(lang.id))}
                      className={rowClass(isActive)}
                    >
                      {radioDot(isActive)}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-800 truncate">{lang.name}</p>
                        {lang.native_name && <p className="text-[10px] text-muted-foreground truncate">{lang.native_name}</p>}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge
                          variant="outline"
                          className={
                            isComplete
                              ? 'text-[10px] px-1.5 py-0 border-emerald-300 bg-emerald-50 text-emerald-700'
                              : filled > 0
                              ? 'text-[10px] px-1.5 py-0 border-amber-300 bg-amber-50 text-amber-700'
                              : 'text-[10px] px-1.5 py-0 border-slate-200 bg-slate-50 text-slate-500'
                          }
                        >
                          {filled}/{total}
                        </Badge>
                      </div>
                    </button>
                  );
                })
              )}
            </>
          )}
        </CardContent>
    </Card>
  );
}
