'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { Logo, ThemeColors } from './preview-shared';

function LogoWallSectionBase({ title, members, theme, kind, muted = false }: { title: string; members: Logo[]; theme: ThemeColors; kind: 'clients' | 'sponsors'; muted?: boolean }) {
  if (!members.length) return null;

  const loopMembers = [...members, ...members];
  const base = Math.min(Math.max(members.length * 4, 18), 60);
  const dur = kind === 'sponsors' ? Math.min(Math.round(base * 1.35 + 5), 86) : base;
  const fadeFrom = muted ? 'from-slate-50' : 'from-white';

  return (
    <section className={cn('w-full border-t border-slate-100 py-14 sm:py-16', muted ? 'bg-slate-50' : 'bg-white')}>
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {title && (
          <div className="mb-10 text-center">
            <h2 className="text-[28px] font-black leading-tight tracking-tight sm:text-[36px]" style={{ color: theme.primaryText }}>{title}</h2>
            <div className="mx-auto mt-3 h-[3px] w-12 rounded-full" style={{ backgroundColor: theme.primaryButton }} />
          </div>
        )}
        <div className="lw-marquee-wrap group relative overflow-hidden">
          <div className={cn('pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r to-transparent sm:w-20', fadeFrom)} />
          <div className={cn('pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l to-transparent sm:w-20', fadeFrom)} />
          <div className="lw-marquee-track flex w-max items-start gap-4" style={{ animationName: 'lw-marquee', animationDuration: `${dur}s`, animationTimingFunction: 'linear', animationIterationCount: 'infinite', animationDirection: kind === 'sponsors' ? 'reverse' : 'normal' }}>
            {loopMembers.map((member, index) => {
              const Wrapper = (member.href && member.href !== '#' ? 'a' : 'div') as any;
              const wp = member.href && member.href !== '#' ? { href: member.href, target: '_blank', rel: 'noopener noreferrer' } : {};
              return (
                <Wrapper key={`${member.id}-${index}`} {...wp} aria-hidden={index >= members.length || undefined} className="flex h-[160px] w-[240px] shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl bg-white p-0 shadow-sm" style={{ border: `1px solid ${theme.primaryButton}1A` }}>
                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-xl">
                    {member.photoUrl ? (
                      <img src={member.photoUrl} alt={member.name} className="h-full w-full object-cover object-center" />
                    ) : (
                      <span className="text-[13px] font-bold text-slate-500 px-4 text-center">{member.name}</span>
                    )}
                  </div>
                </Wrapper>
              );
            })}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes lw-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .lw-marquee-wrap:hover .lw-marquee-track { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) { .lw-marquee-track { animation: none !important; } }
      `}</style>
    </section>
  );
}

export const LogoWallSection = React.memo(LogoWallSectionBase);
