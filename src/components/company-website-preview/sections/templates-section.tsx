'use client';

import React, { useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Heart, Layout, Eye, Search, Flame, Palette, Filter, ArrowDown } from 'lucide-react';
import type { ThemeColors } from './preview-shared';
import { useWebsiteBuilderTranslation } from '@/hooks/use-website-builder-translation';

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
  title?: string;
  subtitle?: string;
}

const ALL_CATEGORY = '__all_categories__';
const MAX_VISIBLE_PILLS = 6;

export function TemplatesSection({ templates = [], theme, categories = [], onPreview, title, subtitle }: TemplatesSectionProps) {
  const { t } = useWebsiteBuilderTranslation();
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

  const scrollPrev = () => {
    scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollNext = () => {
    scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' });
  };

  if (!activeTemplates || activeTemplates.length === 0) return null;

  return (
    <section className="w-full border-t border-slate-100 bg-white py-14 sm:py-20">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-8 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: theme.primaryButton }}>
            {t('templates.subtitle', 'Choose From Beautiful Templates')}
          </p>
          <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl" style={{ color: theme.primaryText }}>
            {t('templates.title', 'Stunning Templates for Every Occasion')}
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
            label={t('templates.all_categories', 'All Templates')}
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
            className="flex gap-4 overflow-x-auto scroll-smooth pb-3 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {filtered.map((template) => (
              <div key={template.id} className="w-[170px] sm:w-[185px] lg:w-[calc((100%-5*16px)/6)] shrink-0">
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
            <>
              <button
                type="button"
                onClick={scrollPrev}
                aria-label="Scroll previous templates"
                className="absolute -left-4 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white p-2.5 shadow-md transition hover:bg-slate-50 active:scale-95 sm:flex"
              >
                <ChevronLeft className="h-4 w-4" style={{ color: theme.primaryButton }} />
              </button>

              <button
                type="button"
                onClick={scrollNext}
                aria-label="Scroll next templates"
                className="absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white p-2.5 shadow-md transition hover:bg-slate-50 active:scale-95 sm:flex"
              >
                <ChevronRight className="h-4 w-4" style={{ color: theme.primaryButton }} />
              </button>
            </>
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
  const { t } = useWebsiteBuilderTranslation();
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
            ★ {t('templates.popular', 'Popular')}
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
          className="flex w-full items-center justify-center gap-1 rounded-md border py-1 text-[11px] font-bold transition-colors"
          style={{ borderColor: theme.primaryButton, color: theme.primaryButton }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.primaryButton;
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = theme.primaryButton;
          }}
        >
          <Eye className="h-3 w-3" />
          {t('templates.preview', 'Preview')}
        </button>
      </div>
    </div>
  );
}

export function TemplateGridGallerySection({
  templates,
  theme,
  categories,
  onPreview,
  onUseTemplate,
}: TemplatesSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY);
  const [selectedColor, setSelectedColor] = useState('all');
  const [selectedPopularity, setSelectedPopularity] = useState('all');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [visibleCount, setVisibleCount] = useState(10);

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

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredTemplates = useMemo(() => {
    return activeTemplates.filter((t) => {
      if (selectedCategory !== ALL_CATEGORY && t.categoryName !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = t.title?.toLowerCase().includes(q);
        const catMatch = t.categoryName?.toLowerCase().includes(q);
        if (!titleMatch && !catMatch) return false;
      }
      if (selectedPopularity === 'popular' && !t.isPopular) {
        return false;
      }
      return true;
    });
  }, [activeTemplates, selectedCategory, searchQuery, selectedPopularity]);

  const displayedTemplates = filteredTemplates.slice(0, visibleCount);

  return (
    <section className="w-full border-t border-slate-100 bg-slate-50/50 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* ── Top Controls & Search Bar ──────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-2xs">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates for weddings, events..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-4 pr-10 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
            <Search className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          {/* All Categories Dropdown */}
          <div className="relative min-w-[140px]">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 pr-8 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 cursor-pointer"
            >
              <option value={ALL_CATEGORY}>All Categories</option>
              {derivedCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>

          {/* All Colors Dropdown */}
          <div className="relative min-w-[130px]">
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 cursor-pointer"
            >
              <option value="all">All Colors</option>
              <option value="red">Red</option>
              <option value="gold">Gold</option>
              <option value="green">Green</option>
              <option value="purple">Purple</option>
              <option value="blue">Blue</option>
            </select>
            <Palette className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-rose-500" />
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Popular Dropdown */}
          <div className="relative min-w-[130px]">
            <select
              value={selectedPopularity}
              onChange={(e) => setSelectedPopularity(e.target.value)}
              className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 cursor-pointer"
            >
              <option value="all">All Items</option>
              <option value="popular">Popular</option>
              <option value="trending">Trending</option>
            </select>
            <Flame className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-orange-500" />
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Filter Button */}
          <button
            type="button"
            className="flex h-10 items-center justify-center gap-1.5 rounded-xl px-5 text-xs font-bold text-white shadow-2xs transition hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: theme.primaryButton }}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Filter</span>
          </button>
        </div>

        {/* ── Category Filter Pills ────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory(ALL_CATEGORY)}
            className="rounded-xl px-4 py-2 text-xs font-bold transition-colors cursor-pointer"
            style={
              selectedCategory === ALL_CATEGORY
                ? { backgroundColor: theme.primaryButton, color: '#ffffff' }
                : { backgroundColor: '#ffffff', color: '#475569', border: '1px solid #e2e8f0' }
            }
          >
            All Templates
          </button>

          {derivedCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className="rounded-xl px-4 py-2 text-xs font-bold transition-colors cursor-pointer"
              style={
                selectedCategory === cat
                  ? { backgroundColor: theme.primaryButton, color: '#ffffff' }
                  : { backgroundColor: '#ffffff', color: '#475569', border: '1px solid #e2e8f0' }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── 5-Column Template Cards Grid ───────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {displayedTemplates.map((template) => {
            const isFav = favorites.has(template.id);
            return (
              <div
                key={template.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white p-3 shadow-2xs transition duration-300 hover:-translate-y-1 hover:border-slate-200 hover:shadow-lg"
              >
                {/* Thumbnail Image Container */}
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-slate-100">
                  {template.thumbnailUrl ? (
                    <img
                      src={template.thumbnailUrl}
                      alt={template.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
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
                    className="flex h-full w-full items-center justify-center text-slate-300"
                    style={{ display: template.thumbnailUrl ? 'none' : 'flex' }}
                  >
                    <Layout className="h-10 w-10" />
                  </div>

                  {/* Favorite Heart Button */}
                  <button
                    type="button"
                    onClick={() => toggleFavorite(template.id)}
                    aria-label={isFav ? 'Remove favorite' : 'Add favorite'}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-xs backdrop-blur-xs transition hover:scale-110 cursor-pointer"
                  >
                    <Heart
                      className="h-3.5 w-3.5"
                      style={isFav ? { color: theme.primaryButton, fill: theme.primaryButton } : { color: '#94a3b8' }}
                    />
                  </button>

                  {template.isPopular && (
                    <span
                      className="absolute left-2 top-2 rounded-md px-2 py-0.5 text-[9px] font-extrabold tracking-wide text-white shadow-2xs"
                      style={{ backgroundColor: theme.primaryButton }}
                    >
                      ★ Popular
                    </span>
                  )}
                </div>

                {/* Card Meta & Buttons */}
                <div className="mt-3 flex flex-col justify-between gap-2.5">
                  <div className="text-center">
                    <h3 className="line-clamp-1 text-xs font-black text-slate-900" style={{ color: theme.primaryText }}>
                      {template.title}
                    </h3>
                    <p className="line-clamp-1 text-[10px] font-semibold text-slate-400 mt-0.5">
                      {template.categoryName || template.templateType || 'Invitation'}
                    </p>
                  </div>

                  {/* Action Buttons: Preview & Use Template */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => onPreview?.(template)}
                      className="flex-1 rounded-lg border border-slate-200 bg-white py-1.5 text-[10.5px] font-bold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => onUseTemplate?.(template)}
                      className="flex-1 rounded-lg py-1.5 text-[10.5px] font-bold text-white shadow-2xs transition hover:opacity-90 cursor-pointer"
                      style={{ backgroundColor: theme.primaryButton }}
                    >
                      Use Template
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredTemplates.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-slate-500">No templates found matching your search or filters.</p>
          </div>
        )}

        {/* ── Bottom Load More Button ────────────────────────────────────────── */}
        {visibleCount < filteredTemplates.length && (
          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 10)}
              className="inline-flex items-center gap-2 rounded-xl border bg-white px-6 py-2.5 text-xs font-bold transition hover:bg-rose-50 cursor-pointer"
              style={{ color: theme.primaryButton, borderColor: `${theme.primaryButton}40` }}
            >
              <ArrowDown className="h-3.5 w-3.5" />
              <span>Load More Templates</span>
            </button>
          </div>
        )}

      </div>
    </section>
  );
}

export default TemplatesSection;