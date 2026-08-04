'use client';

import React, { useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, Heart, Layout, Eye } from 'lucide-react';
import type { ThemeColors } from './preview-shared';

export interface TemplateItem {
  id: number;
  title: string;
  description?: string;
  categoryName?: string;
  templateType?: string;
  primaryColor?: string;
  thumbnailUrl?: string;
  isPopular?: boolean;
  /** Only templates where this resolves to true should ever render on the live site. */
  isActive?: boolean;
}

interface TemplatesSectionProps {
  templates: TemplateItem[];
  theme: ThemeColors;
  categories?: string[];
  onPreview?: (template: TemplateItem) => void;
  onUseTemplate?: (template: TemplateItem) => void;
}

const ALL_CATEGORY = '__all_categories__';
const MAX_VISIBLE_PILLS = 6;

export function TemplatesSection({ templates, theme, categories, onPreview }: TemplatesSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORY);
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  // Only ever work with active templates from here on — inactive ones must
  // never reach category derivation, filtering, or rendering.
  const activeTemplates = useMemo(
    () => (templates || []).filter((t) => t.isActive !== false),
    [templates],
  );

  const derivedCategories = useMemo(() => {
    if (categories && categories.length > 0) return categories;
    const seen = new Set<string>();
    const out: string[] = [];
    for (const t of activeTemplates) {
      const name = t.categoryName?.trim();
      if (name && !seen.has(name)) {
        seen.add(name);
        out.push(name);
      }
    }
    return out;
  }, [categories, activeTemplates]);

  const visiblePills = derivedCategories.slice(0, MAX_VISIBLE_PILLS);
  const overflowPills = derivedCategories.slice(MAX_VISIBLE_PILLS);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    if (activeCategory === ALL_CATEGORY) return activeTemplates;
    return activeTemplates.filter((t) => t.categoryName === activeCategory);
  }, [activeTemplates, activeCategory]);

  const scrollNext = () => {
    scrollRef.current?.scrollBy({ left: 240, behavior: 'smooth' });
  };

  if (!activeTemplates || activeTemplates.length === 0) return null;

  return (
    <section className="w-full border-t border-slate-100 bg-white py-14 sm:py-20">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-8 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: theme.primaryButton }}>
            Choose From Beautiful Templates
          </p>
          <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl" style={{ color: theme.primaryText }}>
            Stunning Templates for Every Occasion
          </h2>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="h-px w-8" style={{ backgroundColor: theme.primaryButton }} />
            <Heart className="h-3 w-3" style={{ color: theme.primaryButton, fill: theme.primaryButton }} />
            <span className="h-px w-8" style={{ backgroundColor: theme.primaryButton }} />
          </div>
        </div>

        {/* Category pills */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          <CategoryPill
            label="All Templates"
            isActive={activeCategory === ALL_CATEGORY}
            theme={theme}
            onClick={() => setActiveCategory(ALL_CATEGORY)}
          />
          {visiblePills.map((label) => (
            <CategoryPill
              key={label}
              label={label}
              isActive={activeCategory === label}
              theme={theme}
              onClick={() => setActiveCategory(label)}
            />
          ))}
          {overflowPills.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMoreCategories((s) => !s)}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-4 py-1.5 text-[13px] font-semibold text-slate-700"
              >
                More <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {showMoreCategories && (
                <div className="absolute left-0 top-full z-20 mt-2 w-44 rounded-md border border-slate-200 bg-white p-1 shadow-lg">
                  {overflowPills.map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        setActiveCategory(label);
                        setShowMoreCategories(false);
                      }}
                      className="block w-full rounded-md px-3 py-1.5 text-left text-[13px] font-medium text-slate-700 hover:bg-slate-50"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Horizontally scrolling template row */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {filtered.map((template) => (
              <div key={template.id} className="w-[190px] shrink-0 sm:w-[210px]">
                <TemplateCard
                  template={template}
                  theme={theme}
                  isFavorite={favorites.has(template.id)}
                  onToggleFavorite={() => toggleFavorite(template.id)}
                  onPreview={onPreview}
                />
              </div>
            ))}
          </div>

          {filtered.length > 4 && (
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Show more templates"
              className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-4 items-center justify-center rounded-full border border-slate-200 bg-white p-2 shadow-md sm:flex"
            >
              <ChevronRight className="h-4 w-4" style={{ color: theme.primaryButton }} />
            </button>
          )}
        </div>

        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-slate-500">No templates in this category yet.</p>
        )}
      </div>
    </section>
  );
}

function CategoryPill({
  label,
  isActive,
  theme,
  onClick,
}: {
  label: string;
  isActive: boolean;
  theme: ThemeColors;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border px-4 py-1.5 text-[13px] font-semibold transition-colors"
      style={
        isActive
          ? { backgroundColor: `${theme.primaryButton}14`, borderColor: `${theme.primaryButton}66`, color: theme.primaryButton }
          : { backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: theme.secondaryText }
      }
    >
      {label}
    </button>
  );
}

function TemplateCard({
  template,
  theme,
  isFavorite,
  onToggleFavorite,
  onPreview,
}: {
  template: TemplateItem;
  theme: ThemeColors;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onPreview?: (template: TemplateItem) => void;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition hover:shadow-md">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100">
        {template.thumbnailUrl ? (
          <img
            src={template.thumbnailUrl}
            alt={template.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              const imgEl = e.currentTarget;
              imgEl.style.display = 'none';
              const fallbackEl = imgEl.parentElement?.querySelector('[data-thumb-fallback="true"]') as HTMLElement;
              if (fallbackEl) fallbackEl.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          data-thumb-fallback="true"
          className="flex h-full w-full items-center justify-center text-slate-400"
          style={{ display: template.thumbnailUrl ? 'none' : 'flex' }}
        >
          <Layout className="h-8 w-8" />
        </div>

        <button
          type="button"
          onClick={onToggleFavorite}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow-sm"
        >
          <Heart
            className="h-3 w-3"
            style={isFavorite ? { color: theme.primaryButton, fill: theme.primaryButton } : { color: '#94a3b8' }}
          />
        </button>

        {template.isPopular && (
          <span
            className="absolute left-1.5 top-1.5 rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white shadow-sm"
            style={{ backgroundColor: theme.primaryButton }}
          >
            ★ Popular
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between gap-1.5 p-2.5 text-center items-center">
        <div className="text-center w-full">
          <h3 className="line-clamp-1 text-[12px] font-bold leading-tight text-center" style={{ color: theme.primaryText }}>
            {template.title}
          </h3>
          <p className="line-clamp-1 text-[10px] font-medium leading-tight text-center mt-0.5" style={{ color: theme.secondaryText }}>
            {template.categoryName || template.templateType || 'Invitation'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onPreview?.(template)}
          className="flex w-full items-center justify-center gap-1 rounded-md border py-1 text-[11px] font-bold transition-colors hover:text-white"
          style={{ borderColor: theme.primaryButton, color: theme.primaryButton }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.primaryButton)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <Eye className="h-3 w-3" />
          Preview
        </button>
      </div>
    </div>
  );
}

export default TemplatesSection;