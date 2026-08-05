'use client';

import * as React from 'react';
import { Check, X, Sparkles, Target, Crown, Gem, Rocket, Star, Building2 } from 'lucide-react';
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
  bulletPoints: (string | { label: string; included: boolean })[];
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
                          {plan.bulletPoints.map((item, idx) => {
                            const label = typeof item === 'string' ? item : (item as any)?.label || '';
                            const isIncluded = typeof item === 'string' ? true : (item as any)?.included !== false;

                            return (
                              <li
                                key={idx}
                                className={`flex items-center gap-2.5 text-[13px] font-medium ${
                                  isIncluded ? 'text-slate-700' : 'text-slate-400 line-through opacity-70'
                                }`}
                              >
                                <span
                                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${
                                    isIncluded ? 'text-white' : 'bg-slate-200 text-slate-400'
                                  }`}
                                  style={
                                    isIncluded
                                      ? { backgroundColor: isFeatured ? theme.primaryButton : accent.fg }
                                      : undefined
                                  }
                                >
                                  {isIncluded ? (
                                    <Check className="h-3 w-3 stroke-[3]" />
                                  ) : (
                                    <X className="h-3 w-3 stroke-[2]" />
                                  )}
                                </span>
                                <span>{label}</span>
                              </li>
                            );
                          })}
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

        {/* All Plans Include Features Matrix Section (Matching Image 4) */}
        <PlanFeaturesComparisonSection theme={theme} />
      </div>
    </section>
  );
}

import { usePricingMatrixFeaturesData } from '@/hooks/usePricingPlans';

export function PlanFeaturesComparisonSection({ theme }: { theme: ThemeColors }) {
  const { data: matrixFeatures = [] } = usePricingMatrixFeaturesData();

  const displayItems = matrixFeatures && matrixFeatures.length > 0 ? matrixFeatures : [
    { feature_name: 'Beautiful Templates', plan_values_json: { free: { not_included: false, limit: '' }, basic: { not_included: false, limit: '' }, pro: { not_included: false, limit: '' }, premium: { not_included: false, limit: '' }, companies: { not_included: false, limit: '' } } },
    { feature_name: 'Custom Domain', plan_values_json: { free: { not_included: true, limit: '' }, basic: { not_included: false, limit: '' }, pro: { not_included: false, limit: '' }, premium: { not_included: false, limit: '' }, companies: { not_included: false, limit: '' } } },
    { feature_name: 'Live Streaming', plan_values_json: { free: { not_included: true, limit: '' }, basic: { not_included: false, limit: 'Limited' }, pro: { not_included: false, limit: '' }, premium: { not_included: false, limit: '' }, companies: { not_included: false, limit: '' } } },
    { feature_name: 'QR Code Access', plan_values_json: { free: { not_included: true, limit: '' }, basic: { not_included: false, limit: '' }, pro: { not_included: false, limit: '' }, premium: { not_included: false, limit: '' }, companies: { not_included: false, limit: '' } } },
    { feature_name: 'Guest Management', plan_values_json: { free: { not_included: false, limit: 'Up to 50' }, basic: { not_included: false, limit: 'Up to 500' }, pro: { not_included: false, limit: 'Up to 2000' }, premium: { not_included: false, limit: 'Unlimited' }, companies: { not_included: false, limit: 'Unlimited' } } },
    { feature_name: 'Priority Support', plan_values_json: { free: { not_included: true, limit: '' }, basic: { not_included: true, limit: '' }, pro: { not_included: false, limit: '' }, premium: { not_included: false, limit: '' }, companies: { not_included: false, limit: '' } } },
    { feature_name: 'Remove Branding', plan_values_json: { free: { not_included: true, limit: '' }, basic: { not_included: true, limit: '' }, pro: { not_included: false, limit: '' }, premium: { not_included: false, limit: '' }, companies: { not_included: false, limit: '' } } },
  ];

  const TIERS = [
    { key: 'free', label: 'Free' },
    { key: 'basic', label: 'Basic' },
    { key: 'pro', label: 'Pro' },
    { key: 'premium', label: 'Premium' },
    { key: 'companies', label: 'Companies' },
  ];

  return (
    <div className="mt-16 w-full rounded-3xl border border-slate-200/80 bg-slate-50/50 p-6 sm:p-8 shadow-2xs">
      <div className="grid gap-8 lg:grid-cols-[1fr_2.2fr] items-start">
        {/* Left Column (Matching Image 4) */}
        <div className="space-y-3.5">
          <span className="inline-flex rounded-full bg-rose-100/80 px-3 py-1 text-[11px] font-extrabold text-rose-600">
            All Plans Include
          </span>
          <h3 className="text-[24px] font-black leading-tight tracking-tight text-slate-900" style={{ color: theme.primaryText }}>
            Powerful Features in <span className="text-rose-500">Every Plan</span>
          </h3>
          <p className="text-[13px] font-medium leading-relaxed text-slate-600">
            Everything you need to create, manage and share amazing events.
          </p>
          <a
            href="#contact"
            className="inline-flex h-9 items-center justify-center rounded-xl px-4 text-[12px] font-bold text-white shadow-xs transition hover:opacity-90 active:scale-95"
            style={{ backgroundColor: theme.primaryButton }}
          >
            View All Features
          </a>
        </div>

        {/* Right Column: Comparison Table (Matching Image 4) */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-700">
                <th className="py-3 px-4 font-bold text-[12px]">Features</th>
                {TIERS.map((t) => (
                  <th key={t.key} className="py-3 px-3 font-extrabold text-center text-[12px]">
                    {t.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayItems.map((item: any, idx: number) => {
                const planMap = (item.plan_values_json || {}) as Record<string, any>;

                return (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 text-[12.5px]">
                      {item.feature_name || item.title}
                    </td>

                    {TIERS.map((t) => {
                      const val = planMap[t.key];
                      let isNotIncluded = false;
                      let limitText = '';

                      if (typeof val === 'object' && val !== null) {
                        isNotIncluded = Boolean(val.not_included);
                        limitText = String(val.limit || '').trim();
                      } else if (typeof val === 'boolean') {
                        isNotIncluded = !val;
                      } else if (typeof val === 'string') {
                        limitText = val.trim();
                      }

                      return (
                        <td key={t.key} className="py-3 px-3 text-center align-middle font-semibold text-[11.5px]">
                          {isNotIncluded ? (
                            <span className="inline-flex h-5 w-5 items-center justify-center text-rose-500 mx-auto">
                              <X className="h-4 w-4 stroke-[2.5]" />
                            </span>
                          ) : limitText && limitText.toLowerCase() !== 'unlimited' ? (
                            <span className="text-slate-700 font-extrabold text-[11px]">
                              {limitText}
                            </span>
                          ) : (
                            <span className="inline-flex h-5 w-5 items-center justify-center text-emerald-600 mx-auto">
                              <Check className="h-4 w-4 stroke-[3]" />
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export const PricingSection = React.memo(PricingSectionBase);