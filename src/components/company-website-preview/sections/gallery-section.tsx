'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { GalleryCategory, GalleryItem, ThemeColors } from './preview-shared';

function GallerySectionBase({ categories, items, theme }: { categories: GalleryCategory[]; items: GalleryItem[]; theme: ThemeColors }) {
  const [activeCategory, setActiveCategory] = React.useState<number | 'all'>('all');

  if (!items.length) return null;

  const filteredItems = activeCategory === 'all' ? items : items.filter((item) => item.categoryId === activeCategory);

  return (
    <section id="gallery" className="w-full border-t border-slate-100 bg-white py-16 sm:py-20">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mb-9 text-center">
          <span className="mb-3 inline-flex rounded px-3 py-1 text-[12px] font-bold text-white" style={{ backgroundColor: theme.primaryButton }}>Our Gallery</span>
          <h2 className="mt-4 text-[28px] font-black leading-tight tracking-tight sm:text-[36px]" style={{ color: theme.primaryText }}>
            Moments We&apos;ve Created
          </h2>
          <div className="mx-auto mt-3 h-[3px] w-12 rounded-full" style={{ backgroundColor: theme.primaryButton }} />
        </div>

        {categories.length > 0 ? (
          <div className="mb-10 flex flex-wrap items-center justify-center gap-2.5">
            <button type="button" onClick={() => setActiveCategory('all')} className={cn('inline-flex h-9 items-center justify-center rounded-md px-5 text-[13px] font-bold transition', activeCategory === 'all' ? 'text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300')} style={activeCategory === 'all' ? { backgroundColor: theme.primaryButton } : undefined}>
              All
            </button>
            {categories.map((cat) => (
              <button key={cat.id} type="button" onClick={() => setActiveCategory(cat.id)} className={cn('inline-flex h-9 items-center justify-center rounded-md px-5 text-[13px] font-bold transition', activeCategory === cat.id ? 'text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300')} style={activeCategory === cat.id ? { backgroundColor: theme.primaryButton } : undefined}>
                {cat.name}
              </button>
            ))}
          </div>
        ) : null}

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="group relative aspect-[4/3] overflow-hidden rounded-md bg-slate-100">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.altText} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,#170b13,#3a1830_45%,#130d0c)]" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-[13px] font-medium text-slate-500">No images in this category yet.</p>
        )}
      </div>
    </section>
  );
}

export const GallerySection = React.memo(GallerySectionBase);
