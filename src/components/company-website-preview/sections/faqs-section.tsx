'use client';

import * as React from 'react';
import { Plus, Minus } from 'lucide-react';
import type { ThemeColors } from './preview-shared';

export type FaqItem = {
  id: number;
  question: string;
  answer: string;
};

function cleanHtmlText(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function FaqsSectionBase({ faqs, theme }: { faqs: FaqItem[]; theme: ThemeColors }) {
  const [openIds, setOpenIds] = React.useState<Record<number, boolean>>({});

  if (!faqs || !faqs.length) return null;

  const toggle = (id: number) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section id="faqs" className="w-full border-t border-slate-100 bg-slate-50/50 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-[1140px] px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="text-[12px] font-bold uppercase tracking-wider text-pink-500">
            FAQ&apos;S
          </span>
          <h2 className="mt-2 text-[28px] font-black leading-tight tracking-tight sm:text-[36px]" style={{ color: theme.primaryText }}>
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-[14px] font-medium text-slate-500">
            Find quick answers to common questions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {faqs.map((faq) => {
            const cleanAns = cleanHtmlText(faq.answer);
            const isOpen = openIds[faq.id] ?? true;

            return (
              <div
                key={faq.id}
                onClick={() => toggle(faq.id)}
                className="group flex items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-2xs transition duration-200 hover:border-slate-200 hover:shadow-md cursor-pointer"
              >
                <div className="flex-1 space-y-1.5">
                  <h3 className="text-[15px] font-bold leading-snug text-slate-900" style={{ color: theme.primaryText }}>
                    {faq.question}
                  </h3>
                  {cleanAns && (
                    <p className={`text-[13px] font-medium leading-relaxed text-slate-500 transition-all duration-200 ${isOpen ? 'line-clamp-none' : 'line-clamp-2'}`}>
                      {cleanAns}
                    </p>
                  )}
                </div>

                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-50 text-pink-500 transition-colors group-hover:bg-pink-100"
                  aria-label="Toggle answer"
                >
                  {isOpen ? (
                    <Minus className="h-4 w-4 stroke-[2.5]" />
                  ) : (
                    <Plus className="h-4 w-4 stroke-[2.5]" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export const FaqsSection = React.memo(FaqsSectionBase);
