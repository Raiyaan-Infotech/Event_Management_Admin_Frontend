'use client';

import { useState } from 'react';
import { Eye, QrCode, MapPin, Phone, Share2, Camera, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    COMPONENT_LABELS,
    GRADIENT_DIRECTIONS,
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
    | 'gradient_type' | 'gradient_direction' | 'image_shape' | 'corner_radius'
> & {
    /**
     * The chosen Frame Style's artwork, drawn OVER the whole card.
     *
     * When present it replaces the CSS `border_style` entirely — a real frame
     * occupies the margin the CSS border would otherwise sit in, and drawing
     * both gives a double edge that neither control asked for.
     */
    frameUrl?: string | null;
    /**
     * The chosen Decorations, resolved. Placed by their `type`.
     *
     * Named `decorationItems`, matching the backend, and NOT `decorations` —
     * that name is already taken on EventTemplate by the legacy string list, so
     * reusing it would make the whole row unassignable to this type.
     */
    decorationItems?: Array<{ id: number; name: string; type: string; file_url: string | null }>;
};

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

    /**
     * `custom` paints the uploaded design too, not just `image`.
     *
     * The Custom tab's "Upload Design" writes to the same `background_image`
     * column — it is the same picture, masked to a shape. Without `custom` here
     * the upload would succeed, the file would reach S3, and the preview would
     * show a flat colour: exactly the bug that made the uploader read as broken
     * the first time round.
     */
    if ((t.background_type === 'image' || t.background_type === 'custom') && t.background_image) {
        return {
            backgroundImage: `url(${t.background_image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        };
    }
    if (t.background_type === 'gradient') {
        const from = hex(t.gradient_from, primary);
        const to = hex(t.gradient_to, hex(t.secondary_color, '#F3E8DA'));

        if (t.gradient_type === 'radial') {
            // `circle at center` rather than the default ellipse: an ellipse
            // stretches with the card, so the same template looked like a
            // different gradient in portrait and landscape.
            return { backgroundImage: `radial-gradient(circle at center, ${from}, ${to})` };
        }

        // Falls back to 180deg (straight down), which is what every gradient
        // template saved before the Direction control existed already looks like.
        const deg =
            GRADIENT_DIRECTIONS.find((d) => d.value === t.gradient_direction)?.deg ?? 180;
        return { backgroundImage: `linear-gradient(${deg}deg, ${from}, ${to})` };
    }
    return { backgroundColor: primary };
}

/**
 * The Custom background's Image Shape, as CSS on the card.
 *
 * Circle and heart are clip-paths; rectangle and square are a corner radius.
 * Arch is a border-radius rather than a clip-path so the frame artwork drawn on
 * top still follows the same silhouette — a clip-path would cut the frame off
 * at a different curve and the two edges would disagree.
 *
 * Only applied for `custom`: the shape control only appears on that tab, and
 * masking a plain colour background to a heart is not something any other tab
 * offers.
 */
function shapeStyle(t: PreviewTemplate): React.CSSProperties {
    if (t.background_type !== 'custom') return {};

    const radius = `${Math.min(Math.max(Number(t.corner_radius) || 0, 0), 100) / 2}%`;

    switch (t.image_shape) {
        case 'circle':
            return { borderRadius: '50%' };
        case 'heart':
            /**
             * Referenced, not inlined.
             *
             * CSS `clip-path: path()` measures in PIXELS, so a heart authored on
             * a 100-unit box renders as a 100px heart in the corner of a 248px
             * card. The SVG clipPath below uses `objectBoundingBox` units, which
             * scale to whatever the card actually is.
             */
            return { clipPath: 'url(#tplHeartClip)' };
        case 'arch':
            return { borderRadius: `999px 999px ${radius} ${radius}` };
        case 'square':
        case 'rectangle':
        default:
            return { borderRadius: radius };
    }
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
    const frameUrl = template.frameUrl || null;
    // Real artwork wins over the CSS fallback — see the note on PreviewTemplate.
    const borderClass = frameUrl
        ? 'border-0'
        : (BORDER_CLASS[template.border_style ?? 'none'] ?? 'border-0');

    /**
     * Where each decoration sits.
     *
     * `type` is a PLACEMENT, which is exactly what this needs — a corner goes in
     * a corner, a top spans the top edge. Anything unplaced (`motif`) is centred
     * behind the content at low opacity rather than dropped, so choosing it still
     * has a visible consequence.
     */
    const decorations = template.decorationItems ?? [];
    const placed = (type: string) => decorations.filter((d) => d.type === type && d.file_url);

    // The overlay is a separate layer rather than a filter on the background:
    // a filter would wash out the text sitting on top of it too.
    const overlay = Math.min(Math.max(Number(template.overlay_opacity) || 0, 0), 100) / 100;

    const isLandscape = template.orientation === 'landscape';

    // A "square" or "circle" shape has to make the CARD square, or the mask is
    // drawn on a 9:16 box and both come out as ovals.
    const forcedSquare =
        template.background_type === 'custom' &&
        (template.image_shape === 'square' || template.image_shape === 'circle');

    const frameSize = forcedSquare
        ? 'w-[300px] aspect-square'
        : device === 'web'
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

            {/* Zero-size and aria-hidden: this exists only to be referenced by
                `clip-path` above, and must never take layout space. */}
            <svg width="0" height="0" aria-hidden className="absolute">
                <defs>
                    <clipPath id="tplHeartClip" clipPathUnits="objectBoundingBox">
                        <path d="M0.5,0.9 C0.5,0.9 0.04,0.62 0.04,0.33 C0.04,0.14 0.18,0.04 0.31,0.04
                                 C0.41,0.04 0.47,0.1 0.5,0.17 C0.53,0.1 0.59,0.04 0.69,0.04
                                 C0.82,0.04 0.96,0.14 0.96,0.33 C0.96,0.62 0.5,0.9 0.5,0.9 Z" />
                    </clipPath>
                </defs>
            </svg>

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
                        ...shapeStyle(template),
                        borderColor: accent,
                    }}
                >
                    {overlay > 0 && (
                        <div
                            className="pointer-events-none absolute inset-0"
                            style={{ backgroundColor: `rgba(0,0,0,${overlay})` }}
                        />
                    )}

                    {/* Decorations sit UNDER the content: an ornament that covers
                        the couple's names is not a decoration. */}
                    {placed('motif').slice(0, 1).map((d) => (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img key={d.id} src={d.file_url!} alt=""
                            className="pointer-events-none absolute left-1/2 top-1/2 w-2/3 -translate-x-1/2 -translate-y-1/2 opacity-20" />
                    ))}
                    {placed('top').slice(0, 1).map((d) => (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img key={d.id} src={d.file_url!} alt=""
                            className="pointer-events-none absolute inset-x-0 top-0 w-full" />
                    ))}
                    {placed('bottom').slice(0, 1).map((d) => (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img key={d.id} src={d.file_url!} alt=""
                            className="pointer-events-none absolute inset-x-0 bottom-0 w-full" />
                    ))}
                    {/* Up to four corners, mirrored so one uploaded corner fills
                        every corner rather than needing four files. */}
                    {placed('corner').slice(0, 1).map((d) =>
                        ([
                            'left-0 top-0',
                            'right-0 top-0 -scale-x-100',
                            'left-0 bottom-0 -scale-y-100',
                            'right-0 bottom-0 -scale-100',
                        ] as const).map((pos) => (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img key={`${d.id}-${pos}`} src={d.file_url!} alt=""
                                className={cn('pointer-events-none absolute w-2/5', pos)} />
                        ))
                    )}
                    {placed('ornament').slice(0, 1).map((d) => (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img key={d.id} src={d.file_url!} alt=""
                            className="pointer-events-none absolute inset-x-0 top-0 mx-auto w-3/5" />
                    ))}

                    {/* The frame is drawn LAST, over the content: it occupies the
                        margin, and a border under the text would be half-hidden by
                        whatever component happens to reach the edge. */}
                    {frameUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={frameUrl} alt=""
                            className="pointer-events-none absolute inset-0 z-10 h-full w-full object-fill" />
                    ) : null}

                    <div className="relative flex h-full w-full flex-col items-center justify-center gap-1.5 overflow-hidden p-5">
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
