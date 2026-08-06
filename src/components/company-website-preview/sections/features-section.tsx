'use client';

import * as React from 'react';
import {
  Award,
  IndianRupee,
  LayoutDashboard,
  LayoutGrid,
  Palette,
  Radio,
  Users,
  MapPin,
  UserCheck,
  Calendar,
  Video,
  Image as ImageIcon,
  QrCode,
  Heart,
  Gift,
  MessageCircle,
  Bell,
  ArrowRight,
} from 'lucide-react';
import { Icon } from '@iconify/react';
import type { ThemeColors } from './preview-shared';

export type FeatureItem = {
  id: number;
  title: string;
  description: string;
  iconKey?: string;
  /** From `custom_icon_url`. Takes priority over `iconKey` when present. */
  customIconUrl?: string;
  /** From `bullet_points_json` — real column, currently null on most rows.
   *  Renders no list until an admin populates it for a feature. */
  bulletPoints?: string[];
  /** Still no backing column in the API response — defaults to "View Feature". */
  ctaLabel?: string;
  /**
   * Resolved from the DB `is_active` column (1/0). Only features where this
   * is strictly `true` are shown on the live site — this must be converted
   * from the raw 1/0 value wherever FeatureItem[] is built (e.g. in
   * useCompanyFeatures()): `isActive: Boolean(row.is_active)`.
   */
  isActive?: boolean;
};

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'lucide:layout-dashboard': LayoutDashboard,
  'lucide:layout-grid': LayoutGrid,
  'lucide:award': Award,
  'lucide:palette': Palette,
  'lucide:users': Users,
  'lucide:user-check': UserCheck,
  'lucide:radio': Radio,
  'lucide:indian-rupee': IndianRupee,
  'lucide:map-pin': MapPin,
  'lucide:calendar': Calendar,
  'lucide:video': Video,
  'lucide:image': ImageIcon,
  'lucide:qr-code': QrCode,
  'lucide:heart': Heart,
  'lucide:gift': Gift,
  'lucide:message-circle': MessageCircle,
  'lucide:bell': Bell,
};

// Rotating accent palette — there's no per-feature color column in the schema,
// so each card cycles through this set by index instead of using one flat theme color.
const ACCENTS: { bg: string; fg: string }[] = [
  { bg: '#F3E8FF', fg: '#7C3AED' }, // purple
  { bg: '#FEE2E2', fg: '#DC2626' }, // red
  { bg: '#DBEAFE', fg: '#2563EB' }, // blue
  { bg: '#D1FAE5', fg: '#059669' }, // green
  { bg: '#FFEDD5', fg: '#EA580C' }, // orange
  { bg: '#FCE7F3', fg: '#DB2777' }, // pink
  { bg: '#CFFAFE', fg: '#0891B2' }, // teal
  { bg: '#FEF3C7', fg: '#D97706' }, // amber
];

import { useWebsiteBuilderTranslation } from '@/hooks/use-website-builder-translation';

function FeaturesSectionBase({ features, theme }: { features: FeatureItem[]; theme: ThemeColors }) {
  const { t } = useWebsiteBuilderTranslation();
  // Only ever render features where isActive resolves to true — inactive
  // features must never reach the grid, regardless of what the caller passed in.
  const activeFeatures = React.useMemo(
    () => (features || []).filter((f) => f.isActive !== false),
    [features],
  );

  if (!activeFeatures || !activeFeatures.length) return null;

  return (
    <section id="features" className="w-full border-t border-slate-100 bg-white py-16 sm:py-20">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: theme.primaryButton }}>
            {t('features.title', 'Features')}
          </span>
          <h2
            className="mt-3 text-[28px] font-black leading-tight tracking-tight sm:text-[36px]"
            style={{ color: theme.primaryText }}
          >
            {t('features.subtitle', 'All the Features You Need')}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-[14px] font-medium" style={{ color: theme.paragraph }}>
            Everything you need to inspire, manage and enhance your event experience.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {activeFeatures.map((item, index) => {
            const accent = ACCENTS[index % ACCENTS.length];
            const iconName = item.iconKey
              ? item.iconKey.includes(':')
                ? item.iconKey
                : `lucide:${item.iconKey}`
              : 'lucide:sparkles';

            return (
              <div
                key={item.id}
                className="group relative rounded-xl border border-slate-100 bg-slate-50/50 p-6 shadow-xs transition duration-300 hover:-translate-y-1 hover:border-slate-200 hover:bg-white hover:shadow-md"
              >
                <div
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg transition duration-300 group-hover:scale-110"
                  style={{ backgroundColor: accent.bg }}
                >
                  {item.customIconUrl ? (
                    <img src={item.customIconUrl} alt="" className="h-5 w-5 object-contain" />
                  ) : (
                    <Icon icon={iconName} className="h-5 w-5" style={{ color: accent.fg }} />
                  )}
                </div>

                <h3 className="text-[16px] font-bold" style={{ color: theme.primaryText }}>
                  {item.title}
                </h3>

                {item.description && (
                  <p className="mt-1.5 text-[13px] font-medium leading-6 text-slate-600">{item.description}</p>
                )}

                {item.bulletPoints && item.bulletPoints.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {item.bulletPoints.slice(0, 4).map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-[12.5px] font-medium text-slate-600">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: accent.fg }} />
                        {point}
                      </li>
                    ))}
                  </ul>
                )}

                <a
                  href="#"
                  className="mt-4 inline-flex items-center gap-1 text-[13px] font-bold transition-colors"
                  style={{ color: accent.fg }}
                >
                  {item.ctaLabel || t('features.view_details', 'View Feature')}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export const FeaturesSection = React.memo(FeaturesSectionBase);