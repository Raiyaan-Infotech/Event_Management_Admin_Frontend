'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import type { ThemeColors } from './preview-shared';

export type FaqItem = {
  id: number;
  question: string;
  answer: string;
};

function FaqsSectionBase({ faqs, theme }: { faqs: FaqItem[]; theme: ThemeColors }) {
  const [openId, setOpenId] = React.useState<number | null>(faqs && faqs[0] ? faqs[0].id : null);

  if (!faqs || !faqs.length) return null;

  const toggle = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faqs" className="w-full border-t border-slate-100 bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-[960px] px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="mb-3 inline-flex rounded px-3 py-1 text-[12px] font-bold text-white" style={{ backgroundColor: theme.primaryButton }}>
            Got Questions?
          </span>
          <h2 className="mt-4 text-[28px] font-black leading-tight tracking-tight sm:text-[36px]" style={{ color: theme.primaryText }}>
            Frequently Asked Questions
          </h2>
          <div className="mx-auto mt-3 h-[3px] w-12 rounded-full" style={{ backgroundColor: theme.primaryButton }} />
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white transition shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => toggle(faq.id)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left text-[15px] font-bold text-slate-900 transition hover:bg-slate-50/50"
                  style={{ color: theme.primaryText }}
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    style={{ color: theme.primaryButton }}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-slate-100 px-5 pb-5 pt-3 text-[14px] font-medium leading-7 text-slate-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export const FaqsSection = React.memo(FaqsSectionBase);
