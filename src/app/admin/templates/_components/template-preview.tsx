'use client';

import { useState } from 'react';
import { Eye, QrCode, MapPin, Phone, Share2, Camera, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    COMPONENT_LABELS,
    normaliseOrder,
    type ComponentKey,
    type EventTemplate,
} from '@/hooks/use-event-templates';

/**
 * The wizard's Live Preview panel, and the detail page's artwork.
 *
 * It renders SAMPLE content — Rahul & Priya, 24 Dec 2025 — because a template
 * has no event. Every visual decision on the left of the wizard shows up here:
 * background, overlay, fonts, border, and which components appear IN WHAT
 * ORDER. That last one is the point of the drag-and-drop list; without it the
 * ordering control has no visible consequence and reads as decorative.
 */

export type PreviewTemplate = Pick<
    EventTemplate,
    | 'name' | 'style' | 'layout_style' | 'background_type' | 'background_color'
    | 'secondary_color' | 'background_image' | 'gradient_from' | 'gradient_to'
    | 'overlay_opacity' | 'orientation' | 'primary_font' | 'secondary_font'
    | 'border_style' | 'components' | 'component_order'
>;

const SAMPLE = {
    invite_line: 'YOU ARE INVITED TO',
    occasion: 'THE WEDDING OF',
    hosts: ['Rahul', 'Priya'],
    date: '24 · DEC · 2025',
    time: 'SUNDAY, 06:00 PM',
    venue_name: 'The Grand Palace',
    venue_city: 'Chennai, Tamil Nadu',
    organizer: 'Hosted by the Verma family',
    message: 'Together with our families, we request the honour of your presence.',
    contact: '+91 98765 43210',
    footer: 'Thank you for being part of our story.',
};

/** A hex that is missing or malformed must not become `background: undefined`. */
const hex = (value: string | null | undefined, fallback: string) => {
    if (!value) return fallback;
    return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value) ? value : fallback;
};

function backgroundStyle(t: PreviewTemplate): React.CSSProperties {
    const primary = hex(t.background_color, '#FFF7F0');

    if (t.background_type === 'image' && t.background_image) {
        return {
            backgroundImage: `url(${t.background_image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        };
    }
    if (t.background_type === 'gradient') {
        return {
            backgroundImage: `linear-gradient(160deg, ${hex(t.gradient_from, primary)}, ${hex(
                t.gradient_to,
                hex(t.secondary_color, '#F3E8DA')
            )})`,
        };
    }
    return { backgroundColor: primary };
}

const BORDER_CLASS: Record<string, string> = {
    ornate: 'rounded-md border-[3px] border-double',
    corners: 'rounded-none border-2',
    arch: 'rounded-t-[999px] rounded-b-md border-2',
    'floral-top': 'rounded-md border-t-4 border-x border-b',
    none: 'border-0',
};

export function TemplatePreview({
    template,
    className,
    caption,
}: {
    template: PreviewTemplate;
    className?: string;
    caption?: string;
}) {
    const [device, setDevice] = useState<'mobile' | 'web'>('mobile');

    const order = normaliseOrder(template.component_order);
    const on = (key: ComponentKey) => !!Number(template.components?.[key] ?? 1);

    const accent = hex(template.secondary_color, '#8A6A3B');
    const ink = '#3A2C22';
    const headingFont = template.primary_font || 'Playfair Display';
    const bodyFont = template.secondary_font || 'Poppins';
    const borderClass = BORDER_CLASS[template.border_style ?? 'none'] ?? 'border-0';

    // The overlay is a separate layer rather than a filter on the background:
    // a filter would wash out the text sitting on top of it too.
    const overlay = Math.min(Math.max(Number(template.overlay_opacity) || 0, 0), 100) / 100;

    const isLandscape = template.orientation === 'landscape';
    const frameSize =
        device === 'web'
            ? 'w-full max-w-[520px] aspect-[16/10]'
            : isLandscape
                ? 'w-full max-w-[420px] aspect-[16/10]'
                : 'w-[248px] aspect-[9/16]';

    /** One block per component, rendered in `component_order`. */
    const blocks: Record<ComponentKey, React.ReactNode> = {
        event_title: (
            <div className="text-center">
                <div
                    className="text-[8px] font-semibold uppercase tracking-[0.22em]"
                    style={{ color: accent, fontFamily: bodyFont }}
                >
                    {SAMPLE.invite_line}
                </div>
                <div
                    className="text-[8px] font-semibold uppercase tracking-[0.22em]"
                    style={{ color: accent, fontFamily: bodyFont }}
                >
                    {SAMPLE.occasion}
                </div>
            </div>
        ),
        host_names: (
            <div className="text-center leading-none" style={{ fontFamily: headingFont, color: ink }}>
                <div className="text-[26px] italic">{SAMPLE.hosts[0]}</div>
                <div className="my-0.5 text-[11px]" style={{ color: accent }}>
                    &amp;
                </div>
                <div className="text-[26px] italic">{SAMPLE.hosts[1]}</div>
            </div>
        ),
        date_time: (
            <div className="text-center" style={{ fontFamily: bodyFont, color: ink }}>
                <div className="text-[11px] font-bold tracking-[0.14em]">{SAMPLE.date}</div>
                <div className="text-[8px] tracking-[0.12em] opacity-80">{SAMPLE.time}</div>
            </div>
        ),
        venue: (
            <div className="text-center" style={{ fontFamily: bodyFont, color: ink }}>
                <div className="text-[10px] font-semibold">{SAMPLE.venue_name}</div>
                <div className="flex items-center justify-center gap-1 text-[8px] opacity-80">
                    <MapPin className="h-2.5 w-2.5" /> {SAMPLE.venue_city}
                </div>
            </div>
        ),
        event_qr_code: (
            <div className="flex flex-col items-center gap-0.5">
                <div
                    className="flex h-14 w-14 items-center justify-center rounded-sm border bg-white"
                    style={{ borderColor: accent }}
                >
                    <QrCode className="h-11 w-11" style={{ color: ink }} />
                </div>
                <div
                    className="rounded-sm border px-1.5 py-px text-[6px] font-semibold"
                    style={{ borderColor: accent, color: accent, fontFamily: bodyFont }}
                >
                    Event QR Code
                </div>
            </div>
        ),
        organizer: (
            <div className="text-center text-[8px] opacity-80" style={{ fontFamily: bodyFont, color: ink }}>
                {SAMPLE.organizer}
            </div>
        ),
        event_photos: (
            <div className="flex items-center justify-center gap-1">
                {[0, 1, 2].map((i) => (
                    <span
                        key={i}
                        className="flex h-7 w-7 items-center justify-center rounded-sm border bg-white/60"
                        style={{ borderColor: accent }}
                    >
                        <Camera className="h-3 w-3" style={{ color: accent }} />
                    </span>
                ))}
            </div>
        ),
        contact_details: (
            <div
                className="flex items-center justify-center gap-1 text-[8px] opacity-80"
                style={{ fontFamily: bodyFont, color: ink }}
            >
                <Phone className="h-2.5 w-2.5" /> {SAMPLE.contact}
            </div>
        ),
        invitation_message: (
            <div
                className="px-3 text-center text-[8px] italic leading-snug opacity-90"
                style={{ fontFamily: bodyFont, color: ink }}
            >
                {SAMPLE.message}
            </div>
        ),
        social_icons: (
            <div className="flex items-center justify-center gap-1.5">
                {[0, 1, 2].map((i) => (
                    <span
                        key={i}
                        className="flex h-4 w-4 items-center justify-center rounded-full border"
                        style={{ borderColor: accent }}
                    >
                        <Share2 className="h-2 w-2" style={{ color: accent }} />
                    </span>
                ))}
            </div>
        ),
        footer_note: (
            <div
                className="text-center text-[7px] tracking-wide opacity-70"
                style={{ fontFamily: bodyFont, color: ink }}
            >
                {SAMPLE.footer}
            </div>
        ),
        decoration_elements: (
            <div className="flex items-center justify-center gap-1.5" style={{ color: accent }}>
                <Sparkles className="h-3 w-3" />
                <span className="h-px w-8" style={{ backgroundColor: accent }} />
                <Sparkles className="h-3 w-3" />
            </div>
        ),
    };

    const visible = order.filter(on);

    return (
        <div className={cn('space-y-3', className)}>
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">Live Preview</span>
                </div>
                <div className="flex rounded-md border border-border p-0.5">
                    {(['mobile', 'web'] as const).map((d) => (
                        <Button
                            key={d}
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setDevice(d)}
                            className={cn(
                                'h-7 px-3 text-xs capitalize',
                                device === d && 'bg-primary/10 font-semibold text-primary'
                            )}
                        >
                            {d}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="flex justify-center">
                <div
                    className={cn(
                        'relative overflow-hidden shadow-md',
                        frameSize,
                        borderClass,
                        template.border_style && template.border_style !== 'none' ? 'border-solid' : ''
                    )}
                    style={{
                        ...backgroundStyle(template),
                        borderColor: accent,
                    }}
                >
                    {overlay > 0 && (
                        <div
                            className="pointer-events-none absolute inset-0"
                            style={{ backgroundColor: `rgba(0,0,0,${overlay})` }}
                        />
                    )}

                    <div className="relative flex h-full w-full flex-col items-center justify-center gap-1.5 overflow-hidden p-3">
                        {visible.length === 0 ? (
                            <div className="px-4 text-center text-[10px] text-muted-foreground">
                                Every component is switched off, so this invitation would render empty.
                            </div>
                        ) : (
                            visible.map((key) => <div key={key}>{blocks[key]}</div>)
                        )}
                    </div>
                </div>
            </div>

            <p className="text-center text-[11px] leading-snug text-muted-foreground">
                {caption ??
                    `This is a preview of how the template will look on ${device === 'web' ? 'web' : 'mobile'}.`}
            </p>

            {visible.length > 0 && (
                <p className="text-center text-[10px] text-muted-foreground">
                    Showing {visible.length} of {order.length} components ·{' '}
                    {order.filter((k) => !on(k)).length > 0
                        ? `${order.filter((k) => !on(k)).map((k) => COMPONENT_LABELS[k]).join(', ')} hidden`
                        : 'all components on'}
                </p>
            )}
        </div>
    );
}
