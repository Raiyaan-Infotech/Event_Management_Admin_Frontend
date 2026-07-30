'use client';

import * as React from 'react';
import { Check, Sparkles, Target, Crown, Gem, Rocket, Star, Building2 } from 'lucide-react';
import type { ThemeColors } from './preview-shared';

export type PricingPlan = {
  id: number;
  planName: string;
  subtitle: string;
  /** Groups plans into sections — e.g. 'individuals' | 'companies'. Unknown/missing values get a generic "For X" heading. */
  targetType?: string;
  currencySymbol: string;
  priceMonthly: number;
  /** 0/undefined when a plan has no yearly price set — the toggle only appears if at least one plan has this. */
  priceYearly?: number;
  /** Shown verbatim when there's no yearly data to toggle against, e.g. "per event". */
  periodLabel: string;
  badgeText?: string;
  badgeStyle?: string; // 'filled' | 'outline'
  isPopular: boolean;
  bulletPoints: string[];
};

type IconComponentProps = { className?: string; style?: React.CSSProperties };

const SECTION_META: Record<string, { title: string; subtitle: string; icon: React.ComponentType<IconComponentProps> }> = {
  individuals: {
    title: 'For Individuals',
    subtitle: 'Perfect for creating beautiful events for personal occasions',
    icon: Sparkles,
  },
  companies: {
    title: 'For Event Management Companies',
    subtitle: 'Powerful tools to manage multiple events and clients seamlessly',
    icon: Building2,
  },
};

function getSectionMeta(key: string) {
  if (SECTION_META[key]) return SECTION_META[key];
  const title = key.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return { title: `For ${title}`, subtitle: 'Choose the plan that fits your needs.', icon: Sparkles };
}

// No icon/color column exists on pricing plans — these cycle by card position
// within each group purely for visual variety, independent of real data.
const ACCENTS: { bg: string; fg: string }[] = [
  { bg: '#EDE9FE', fg: '#7C3AED' }, // purple
  { bg: '#DBEAFE', fg: '#2563EB' }, // blue
  { bg: '#FCE7F3', fg: '#DB2777' }, // pink
  { bg: '#FFEDD5', fg: '#EA580C' }, // orange
];
const CARD_ICONS: React.ComponentType<IconComponentProps>[] = [Sparkles, Target, Crown, Gem, Rocket, Star];

function gridColsClass(count: number) {
  if (count <= 1) return 'grid-cols-1';
  if (count === 2) return 'grid-cols-1 sm:grid-cols-2';
  if (count === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
}

function formatPrice(currency: string, amount: number) {
  return `${currency}${Math.round(amount).toLocaleString('en-IN')}`;
}

function PricingSectionBase({ plans, theme }: { plans: PricingPlan[]; theme: ThemeColors }) {
  const [billing, setBilling] = React.useState<'monthly' | 'yearly'>('monthly');

  const groups = React.useMemo(() => {
    if (!plans || !plans.length) return [];
    const order: string[] = [];
    const map = new Map<string, PricingPlan[]>();
    for (const plan of plans) {
      const key = plan.targetType || 'plans';
      if (!map.has(key)) {
        map.set(key, []);
        order.push(key);
      }
      map.get(key)!.push(plan);
    }
    return order.map((key) => ({ key, items: map.get(key)! }));
  }, [plans]);

  if (!plans || !plans.length) return null;

  const anyYearlyData = plans.some((p) => (p.priceYearly ?? 0) > 0);

  return (
    <section id="pricing-plans" className="w-full border-t border-slate-100 bg-white py-16 sm:py-20">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {anyYearlyData && (
          <div className="mb-12 flex justify-center">
            <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setBilling('monthly')}
                className="rounded-full px-4 py-1.5 text-[13px] font-bold transition-colors"
                style={
                  billing === 'monthly'
                    ? { backgroundColor: '#ffffff', color: theme.primaryText, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }
                    : { color: theme.secondaryText }
                }
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBilling('yearly')}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-bold text-white transition-colors"
                style={billing === 'yearly' ? { backgroundColor: theme.primaryButton } : { color: theme.secondaryText, backgroundColor: 'transparent' }}
              >
                Yearly Billing
                <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">Save up to 20%</span>
              </button>
            </div>
          </div>
        )}

        {groups.map(({ key, items }, groupIndex) => {
          const meta = key === 'plans' ? null : getSectionMeta(key);
          return (
            <div key={key} className={groupIndex > 0 ? 'mt-16' : undefined}>
              {meta && (
                <div className="mb-10 text-center">
                  <div
                    className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${theme.primaryButton}14` }}
                  >
                    <meta.icon className="h-5 w-5" style={{ color: theme.primaryButton }} />
                  </div>
                  <h2 className="text-[22px] font-black leading-tight" style={{ color: theme.primaryText }}>
                    {meta.title}
                  </h2>
                  <p className="mt-1.5 text-[13px] font-medium" style={{ color: theme.paragraph }}>
                    {meta.subtitle}
                  </p>
                </div>
              )}

              <div className={`grid gap-6 ${gridColsClass(items.length)}`}>
                {items.map((plan, i) => {
                  const accent = ACCENTS[i % ACCENTS.length];
                  const CardIcon = CARD_ICONS[i % CARD_ICONS.length];
                  const isFeatured = plan.isPopular;

                  const showYearly = anyYearlyData && billing === 'yearly' && (plan.priceYearly ?? 0) > 0;
                  const displayedAmount = showYearly ? plan.priceYearly! : plan.priceMonthly;
                  const displayedPeriod = anyYearlyData ? (showYearly ? 'year' : 'month') : plan.periodLabel;
                  const savingsPct =
                    showYearly && plan.priceMonthly > 0
                      ? Math.round(100 - (plan.priceYearly! / (plan.priceMonthly * 12)) * 100)
                      : 0;

                  const ctaLabel = plan.priceMonthly === 0 ? 'Get Started Free' : `Choose ${plan.planName}`;

                  return (
                    <div
                      key={plan.id}
                      className={`relative flex flex-col justify-between rounded-xl p-7 transition duration-300 ${
                        isFeatured
                          ? 'z-10 scale-105 border-2 bg-white shadow-xl'
                          : 'border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-lg'
                      }`}
                      style={isFeatured ? { borderColor: theme.primaryButton } : undefined}
                    >
                      {isFeatured && (
                        <span
                          className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-md px-4 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-sm"
                          style={{ backgroundColor: theme.primaryButton }}
                        >
                          Most Popular
                        </span>
                      )}

                      {plan.badgeText && (
                        <span
                          className="absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={
                            plan.badgeStyle === 'outline'
                              ? { border: `1px solid ${accent.fg}`, color: accent.fg }
                              : { backgroundColor: accent.fg, color: '#ffffff' }
                          }
                        >
                          {plan.badgeText}
                        </span>
                      )}

                      <div>
                        <div
                          className="mb-4 flex h-10 w-10 items-center justify-center rounded-full"
                          style={{ backgroundColor: accent.bg }}
                        >
                          <CardIcon className="h-5 w-5" style={{ color: accent.fg }} />
                        </div>

                        <h3 className="text-[18px] font-black" style={{ color: theme.primaryText }}>
                          {plan.planName}
                        </h3>
                        <p className="mt-1.5 text-[13px] font-medium text-slate-600">{plan.subtitle}</p>

                        <div className="mt-5 flex items-baseline gap-1.5 flex-wrap">
                          <span className="text-[32px] font-black tracking-tight" style={{ color: theme.primaryText }}>
                            {formatPrice(plan.currencySymbol || '₹', displayedAmount)}
                          </span>
                          <span className="text-[13px] font-semibold text-slate-500">/ {displayedPeriod}</span>
                          {savingsPct > 0 && (
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-600">
                              Save {savingsPct}%
                            </span>
                          )}
                        </div>

                        <hr className="my-5 border-slate-100" />

                        <ul className="space-y-2.5">
                          {plan.bulletPoints.map((point, idx) => (
                            <li key={idx} className="flex items-center gap-2.5 text-[13px] font-medium text-slate-700">
                              <span
                                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-white"
                                style={{ backgroundColor: isFeatured ? theme.primaryButton : accent.fg }}
                              >
                                <Check className="h-3 w-3 stroke-[3]" />
                              </span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-7">
                        {isFeatured ? (
                          <a
                            href="#contact"
                            className="inline-flex h-11 w-full items-center justify-center rounded-md text-[13px] font-bold text-white shadow-sm transition hover:opacity-90"
                            style={{ backgroundColor: theme.primaryButton }}
                          >
                            {ctaLabel}
                          </a>
                        ) : (
                          <a
                            href="#contact"
                            className="inline-flex h-11 w-full items-center justify-center rounded-md border text-[13px] font-bold transition-colors hover:text-white"
                            style={{ borderColor: accent.fg, color: accent.fg }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = accent.fg)}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            {ctaLabel}
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export const PricingSection = React.memo(PricingSectionBase);