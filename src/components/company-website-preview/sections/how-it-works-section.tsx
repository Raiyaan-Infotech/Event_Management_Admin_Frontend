'use client';

import * as React from 'react';
import { Clipboard, PhoneCall, Settings2, Star } from 'lucide-react';
import type { ThemeColors } from './preview-shared';

export type StepItem = {
  id: number;
  stepNumber: number;
  title: string;
  description: string;
  iconKey?: string;
};

const STEP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'lucide:phone-call': PhoneCall,
  'lucide:clipboard': Clipboard,
  'lucide:settings-2': Settings2,
  'lucide:star': Star,
};

function HowItWorksSectionBase({ steps, theme }: { steps: StepItem[]; theme: ThemeColors }) {
  if (!steps || !steps.length) return null;

  return (
    <section id="how-it-works" className="w-full border-t border-slate-100 bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="mb-3 inline-flex rounded px-3 py-1 text-[12px] font-bold text-white" style={{ backgroundColor: theme.primaryButton }}>
            Seamless Workflow
          </span>
          <h2 className="mt-4 text-[28px] font-black leading-tight tracking-tight sm:text-[36px]" style={{ color: theme.primaryText }}>
            How It Works
          </h2>
          <div className="mx-auto mt-3 h-[3px] w-12 rounded-full" style={{ backgroundColor: theme.primaryButton }} />
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => {
            const IconComp = (step.iconKey && STEP_ICONS[step.iconKey]) || PhoneCall;
            return (
              <div key={step.id} className="relative flex flex-col items-center text-center">
                <div className="relative mb-5">
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-md"
                    style={{ backgroundColor: theme.primaryButton }}
                  >
                    <IconComp className="h-7 w-7" />
                  </div>
                  <span
                    className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[12px] font-black text-white shadow-sm"
                    style={{ backgroundColor: '#0F172A' }}
                  >
                    {step.stepNumber || idx + 1}
                  </span>
                </div>
                <h3 className="text-[17px] font-bold text-slate-900" style={{ color: theme.primaryText }}>
                  {step.title}
                </h3>
                <p className="mt-2 text-[13px] font-medium leading-6 text-slate-600">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export const HowItWorksSection = React.memo(HowItWorksSectionBase);
