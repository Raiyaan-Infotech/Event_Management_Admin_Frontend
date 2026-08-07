'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Testimonial, ThemeColors } from './preview-shared';

type CardPosition = 'previous' | 'active' | 'next';

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

import { useWebsiteLanguage } from '../website-language-provider';

function TestimonialsSectionBase({ testimonials, theme }: { testimonials: Testimonial[]; theme: ThemeColors }) {
  const { t } = useWebsiteLanguage();
  const [activeIndex, setActiveIndex] = React.useState(() => (testimonials.length > 1 ? 1 : 0));
  const canSlide = testimonials.length > 3;

  React.useEffect(() => {
    setActiveIndex((cur) => (testimonials.length ? Math.min(cur, testimonials.length - 1) : 0));
  }, [testimonials.length]);

  const visibleTestimonials = React.useMemo(() => {
    const count = testimonials.length;
    if (!count) return [];
    if (!canSlide) {
      const staticActive = Math.min(1, count - 1);
      return testimonials.map((item, index) => ({ item, index, position: (index === staticActive ? 'active' : index < staticActive ? 'previous' : 'next') as CardPosition }));
    }
    const prev = (activeIndex - 1 + count) % count;
    const next = (activeIndex + 1) % count;
    return [
      { item: testimonials[prev], index: prev, position: 'previous' as CardPosition },
      { item: testimonials[activeIndex], index: activeIndex, position: 'active' as CardPosition },
      { item: testimonials[next], index: next, position: 'next' as CardPosition },
    ];
  }, [activeIndex, canSlide, testimonials]);

  if (!testimonials.length) return null;

  return (
    <section id="testimonials" className="w-full border-t border-slate-100 bg-white py-16 sm:py-20">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <span className="mb-3 inline-flex rounded-full px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white" style={{ backgroundColor: theme.primaryButton }}>{t('testimonials.title', 'Testimonials')}</span>
          <h2 className="mt-4 text-[28px] font-black leading-tight tracking-tight sm:text-[36px]" style={{ color: theme.primaryText }}>{t('testimonials.subtitle', 'What Our Clients Say')}</h2>
          <div className="mx-auto mt-3 h-[3px] w-12 rounded-full" style={{ backgroundColor: theme.primaryButton }} />
        </div>

        <div className="relative">
          {canSlide ? (
            <>
              <button type="button" onClick={() => setActiveIndex((c) => (c - 1 + testimonials.length) % testimonials.length)} aria-label="Previous testimonial" className="absolute -left-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg transition hover:-translate-x-0.5">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button type="button" onClick={() => setActiveIndex((c) => (c + 1) % testimonials.length)} aria-label="Next testimonial" className="absolute -right-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg transition hover:translate-x-0.5">
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}

          <div className={cn('mx-auto grid items-stretch gap-5', visibleTestimonials.length === 1 && 'max-w-[520px] grid-cols-1', visibleTestimonials.length === 2 && 'max-w-[860px] grid-cols-1 md:grid-cols-2', visibleTestimonials.length >= 3 && 'max-w-[1120px] grid-cols-1 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.12fr)_minmax(0,0.92fr)]')}>
            {visibleTestimonials.map(({ item, index, position }) => {
              const isActive = position === 'active';
              return (
                // Reading order matches the reference design: rating, then the
                // quote, then who said it. Left-aligned — centred text is hard
                // to scan once a testimonial runs past a line or two.
                <article key={`${item.id}-${position}`} className={cn('relative flex flex-col items-start text-left rounded-xl border border-slate-200 bg-white px-6 py-6 shadow-sm transition-all duration-300', isActive ? 'z-10 min-h-[300px] md:-translate-y-2 md:px-7 md:py-7 md:shadow-lg' : 'min-h-[280px] md:scale-[0.94] md:opacity-90', canSlide && !isActive && 'hidden md:flex')}>
                  {item.showRating ? (
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={cn('h-4 w-4', i < item.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200')} />
                      ))}
                    </div>
                  ) : null}

                  {/* flex-1 pushes the author block to the card's bottom edge so
                      the author rows line up across cards of differing length. */}
                  <p className="mt-4 flex-1 text-[13px] font-medium leading-6" style={{ color: theme.secondaryText }}>
                    &ldquo;{item.feedback || 'Wonderful experience!'}&rdquo;
                  </p>

                  <div className="mt-5 flex w-full items-center gap-3 border-t border-slate-100 pt-4">
                    {item.photoUrl ? (
                      <img src={item.photoUrl} alt={item.name} className="h-11 w-11 shrink-0 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[13px] font-black text-white" style={{ backgroundColor: theme.primaryButton }}>
                        {initials(item.name)}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-black" style={{ color: theme.primaryText }}>{item.name}</p>
                      {item.event ? <p className="truncate text-[11px] font-bold" style={{ color: theme.primaryButton }}>{item.event}</p> : null}
                    </div>
                  </div>
                  {canSlide && isActive ? <span className="sr-only">Testimonial {index + 1} of {testimonials.length}</span> : null}
                </article>
              );
            })}
          </div>
        </div>

        {canSlide ? (
          <div className="mt-8 flex items-center justify-center gap-2">
            {testimonials.map((item, index) => (
              <button key={item.id} type="button" onClick={() => setActiveIndex(index)} aria-label={`Show testimonial ${index + 1}`} className={cn('h-2.5 rounded-full transition-all', index === activeIndex ? 'w-6' : 'w-2.5 bg-slate-300')} style={index === activeIndex ? { backgroundColor: theme.primaryButton } : undefined} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export const TestimonialsSection = React.memo(TestimonialsSectionBase);
