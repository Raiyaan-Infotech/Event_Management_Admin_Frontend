'use client';

import * as React from 'react';
import { PhoneCall, Clipboard, Settings2, Star, Gift, Sliders, QrCode, LayoutDashboard, Heart, CheckCircle2 } from 'lucide-react';
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

const STEP_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  'lucide:phone-call': PhoneCall,
  'lucide:clipboard': Clipboard,
  'lucide:settings-2': Settings2,
  'lucide:star': Star,
  'lucide:gift': Gift,
  'lucide:sliders': Sliders,
  'lucide:qr-code': QrCode,
  'lucide:layout-dashboard': LayoutDashboard,
  'phone-call': PhoneCall,
  'clipboard': Clipboard,
  'settings-2': Settings2,
  'star': Star,
};

function DynamicStepGraphic({ step, theme }: { step: StepItem; theme: ThemeColors }) {
  if (step.imageUrl) {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-md bg-slate-100 border border-slate-200">
        <img src={step.imageUrl} alt={step.title} className="h-full w-full object-cover" />
      </div>
    );
  }

  const IconComp = (step.iconKey && STEP_ICONS[step.iconKey]) || CheckCircle2;

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-md border border-slate-100 p-4 transition duration-300"
      style={{ backgroundColor: `${theme.primaryButton}0F` }}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-md text-white shadow-xs"
          style={{ backgroundColor: theme.primaryButton }}
        >
          <IconComp className="h-6 w-6 text-white" />
        </div>
        <span className="text-[12px] font-extrabold uppercase tracking-wider" style={{ color: theme.primaryButton }}>
          Step {step.stepNumber}
        </span>
      </div>
    </div>
  );
}

function HowItWorksSectionBase({ steps, theme }: { steps: StepItem[]; theme: ThemeColors }) {
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
            WORKING PROCESS
          </span>
          <h2 className="mt-2 text-[30px] font-black leading-tight tracking-tight sm:text-[38px]" style={{ color: theme.primaryText }}>
            How It Works
          </h2>
          <div className="mt-2 flex items-center justify-center gap-2" style={{ color: theme.primaryButton }}>
            <span className="h-px w-8 opacity-30" style={{ backgroundColor: theme.primaryButton }} />
            <Heart className="h-3.5 w-3.5 fill-current" />
            <span className="h-px w-8 opacity-30" style={{ backgroundColor: theme.primaryButton }} />
          </div>
          <p className="mt-2 text-[14px] font-medium text-slate-500">
            Create your event in {steps.length} simple steps
          </p>
        </div>

        {/* Timeline & Cards Stack */}
        <div className="relative space-y-6">
          {steps.map((step, idx) => {
            const StepIconComp = (step.iconKey && STEP_ICONS[step.iconKey]) || CheckCircle2;
            const stepNum = step.stepNumber || idx + 1;
            const hasBadgeText = Boolean(step.badgeTitle || step.badgeSub);

            return (
              <div key={step.id} className="relative flex items-start gap-4 sm:gap-6">
                {/* Number Badge Timeline Column */}
                <div className="relative flex flex-col items-center pt-5 shrink-0">
                  <div
                    className="z-10 flex h-10 w-10 items-center justify-center rounded-full font-black text-white shadow-md text-sm transition-transform hover:scale-110"
                    style={{ backgroundColor: theme.primaryButton }}
                  >
                    {stepNum}
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className="absolute top-12 bottom-0 w-0.5 border-r-2 border-dashed opacity-30"
                      style={{ borderColor: theme.primaryButton, height: 'calc(100% + 24px)' }}
                    />
                  )}
                </div>

                {/* Card Container */}
                <div className="flex-1 overflow-hidden rounded-md border border-slate-200 bg-white p-4 sm:p-6 shadow-xs transition-all duration-300 hover:shadow-md">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* Left Dynamic Graphic Box */}
                    <div className="h-36 w-full md:w-60 shrink-0">
                      <DynamicStepGraphic step={step} theme={theme} />
                    </div>

                    {/* Middle Content */}
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-[19px] font-black" style={{ color: theme.primaryText }}>
                        {step.title}
                      </h3>
                      <p className="mt-2 text-[13.5px] font-medium leading-relaxed text-slate-600">
                        {step.description}
                      </p>
                    </div>

                    {/* Right Icon / Badge */}
                    <div className="hidden lg:flex items-center gap-3 shrink-0 pl-6 border-l border-slate-100">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md"
                        style={{ backgroundColor: `${theme.primaryButton}1A` }}
                      >
                        <StepIconComp className="h-5 w-5" style={{ color: theme.primaryButton }} />
                      </div>
                      {hasBadgeText ? (
                        <div className="text-left">
                          {step.badgeTitle && <span className="block text-[13px] font-black text-slate-900">{step.badgeTitle}</span>}
                          {step.badgeSub && <span className="block text-[11px] font-semibold text-slate-500">{step.badgeSub}</span>}
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
