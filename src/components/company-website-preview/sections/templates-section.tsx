'use client';

import React, { useMemo, useState } from 'react';
import { Search, Filter as FilterIcon, Flame, Palette, ChevronDown, Heart, ArrowDown, Layout } from 'lucide-react';
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
}

interface TemplatesSectionProps {
  templates: TemplateItem[];
  theme: ThemeColors;
  /** Optional — if you add a real categories endpoint later, pass names here. Falls back to deriving from templates. */
  categories?: string[];
  onPreview?: (template: TemplateItem) => void;
  onUseTemplate?: (template: TemplateItem) => void;
}

type SortOption = 'popular' | 'newest' | 'az';
interface SelectOption {
  value: string;
  label: string;
}

const ALL_CATEGORY = '__all_categories__';
const ALL_COLOR = '__all_colors__';
const PAGE_SIZE = 10;
const MAX_VISIBLE_PILLS = 7;

// Heuristic bucket: your data only has a hex `primaryColor`, so we map it to
// the nearest of a small reference palette rather than a real color-family field.
const COLOR_FAMILIES: { name: string; rgb: [number, number, number] }[] = [
  { name: 'Gold', rgb: [201, 164, 76] },
  { name: 'Pink', rgb: [236, 72, 153] },
  { name: 'Red', rgb: [185, 28, 28] },
  { name: 'Green', rgb: [22, 101, 52] },
  { name: 'Purple', rgb: [107, 33, 168] },
  { name: 'Blue', rgb: [29, 78, 216] },
  { name: 'Black', rgb: [23, 23, 23] },
];

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return null;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return null;
  return [r, g, b];
}

function nearestColorFamily(hex?: string): string | null {
  if (!hex) return null;
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  let best = COLOR_FAMILIES[0];
  let bestDist = Infinity;
  for (const family of COLOR_FAMILIES) {
    const dist = Math.sqrt(
      (rgb[0] - family.rgb[0]) ** 2 + (rgb[1] - family.rgb[1]) ** 2 + (rgb[2] - family.rgb[2]) ** 2,
    );
    if (dist < bestDist) {
      bestDist = dist;
      best = family;
    }
  }
  return best.name;
}

export function TemplatesSection({ templates, theme, categories, onPreview, onUseTemplate }: TemplatesSectionProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORY);
  const [activeColor, setActiveColor] = useState<string>(ALL_COLOR);
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [showMoreCategories, setShowMoreCategories] = useState(false);

  const derivedCategories = useMemo(() => {
    if (categories && categories.length > 0) return categories;
    const seen = new Set<string>();
    const out: string[] = [];
    for (const t of templates) {
      const name = t.categoryName?.trim();
      if (name && !seen.has(name)) {
        seen.add(name);
        out.push(name);
      }
    }
    return out;
  }, [categories, templates]);

  const visiblePills = derivedCategories.slice(0, MAX_VISIBLE_PILLS);
  const overflowPills = derivedCategories.slice(MAX_VISIBLE_PILLS);

  const categoryOptions: SelectOption[] = [
    { value: ALL_CATEGORY, label: 'All Categories' },
    ...derivedCategories.map((c) => ({ value: c, label: c })),
  ];

  const colorOptions: SelectOption[] = useMemo(() => {
    const seen = new Set<string>();
    for (const t of templates) {
      const family = nearestColorFamily(t.primaryColor);
      if (family) seen.add(family);
    }
    return [{ value: ALL_COLOR, label: 'All Colors' }, ...Array.from(seen).map((c) => ({ value: c, label: c }))];
  }, [templates]);

  const sortOptions: SelectOption[] = [
    { value: 'popular', label: 'Popular' },
    { value: 'newest', label: 'Newest' },
    { value: 'az', label: 'A–Z' },
  ];

  const resetPaging = () => setVisibleCount(PAGE_SIZE);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    let result = templates;

    if (activeCategory !== ALL_CATEGORY) {
      result = result.filter((t) => t.categoryName === activeCategory);
    }
    if (activeColor !== ALL_COLOR) {
      result = result.filter((t) => nearestColorFamily(t.primaryColor) === activeColor);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.categoryName?.toLowerCase().includes(q),
      );
    }

    const sorted = [...result];
    if (sortBy === 'popular') sorted.sort((a, b) => Number(b.isPopular) - Number(a.isPopular));
    else if (sortBy === 'newest') sorted.sort((a, b) => b.id - a.id);
    else sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted;
  }, [templates, activeCategory, activeColor, search, sortBy]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  if (!templates || templates.length === 0) return null;

  return (
    <section className="w-full border-t border-slate-100 bg-white py-12 sm:py-16">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {/* Toolbar */}
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPaging();
              }}
              placeholder="Search templates for weddings, events..."
              className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SelectField
              value={activeCategory}
              onChange={(v) => {
                setActiveCategory(v);
                resetPaging();
              }}
              options={categoryOptions}
            />
            <SelectField
              value={activeColor}
              onChange={(v) => {
                setActiveColor(v);
                resetPaging();
              }}
              options={colorOptions}
              icon={<Palette className="h-3.5 w-3.5 text-slate-400" />}
            />
            <SelectField
              value={sortBy}
              onChange={(v) => setSortBy(v as SortOption)}
              options={sortOptions}
              icon={<Flame className="h-3.5 w-3.5 text-slate-400" />}
            />

            <button
              type="button"
              onClick={() =>
                document.getElementById('templates-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-white shadow-sm"
              style={{ backgroundColor: theme.primaryButton }}
            >
              <FilterIcon className="h-3.5 w-3.5" />
              Filter
            </button>
          </div>
        </div>

        {/* Category pills */}
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <CategoryPill
            label="All Templates"
            isActive={activeCategory === ALL_CATEGORY}
            theme={theme}
            onClick={() => {
              setActiveCategory(ALL_CATEGORY);
              resetPaging();
            }}
          />
          {visiblePills.map((label) => (
            <CategoryPill
              key={label}
              label={label}
              isActive={activeCategory === label}
              theme={theme}
              onClick={() => {
                setActiveCategory(label);
                resetPaging();
              }}
            />
          ))}

          {overflowPills.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMoreCategories((s) => !s)}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[13px] font-semibold text-slate-700"
              >
                More <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {showMoreCategories && (
                <div className="absolute left-0 top-full z-20 mt-2 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                  {overflowPills.map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        setActiveCategory(label);
                        resetPaging();
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

        {/* Grid */}
        <div id="templates-grid" className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {visible.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              theme={theme}
              isFavorite={favorites.has(template.id)}
              onToggleFavorite={() => toggleFavorite(template.id)}
              onPreview={onPreview}
              onUseTemplate={onUseTemplate}
            />
          ))}
        </div>

        {visible.length === 0 && (
          <p className="py-12 text-center text-sm text-slate-500">No templates match your filters.</p>
        )}

        {hasMore && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="inline-flex items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-bold transition-colors hover:text-white"
              style={{ borderColor: theme.primaryButton, color: theme.primaryButton }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.primaryButton)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <ArrowDown className="h-4 w-4" />
              Load More Templates
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function SelectField({
  value,
  onChange,
  options,
  icon,
}: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative inline-flex items-center rounded-full border border-slate-200 bg-white py-2 pl-3 pr-7">
      {icon && <span className="mr-1.5">{icon}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-transparent text-sm font-medium text-slate-700 focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-400" />
    </div>
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
      className="rounded-full border px-4 py-1.5 text-[13px] font-semibold transition-colors"
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
  onUseTemplate,
}: {
  template: TemplateItem;
  theme: ThemeColors;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onPreview?: (template: TemplateItem) => void;
  onUseTemplate?: (template: TemplateItem) => void;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition hover:shadow-md">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100">
        {template.thumbnailUrl ? (
          <img src={template.thumbnailUrl} alt={template.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <Layout className="h-10 w-10" />
          </div>
        )}

        <button
          type="button"
          onClick={onToggleFavorite}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm"
        >
          <Heart
            className="h-3.5 w-3.5"
            style={isFavorite ? { color: theme.primaryButton, fill: theme.primaryButton } : { color: '#94a3b8' }}
          />
        </button>

        {template.isPopular && (
          <span
            className="absolute left-2.5 top-2.5 rounded px-2 py-0.5 text-[10px] font-bold tracking-wide text-white shadow-sm"
            style={{ backgroundColor: theme.primaryButton }}
          >
            ★ Popular
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-3">
        <div>
          <h3 className="line-clamp-1 text-[14px] font-bold leading-snug" style={{ color: theme.primaryText }}>
            {template.title}
          </h3>
          <p className="text-[12px] font-medium" style={{ color: theme.secondaryText }}>
            {template.categoryName || template.templateType || 'Invitation'}
          </p>
        </div>

        <div className="mt-auto flex gap-2">
          <button
            type="button"
            onClick={() => onPreview?.(template)}
            className="flex-1 rounded-md border border-slate-200 py-1.5 text-[12px] font-semibold text-slate-600 hover:bg-slate-50"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={() => onUseTemplate?.(template)}
            className="flex-1 rounded-md py-1.5 text-[12px] font-bold text-white shadow-sm"
            style={{ backgroundColor: theme.primaryButton }}
          >
            Use Template
          </button>
        </div>
      </div>
    </div>
  );
}

export default TemplatesSection;