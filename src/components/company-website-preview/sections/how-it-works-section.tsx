'use client';

import * as React from 'react';
import { Icon } from '@iconify/react';
import { Heart } from 'lucide-react';
import type { ThemeColors } from './preview-shared';

export type StepItem = {
  id: number;
  stepNumber: number;
  title: string;
  description: string;
  iconKey?: string;
  imageUrl?: string;
  badgeTitle?: string;
  badgeSub?: string;
};

/** Bare names from older saved rows are assumed to be lucide icons. */
const iconName = (key?: string) => {
  const raw = (key || '').trim();
  if (!raw) return 'lucide:circle-check-big';
  return raw.includes(':') ? raw : `lucide:${raw}`;
};

// Each step gets its own accent rather than one flat theme colour, so the four
// steps read as distinct stages.
const STEP_ACCENTS: { bg: string; fg: string }[] = [
  { bg: '#FCE7F3', fg: '#DB2777' }, // pink
  { bg: '#EDE9FE', fg: '#7C3AED' }, // violet
  { bg: '#D1FAE5', fg: '#059669' }, // green
  { bg: '#FFEDD5', fg: '#EA580C' }, // orange
  { bg: '#DBEAFE', fg: '#2563EB' }, // blue
];

// Unbordered and unrounded on purpose: it sits flush against the card's own
// edge with no padding around it, and the CARD's `overflow-hidden` + rounded
// corners are what clip its exposed edges. Giving the graphic its own border
// and radius on top of that drew a second box outline inside the card — a
// "box within a box" instead of one continuous shape, which is what "no space
// around the image" was pointing at.
function DynamicStepGraphic({ step, accent }: { step: StepItem; accent: { bg: string; fg: string } }) {
  if (step.imageUrl) {
    return (
      <div className="relative h-full w-full bg-slate-100">
        <img src={step.imageUrl} alt={step.title} className="h-full w-full object-cover" />
      </div>
    );
  }

  // No "Step N" label here: the numbered badge on the timeline to the left
  // already identifies the step, so repeating it inside the card read as
  // duplicated content next to the mockup's plain, unlabeled graphic.
  return (
    <div
      className="relative flex h-full w-full items-center justify-center transition duration-300"
      style={{ backgroundColor: accent.bg }}
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-xl text-white shadow-xs"
        style={{ backgroundColor: accent.fg }}
      >
        <Icon icon={iconName(step.iconKey)} className="h-7 w-7 text-white" />
      </div>
    </div>
  );
}

import { useWebsiteLanguage } from '../website-language-provider';

function HowItWorksSectionBase({ steps, theme }: { steps: StepItem[]; theme: ThemeColors }) {
  const { t } = useWebsiteLanguage();
  if (!steps || !steps.length) return null;

  return (
    <section id="how-it-works" className="w-full border-t border-slate-100 bg-white py-16 sm:py-20">
      <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <span
            className="mb-2 inline-flex items-center rounded-md px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest text-white shadow-xs"
            style={{ backgroundColor: theme.primaryButton }}
          >
            {t('how_it_works.badge', 'WORKING PROCESS')}
          </span>
          <h2 className="mt-2 text-[30px] font-black leading-tight tracking-tight sm:text-[38px]" style={{ color: theme.primaryText }}>
            {t('how_it_works.title', 'How It Works')}
          </h2>
          <div className="mt-2 flex items-center justify-center gap-2" style={{ color: theme.primaryButton }}>
            <span className="h-px w-8 opacity-30" style={{ backgroundColor: theme.primaryButton }} />
            <Heart className="h-3.5 w-3.5 fill-current" />
            <span className="h-px w-8 opacity-30" style={{ backgroundColor: theme.primaryButton }} />
          </div>
          <p className="mt-2 text-[14px] font-medium text-slate-500">
            {t('how_it_works.subtitle', 'Get your event website ready in 4 simple steps')}
          </p>
        </div>

        {/* Timeline & Cards Stack */}
        <div className="relative space-y-6">
          {steps.map((step, idx) => {
            const accent = STEP_ACCENTS[idx % STEP_ACCENTS.length];
            const stepNum = step.stepNumber || idx + 1;
            const hasBadgeText = Boolean(step.badgeTitle || step.badgeSub);

            return (
              // `items-stretch` (not `items-start`) is load-bearing: the badge
              // column below needs to match the card's rendered height so the
              // connector SVG has real height to draw into. With items-start the
              // column was only ever as tall as the circle itself, so the curve
              // had nothing to stretch through and collapsed to a stub.
              <div key={step.id} className="relative flex items-stretch gap-4 sm:gap-6">
                {/* Number badge + connector — a continuous curved line running
                    behind the card, matching the mockup's flowing thread. */}
                <div className="relative flex w-10 shrink-0 flex-col items-center">
                  <div
                    className="z-10 mt-5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black text-white shadow-md transition-transform hover:scale-110"
                    style={{ backgroundColor: theme.primaryButton }}
                  >
                    {stepNum}
                  </div>
                  {idx < steps.length - 1 && (
                    <svg
                      aria-hidden
                      className="absolute left-1/2 top-[3.75rem] -translate-x-1/2"
                      width="24"
                      viewBox="0 0 24 100"
                      preserveAspectRatio="none"
                      style={{ height: 'calc(100% - 2.25rem)' }}
                    >
                      <path
                        d="M12 0 C 20 30, 4 70, 12 100"
                        fill="none"
                        stroke={theme.primaryButton}
                        strokeOpacity={0.35}
                        strokeWidth={2}
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </div>

                {/* Card Container — no padding here. The graphic needs to bleed
                    flush to the card's own edges (top/left/bottom), so padding
                    moved onto the content and badge columns individually
                    instead of wrapping the whole row uniformly. */}
                <div className="flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition-all duration-300 hover:shadow-md">
                  {/* items-stretch so the graphic fills the card's full height.
                      `gap` is what spaces the graphic from its neighbour — on
                      each column, padding is applied only to the edges NOT
                      touching the graphic, so gap and padding don't stack into
                      a double gap. */}
                  <div className="flex flex-col items-stretch gap-4 sm:gap-6 md:flex-row">
                    {/* Left Dynamic Graphic Box — flush to the card's edges */}
                    <div className="h-36 w-full shrink-0 md:h-auto md:min-h-[9rem] md:w-60">
                      <DynamicStepGraphic step={step} accent={accent} />
                    </div>

                    {/* Middle Content */}
                    <div className="flex flex-1 flex-col justify-center px-4 pb-4 text-center sm:px-6 sm:pb-6 md:py-6 md:pl-0 md:pr-6 md:text-left">
                      <h3 className="text-[19px] font-black" style={{ color: theme.primaryText }}>
                        {step.title}
                      </h3>
                      <p className="mt-2 text-[13.5px] font-medium leading-relaxed text-slate-600">
                        {step.description}
                      </p>
                    </div>

                    {/* Right Icon / Badge — fixed width so the icons line up in a
                        straight column across every step regardless of label length. */}
                    <div className="hidden w-[200px] shrink-0 items-center gap-3 self-center border-l border-slate-100 py-6 pl-6 pr-6 lg:flex">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
                        style={{ backgroundColor: accent.bg }}
                      >
                        <Icon icon={iconName(step.iconKey)} className="h-5 w-5" style={{ color: accent.fg }} />
                      </div>
                      {hasBadgeText ? (
                        <div className="min-w-0 text-left">
                          {step.badgeTitle && <span className="block truncate text-[13px] font-black text-slate-900">{step.badgeTitle}</span>}
                          {step.badgeSub && <span className="block truncate text-[11px] font-semibold text-slate-500">{step.badgeSub}</span>}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export const HowItWorksSection = React.memo(HowItWorksSectionBase);
