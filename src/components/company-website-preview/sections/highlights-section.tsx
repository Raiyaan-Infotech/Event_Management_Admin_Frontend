'use client';

import * as React from 'react';
import {
    Calendar,
    Sliders,
    Monitor,
    RefreshCw,
    Upload,
    HelpCircle,
    BarChart,
    Layers,
    DollarSign,
    Mail,
    Star,
    Award,
    Shield,
    Zap,
    Heart,
    Sparkles,
    LucideIcon,
} from 'lucide-react';
import { DEFAULT_HIGHLIGHTS, useHighlights, type HighlightsSettings } from '@/hooks/useHighlights';

const ICON_MAP: Record<string, LucideIcon> = {
    Calendar,
    Sliders,
    Monitor,
    RefreshCw,
    Upload,
    HelpCircle,
    BarChart,
    Layers,
    DollarSign,
    Mail,
    Star,
    Award,
    Shield,
    Zap,
    Heart,
};

interface HighlightsSectionProps {
    pageSlug?: string;
    instance?: number;
    data?: Partial<HighlightsSettings>;
    theme?: any;
    variant?: 'outline' | 'filled';
}

export function HighlightsSection({ pageSlug = 'home', instance = 1, data, theme, variant }: HighlightsSectionProps) {
    const { data: fetchedData } = useHighlights(pageSlug, instance);
    const config = { ...DEFAULT_HIGHLIGHTS, ...fetchedData, ...data };
    const items = config.items && config.items.length > 0 ? config.items : DEFAULT_HIGHLIGHTS.items;
    const iconStyle = variant || config.icon_style || 'filled';

    const iconBgColor = config.icon_bg_color || theme?.primaryButton || '#F3F0FF';
    const iconColor = config.icon_color || theme?.primaryButton || '#6C5DD3';
    const titleColor = config.title_color || theme?.primaryText || '#1F2937';
    const descriptionColor = config.description_color || theme?.secondaryText || '#6B7280';

    return (
        <section className="w-full bg-white py-12 border-b">
            <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
                <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-${Math.min(config.items_per_row || 6, 6)} gap-6 text-center`}>
                    {items.map((item: any, idx: number) => {
                        const IconComp = ICON_MAP[item.icon] || Sparkles;
                        return (
                            <div key={item.id || idx} className="flex flex-col items-center space-y-2 p-2">
                                <div
                                    className="flex h-12 w-12 items-center justify-center rounded-full transition-transform hover:scale-105"
                                    style={{
                                        backgroundColor: iconStyle === 'filled' ? iconBgColor : 'transparent',
                                        border: iconStyle === 'outline' ? `2px solid ${iconColor}` : 'none',
                                        color: iconColor,
                                    }}
                                >
                                    <IconComp className="h-6 w-6" />
                                </div>
                                <h4 className="text-sm font-bold tracking-tight" style={{ color: titleColor }}>
                                    {item.title}
                                </h4>
                                <p className="text-xs" style={{ color: descriptionColor }}>
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
