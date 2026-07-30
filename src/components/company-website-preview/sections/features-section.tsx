'use client';

import * as React from 'react';
import { Award, IndianRupee, LayoutDashboard, Palette, Radio, Users } from 'lucide-react';
import type { ThemeColors } from './preview-shared';

export type FeatureItem = {
  id: number;
  title: string;
  description: string;
  iconKey?: string;
};

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'lucide:layout-dashboard': LayoutDashboard,
  'lucide:award': Award,
  'lucide:palette': Palette,
  'lucide:users': Users,
  'lucide:radio': Radio,
  'lucide:indian-rupee': IndianRupee,
};

function FeaturesSectionBase({ features, theme }: { features: FeatureItem[]; theme: ThemeColors }) {
  if (!features || !features.length) return null;

  return (
    <section id="features" className="w-full border-t border-slate-100 bg-white py-16 sm:py-20">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="mb-3 inline-flex rounded px-3 py-1 text-[12px] font-bold text-white" style={{ backgroundColor: theme.primaryButton }}>
            Why Choose Us
          </span>
          <h2 className="mt-4 text-[28px] font-black leading-tight tracking-tight sm:text-[36px]" style={{ color: theme.primaryText }}>
            Features & Key Advantages
          </h2>
          <div className="mx-auto mt-3 h-[3px] w-12 rounded-full" style={{ backgroundColor: theme.primaryButton }} />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((item) => {
            const IconComp = (item.iconKey && ICON_MAP[item.iconKey]) || LayoutDashboard;
            return (
              <div
                key={item.id}
                className="group relative rounded-xl border border-slate-100 bg-slate-50/50 p-6 shadow-xs transition duration-300 hover:-translate-y-1 hover:border-slate-200 hover:bg-white hover:shadow-md"
              >
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg text-white shadow-sm transition duration-300 group-hover:scale-110"
                  style={{ backgroundColor: theme.primaryButton }}
                >
                  <IconComp className="h-6 w-6" />
                </div>
                <h3 className="text-[17px] font-bold text-slate-900" style={{ color: theme.primaryText }}>
                  {item.title}
                </h3>
                <p className="mt-2 text-[13px] font-medium leading-6 text-slate-600">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export const FeaturesSection = React.memo(FeaturesSectionBase);
