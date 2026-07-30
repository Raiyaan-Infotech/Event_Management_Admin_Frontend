'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import type { ThemeColors } from './preview-shared';

export type PricingPlan = {
  id: number;
  name: string;
  price: number;
  billingPeriod: string;
  description: string;
  isFeatured: boolean;
  bulletPoints: string[];
};

function PricingSectionBase({ plans, theme }: { plans: PricingPlan[]; theme: ThemeColors }) {
  if (!plans || !plans.length) return null;

  return (
    <section id="pricing-plans" className="w-full border-t border-slate-100 bg-white py-16 sm:py-20">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="mb-3 inline-flex rounded px-3 py-1 text-[12px] font-bold text-white" style={{ backgroundColor: theme.primaryButton }}>
            Transparent Packages
          </span>
          <h2 className="mt-4 text-[28px] font-black leading-tight tracking-tight sm:text-[36px]" style={{ color: theme.primaryText }}>
            Pricing Plans & Packages
          </h2>
          <div className="mx-auto mt-3 h-[3px] w-12 rounded-full" style={{ backgroundColor: theme.primaryButton }} />
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan) => {
            const isFeatured = plan.isFeatured;
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-2xl p-8 transition duration-300 ${
                  isFeatured
                    ? 'border-2 shadow-xl scale-105 bg-white z-10'
                    : 'border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-lg'
                }`}
                style={isFeatured ? { borderColor: theme.primaryButton } : undefined}
              >
                {isFeatured && (
                  <span
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-sm"
                    style={{ backgroundColor: theme.primaryButton }}
                  >
                    Most Popular
                  </span>
                )}

                <div>
                  <h3 className="text-[20px] font-black text-slate-900" style={{ color: theme.primaryText }}>
                    {plan.name}
                  </h3>
                  <p className="mt-2 text-[13px] font-medium text-slate-600">
                    {plan.description}
                  </p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-[36px] font-black tracking-tight" style={{ color: theme.primaryText }}>
                      ₹{plan.price.toLocaleString()}
                    </span>
                    <span className="text-[13px] font-semibold text-slate-500">
                      / {plan.billingPeriod}
                    </span>
                  </div>

                  <hr className="my-6 border-slate-100" />

                  <ul className="space-y-3">
                    {plan.bulletPoints.map((point, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-[13px] font-medium text-slate-700">
                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white"
                          style={{ backgroundColor: theme.primaryButton }}
                        >
                          <Check className="h-3 w-3 stroke-[3]" />
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <a
                    href="#contact"
                    className="inline-flex h-11 w-full items-center justify-center rounded-lg text-[13px] font-bold text-white shadow-sm transition hover:opacity-90"
                    style={{ backgroundColor: theme.primaryButton }}
                  >
                    Get Started with {plan.name}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export const PricingSection = React.memo(PricingSectionBase);
