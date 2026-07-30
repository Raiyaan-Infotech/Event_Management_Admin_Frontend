'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Testimonial, ThemeColors } from './preview-shared';

type CardPosition = 'previous' | 'active' | 'next';

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

function TestimonialsSectionBase({ testimonials, theme }: { testimonials: Testimonial[]; theme: ThemeColors }) {
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
    <section id="testimonials" className="w-full border-t border-slate-100 bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <span className="mb-3 inline-flex rounded px-3 py-1 text-[12px] font-bold text-white" style={{ backgroundColor: theme.primaryButton }}>Testimonials</span>
          <h2 className="mt-4 text-[28px] font-black leading-tight tracking-tight sm:text-[36px]" style={{ color: theme.primaryText }}>What Our Clients Say</h2>
          <div className="mx-auto mt-3 h-[3px] w-12 rounded-full" style={{ backgroundColor: theme.primaryButton }} />
        </div>

        <div className="relative">
          {canSlide ? (
            <>
              <button type="button" onClick={() => setActiveIndex((c) => (c - 1 + testimonials.length) % testimonials.length)} aria-label="Previous testimonial" className="absolute -left-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-lg transition hover:-translate-x-0.5">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button type="button" onClick={() => setActiveIndex((c) => (c + 1) % testimonials.length)} aria-label="Next testimonial" className="absolute -right-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-lg transition hover:translate-x-0.5">
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}

          <div className={cn('mx-auto grid items-center gap-5', visibleTestimonials.length === 1 && 'max-w-[520px] grid-cols-1', visibleTestimonials.length === 2 && 'max-w-[860px] grid-cols-1 md:grid-cols-2', visibleTestimonials.length >= 3 && 'max-w-[1120px] grid-cols-1 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.12fr)_minmax(0,0.92fr)]')}>
            {visibleTestimonials.map(({ item, index, position }) => {
              const isActive = position === 'active';
              return (
                <article key={`${item.id}-${position}`} className={cn('relative flex flex-col items-center text-center rounded-md bg-white px-6 py-7 shadow-lg transition-all duration-300', isActive ? 'z-10 min-h-[360px] md:-translate-y-2 md:px-8 md:py-8' : 'min-h-[320px] md:scale-[0.94] md:opacity-90', canSlide && !isActive && 'hidden md:flex')}>
                  <Quote className="mb-3 h-7 w-7 fill-current" style={{ color: theme.primaryButton }} />
                  {item.photoUrl ? (
                    <img src={item.photoUrl} alt={item.name} className="h-16 w-16 rounded-md object-cover shadow-sm" />
                  ) : (
                    <span className="flex h-16 w-16 items-center justify-center rounded-md text-[15px] font-black text-white shadow-sm" style={{ backgroundColor: theme.primaryButton }}>
                      {initials(item.name)}
                    </span>
                  )}
                  <p className="mt-4 text-[14px] font-black" style={{ color: theme.primaryText }}>{item.name}</p>
                  {item.event ? <p className="mt-1 text-[11px] font-bold" style={{ color: theme.primaryButton }}>{item.event}</p> : null}
                  {item.showRating ? (
                    <div className="mt-3 flex items-center justify-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={cn('h-4 w-4', i < item.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200')} />
                      ))}
                    </div>
                  ) : null}
                  <p className="mt-4 text-[13px] font-medium leading-6" style={{ color: theme.secondaryText }}>{item.feedback || 'Wonderful experience!'}</p>
                  {canSlide && isActive ? <span className="sr-only">Testimonial {index + 1} of {testimonials.length}</span> : null}
                </article>
              );
            })}
          </div>
        </div>

        {canSlide ? (
          <div className="mt-8 flex items-center justify-center gap-2">
            {testimonials.map((item, index) => (
              <button key={item.id} type="button" onClick={() => setActiveIndex(index)} aria-label={`Show testimonial ${index + 1}`} className={cn('h-2.5 rounded-md transition-all', index === activeIndex ? 'w-6' : 'w-2.5 bg-slate-300')} style={index === activeIndex ? { backgroundColor: theme.primaryButton } : undefined} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export const TestimonialsSection = React.memo(TestimonialsSectionBase);
