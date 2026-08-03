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

    // Theme Color Resolvers
    const themeBrand = theme?.primaryButton || '#4F46E5';
    const themeText = theme?.primaryText || '#1F2937';
    const themeSubtext = theme?.secondaryText || '#6B7280';

    // Background calculation
    let bgStyle: React.CSSProperties = {};
    if (config.preset === 'gradient-1') {
        bgStyle = { backgroundImage: 'linear-gradient(135deg, #E0F2FE 0%, #F0FDFA 100%)' };
    } else if (config.preset === 'gradient-2') {
        bgStyle = { backgroundImage: 'linear-gradient(135deg, #FCE7F3 0%, #FFF1F2 100%)' };
    } else if (config.preset === 'gradient-3') {
        bgStyle = { backgroundImage: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)' };
    } else if (config.background_type === 'gradient') {
        bgStyle = { backgroundImage: 'linear-gradient(135deg, #F3F0FF 0%, #FFFFFF 100%)' };
    } else if (config.background_type === 'image' && config.background_image_url) {
        bgStyle = {
            backgroundImage: `url(${config.background_image_url})`,
            backgroundSize: config.image_size || 'cover',
            backgroundPosition: config.image_position || 'center',
        };
    } else {
        bgStyle = { backgroundColor: config.background_color || theme?.sectionBg || '#FFFFFF' };
    }

    // Icon & Text Colors
    const rawBgColor = config.icon_bg_color || `${themeBrand}18`;
    const rawIconColor = config.icon_color || themeBrand;

    // Ensure icon text color contrasts with icon background
    const iconBgColor = rawBgColor;
    const iconColor = (iconStyle === 'filled' && rawIconColor.toLowerCase() === rawBgColor.toLowerCase())
        ? (rawBgColor.toLowerCase() === '#ffffff' || rawBgColor.toLowerCase() === '#f3f0ff' ? themeBrand : '#FFFFFF')
        : rawIconColor;

    const titleColor = config.title_color || themeText;
    const descriptionColor = config.description_color || themeSubtext;

    // Alignment & Shape
    const alignClass = config.alignment === 'left' ? 'items-start text-left' : config.alignment === 'right' ? 'items-end text-right' : 'items-center text-center';
    const shapeClass = config.icon_shape === 'square' ? 'rounded-none' : config.icon_shape === 'rounded' ? 'rounded-xl' : 'rounded-full';

    return (
        <section className="w-full py-12 border-b" style={bgStyle}>
            <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
                <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-${Math.min(config.items_per_row || 6, 6)} gap-6`}>
                    {items.map((item: any, idx: number) => {
                        const IconComp = ICON_MAP[item.icon] || Sparkles;
                        return (
                            <div key={item.id || idx} className={`flex flex-col space-y-2 p-2 ${alignClass}`}>
                                <div
                                    className={`flex h-12 w-12 items-center justify-center transition-transform hover:scale-105 ${shapeClass}`}
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
