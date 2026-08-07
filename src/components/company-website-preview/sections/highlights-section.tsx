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
    Gift,
    Share2,
    QrCode,
    Users,
    ShieldCheck,
    Headphones,
    Layout,
    Package,
    LucideIcon,
} from 'lucide-react';
import {
    DEFAULT_HIGHLIGHTS,
    useHighlights,
    highlightsBackgroundStyle,
    type HighlightsSettings,
} from '@/hooks/useHighlights';

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
    ShieldCheck,
    Zap,
    Heart,
    Gift,
    Share2,
    QrCode,
    Users,
    Headphones,
    Layout,
    Package,
    Sparkles,
};

const PASTEL_THEMES = [
    { bg: '#F3E8FF', color: '#9333EA' },
    { bg: '#EFF6FF', color: '#2563EB' },
    { bg: '#F5F3FF', color: '#7C3AED' },
    { bg: '#FFF7ED', color: '#EA580C' },
    { bg: '#ECFDF5', color: '#10B981' },
];

const DEFAULT_INSTANCE_1_ITEMS = [
    { id: '1', icon: 'Gift', title: 'All in One App', description: 'Everything in your pocket' },
    { id: '2', icon: 'Sliders', title: 'Customizable', description: '100% customizable to your style' },
    { id: '3', icon: 'Share2', title: 'Instant Sharing', description: 'Share app via link or QR code' },
    { id: '4', icon: 'QrCode', title: 'Guest Engagement', description: 'Engage guests with interactive features' },
    { id: '5', icon: 'ShieldCheck', title: 'Total Control', description: 'Manage your event with ease' },
];

const DEFAULT_INSTANCE_2_ITEMS = [
    { id: '1', icon: 'Calendar', title: '25K+', description: 'Events Created' },
    { id: '2', icon: 'Users', title: '500K+', description: 'Happy Users' },
    { id: '3', icon: 'Layout', title: '1000+', description: 'Beautiful Templates' },
    { id: '4', icon: 'Headphones', title: '24/7', description: 'Customer Support' },
    { id: '5', icon: 'ShieldCheck', title: '99.9%', description: 'Uptime & Security' },
];

interface HighlightsSectionProps {
    pageSlug?: string;
    instance?: number;
    data?: Partial<HighlightsSettings>;
    theme?: any;
    variant?: 'outline' | 'filled';
}

import { useWebsiteLanguage } from '../website-language-provider';

export function HighlightsSection({ pageSlug = 'home', instance = 1, data, theme }: HighlightsSectionProps) {
    const { t, translator } = useWebsiteLanguage();
    const { data: fetchedData } = useHighlights(pageSlug, instance);
    const config = { ...DEFAULT_HIGHLIGHTS, ...fetchedData, ...data };

    let defaultFallbackItems = instance === 2 ? DEFAULT_INSTANCE_2_ITEMS : DEFAULT_INSTANCE_1_ITEMS;
    
    let items = config.items && config.items.length > 0 ? config.items : defaultFallbackItems;

    // Highlight cards live inside settings_json, so the backend registers them
    // as flat item_<n>_title / item_<n>_description keys against this row's id.
    // Positions are 1-based and must match that extractor. Only the saved rows
    // have an id — the hardcoded fallback items are never translatable.
    const recordId = (fetchedData as { id?: number } | undefined)?.id;
    if (recordId && translator.active) {
        items = items.map((item: { title: string; description: string }, index: number) => ({
            ...item,
            title: translator.field('highlights', recordId, `item_${index + 1}_title`, item.title, pageSlug),
            description: translator.field(
                'highlights',
                recordId,
                `item_${index + 1}_description`,
                item.description,
                pageSlug
            ),
        }));
    }

    // Background comes from the shared helper so the admin picker, its preview
    // modal and this section can't disagree. (The old code here ignored the
    // configured colours entirely and hardcoded a pink/purple gradient for every
    // `background_type: 'gradient'` block.)
    //
    // Instance 2 historically rendered that pink/purple as its default look, so
    // it is preserved for blocks that have never had a background configured —
    // otherwise upgrading would silently restyle live sites.
    const hasConfiguredBackground = Boolean(
        config.gradient_from || config.gradient_to || config.preset || config.background_image_url
    );
    const containerStyle: React.CSSProperties =
        !hasConfiguredBackground && instance === 2
            ? { backgroundImage: 'linear-gradient(90deg, #EC4899 0%, #A855F7 50%, #4F46E5 100%)' }
            : highlightsBackgroundStyle(config);

    return (
        <section className="w-full py-8 border-b border-slate-100 bg-white">
            <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
                {config.card_style === 'individual' ? (
                    /* Individual Cards — each item is its own bordered card rather
                       than all items sharing one container. Takes priority over the
                       instance-based banner/bar below; only applies where an admin
                       has explicitly opted a block into this layout. */
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-5">
                        {items.slice(0, 5).map((item: any, idx: number) => {
                            const IconComp = ICON_MAP[item.icon] || Sparkles;
                            const pastel = PASTEL_THEMES[idx % PASTEL_THEMES.length];
                            const iconBg = item.icon_bg_color || pastel.bg;
                            const iconColor = item.icon_color || pastel.color;
                            return (
                                <div
                                    key={item.id || idx}
                                    className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-5 text-center shadow-xs transition hover:shadow-md"
                                >
                                    <div
                                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-transform hover:scale-105"
                                        style={{ backgroundColor: iconBg, color: iconColor }}
                                    >
                                        <IconComp className="h-5 w-5" />
                                    </div>
                                    <h4 className="text-[13px] font-bold leading-snug text-slate-900">{item.title}</h4>
                                    <p className="line-clamp-2 text-[11px] font-medium leading-snug text-slate-500">
                                        {item.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                ) : instance === 2 ? (
                    /* Instance 2 Gradient Stats Banner (Mapped to inner container box) */
                    <div className="rounded-2xl p-6 sm:p-7 text-white shadow-md overflow-hidden" style={containerStyle}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 items-center justify-center">
                            {items.slice(0, 5).map((item: any, idx: number) => {
                                const IconComp = ICON_MAP[item.icon] || Sparkles;
                                return (
                                    <div key={item.id || idx} className="flex items-center gap-3.5 text-left text-white">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-xs text-white shrink-0">
                                            <IconComp className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <h4 className="text-[14px] font-extrabold tracking-tight text-white leading-snug">
                                                {item.title}
                                            </h4>
                                            <p className="text-[11px] font-medium text-white/80 leading-snug mt-0.5">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    /* Instance 1 White Card Features Bar */
                    <div className="rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm overflow-hidden" style={containerStyle}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 items-center justify-center">
                            {items.slice(0, 5).map((item: any, idx: number) => {
                                const IconComp = ICON_MAP[item.icon] || Sparkles;
                                const pastel = PASTEL_THEMES[idx % PASTEL_THEMES.length];
                                
                                const iconBg = item.icon_bg_color || (config.icon_bg_color && config.icon_bg_color !== '#F3F0FF' 
                                    ? config.icon_bg_color 
                                    : pastel.bg);
                                const iconColor = item.icon_color || (config.icon_color && config.icon_color !== '#6C5DD3' 
                                    ? config.icon_color 
                                    : pastel.color);

                                return (
                                    <div key={item.id || idx} className="flex items-center gap-3.5 sm:gap-4 text-left">
                                        <div
                                            className="flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-full shrink-0 transition-transform hover:scale-105"
                                            style={{
                                                backgroundColor: iconBg,
                                                color: iconColor,
                                            }}
                                        >
                                            <IconComp className="h-5 w-5 md:h-6 md:w-6" />
                                        </div>
                                        <div className="flex flex-col text-left min-w-0">
                                            <h4 className="text-[13px] font-bold tracking-tight text-slate-900 leading-snug truncate">
                                                {item.title}
                                            </h4>
                                            <p className="text-[11px] font-medium text-slate-500 leading-snug mt-0.5 line-clamp-2">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
