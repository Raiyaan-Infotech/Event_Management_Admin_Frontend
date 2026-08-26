'use client';

import { useLayoutEffect, useRef, useState } from 'react';
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
    | 'gradient_via' | 'image_position' | 'image_scale' | 'background_position'
    | 'image_size' | 'overlay_enabled' | 'overlay_color'
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

/**
 * `#RRGGBB` to the `r,g,b` triple an rgba() needs.
 *
 * The overlay has to stay an rgba layer rather than a solid colour plus an
 * `opacity` — opacity on the element would fade the decorations sitting inside
 * it too. Returns null for anything unparseable so the caller can fall back to
 * the black the preview has always used.
 */
const hexToRgb = (value: string | null | undefined): string | null => {
    if (!value) return null;
    const m = /^#([0-9a-fA-F]{6})$/.exec(value.trim());
    if (!m) return null;
    const n = parseInt(m[1], 16);
    return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
};

/**
 * The layout-style / background-type pairs whose FORM shows the "Overlay on
 * Background" switch.
 *
 * Mirrors STEP2_FIELDS deliberately rather than importing it: this component is
 * also rendered by the client portal, which has no business pulling in the
 * admin wizard's field matrix. Kept to the one fact the preview needs.
 */
const OVERLAY_SWITCH_STYLES = new Set([
    'elegant:custom',
    'minimal:custom',
    'traditional:custom',
    'modern:custom',
]);

/** `#RRGGBB` to a numeric triple. Null for anything unparseable. */
const rgbTriple = (value: string | null | undefined): [number, number, number] | null => {
    const s = hexToRgb(value);
    if (!s) return null;
    const [r, g, b] = s.split(',').map(Number);
    return [r, g, b];
};

/** Alpha-composite `fg` over `bg`, the way the overlay layer actually paints. */
const composite = (
    fg: [number, number, number],
    bg: [number, number, number],
    alpha: number
): [number, number, number] =>
    [0, 1, 2].map((i) => Math.round(fg[i] * alpha + bg[i] * (1 - alpha))) as [number, number, number];

/**
 * WCAG relative luminance. Used only to decide light-vs-dark text, so the
 * gamma-correct version is worth it — the naive (r+g+b)/3 average calls
 * mid-blues light and puts dark text on them.
 */
const luminance = ([r, g, b]: [number, number, number]): number => {
    const f = (c: number) => {
        const v = c / 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

/** #RRGGBB -> HSL, so a colour can be re-lightened without losing its hue. */
const rgbToHsl = ([r, g, b]: [number, number, number]): [number, number, number] => {
    const R = r / 255, G = g / 255, B = b / 255;
    const max = Math.max(R, G, B), min = Math.min(R, G, B);
    const l = (max + min) / 2;
    if (max === min) return [0, 0, l];
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    const h =
        max === R ? ((G - B) / d + (G < B ? 6 : 0))
        : max === G ? (B - R) / d + 2
        : (R - G) / d + 4;
    return [h / 6, s, l];
};

const hslToRgb = ([h, s, l]: [number, number, number]): [number, number, number] => {
    if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const f = (t: number) => {
        let T = t; if (T < 0) T += 1; if (T > 1) T -= 1;
        if (T < 1 / 6) return p + (q - p) * 6 * T;
        if (T < 1 / 2) return q;
        if (T < 2 / 3) return p + (q - p) * (2 / 3 - T) * 6;
        return p;
    };
    return [f(h + 1 / 3), f(h), f(h - 1 / 3)].map((v) => Math.round(v * 255)) as [number, number, number];
};

/**
 * The admin's accent colour, adjusted only as far as it must be to stay legible
 * on the backdrop it is drawn against.
 *
 * `secondary_color` is used for the invite line, the ampersand, the QR label and
 * every small stroke — and it is a colour the admin chose freely, so nothing
 * stops it landing near the background. A pale khaki accent on an orange card
 * measured 1.4:1: technically rendered, effectively invisible.
 *
 * HUE AND SATURATION ARE PRESERVED. Only lightness moves, and only until the
 * target ratio is met, so the result still reads as the colour that was picked
 * rather than being replaced by a computed one. If neither direction can reach
 * the target the closest attempt wins — better a nudged colour than an unusable
 * one, and a flat swap to black would throw the choice away entirely.
 */
const readableOn = (
    colour: [number, number, number],
    backdrop: [number, number, number],
    target = 4.5
): [number, number, number] => {
    if (contrastRatio(colour, backdrop) >= target) return colour;

    const [h, sat] = rgbToHsl(colour);
    let best = colour;
    let bestRatio = contrastRatio(colour, backdrop);

    // Walk lightness outward in both directions and keep the first value that
    // clears the target, or the strongest seen if none does.
    for (let step = 1; step <= 20; step += 1) {
        for (const l of [0.5 - step * 0.025, 0.5 + step * 0.025]) {
            if (l < 0 || l > 1) continue;
            const candidate = hslToRgb([h, sat, l]);
            const ratio = contrastRatio(candidate, backdrop);
            if (ratio >= target) return candidate;
            if (ratio > bestRatio) { bestRatio = ratio; best = candidate; }
        }
    }
    return best;
};

/** The two inks the invitation is ever drawn in. */
const INK_DARK: [number, number, number] = [58, 44, 34];
const INK_LIGHT: [number, number, number] = [247, 242, 234];

const toHexString = ([r, g, b]: [number, number, number]) =>
    `#${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')}`;

/** WCAG contrast ratio between two colours. Always >= 1. */
const contrastRatio = (a: [number, number, number], b: [number, number, number]) => {
    const la = luminance(a);
    const lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
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
        /**
         * Image and Custom read DIFFERENT position columns.
         *
         * They are separate controls on separate tabs, so a template that has
         * been set up as both must remember both — sharing one column would
         * mean nudging the custom design also moved the photo background.
         */
        const isCustom = t.background_type === 'custom';
        const position = isCustom ? t.background_position : t.image_position;

        /**
         * Custom's Image Size is a percentage; Image's Scale is a CSS keyword.
         * A percentage only means anything for the custom design, so `cover`
         * stays the fallback everywhere else — which is what the preview drew
         * before either control existed.
         */
        const size =
            isCustom && Number(t.image_size) && Number(t.image_size) !== 100
                ? `${Number(t.image_size)}%`
                : (t.image_scale ?? 'cover');

        return {
            backgroundImage: `url(${t.background_image})`,
            backgroundSize: size,
            backgroundPosition: (position ?? 'center').replace(/-/g, ' '),
            backgroundRepeat: 'no-repeat',
        };
    }
    if (t.background_type === 'gradient') {
        const from = hex(t.gradient_from, primary);
        const to = hex(t.gradient_to, hex(t.secondary_color, '#F3E8DA'));

        // The third stop is optional. Omitted entirely when unset, rather than
        // defaulted to a colour — a two-stop gradient and a three-stop gradient
        // whose middle repeats an end are not the same picture.
        const stops = [from, t.gradient_via ? hex(t.gradient_via, from) : null, to]
            .filter(Boolean)
            .join(', ');

        if (t.gradient_type === 'radial') {
            // `circle at center` rather than the default ellipse: an ellipse
            // stretches with the card, so the same template looked like a
            // different gradient in portrait and landscape.
            return { backgroundImage: `radial-gradient(circle at center, ${stops})` };
        }

        // Falls back to 180deg (straight down), which is what every gradient
        // template saved before the Direction control existed already looks like.
        const deg =
            GRADIENT_DIRECTIONS.find((d) => d.value === t.gradient_direction)?.deg ?? 180;
        return { backgroundImage: `linear-gradient(${deg}deg, ${stops})` };
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

    /**
     * Scale the invitation down until it fits the card.
     *
     * A real invitation is a fixed canvas — 1080x1920 — and everything on it is
     * sized relative to that canvas. The preview was instead laying twelve
     * components out at fixed pixel sizes inside a 248px card and centring them,
     * so as soon as the content was taller than the card it overflowed EQUALLY
     * top and bottom: the invite line disappeared off the top edge, the footer
     * off the bottom, and the frame's rule appeared to cut through the middle of
     * the text. Widening the safe area only made it worse, because it left less
     * room for the same content.
     *
     * Measuring and scaling is what a fixed-canvas design actually needs. A
     * transform does not affect layout, so `scrollHeight` on the inner element
     * stays the UNSCALED height and the measurement cannot feed back into
     * itself.
     */
    const boxRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const [fit, setFit] = useState(1);

    const order = normaliseOrder(template.component_order);
    const on = (key: ComponentKey) => !!Number(template.components?.[key] ?? 1);

    const accent = hex(template.secondary_color, '#8A6A3B');
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

    /**
     * The safe area for content, as a PERCENTAGE of the card.
     *
     * The frame is artwork stretched over the whole card, so its inner rule sits
     * at a fixed FRACTION of the card — 7.8% in horizontally and 5.9% vertically
     * for the deepest of the seeded frames. The content inset was a fixed `p-5`
     * (20px), which is a different fraction at every card size: 8.1% wide on a
     * 248px mobile card but only 3.8% on a 520px web one. The two agreed nowhere,
     * so applying a frame pushed the rule straight through the text.
     *
     * ⚠ This is applied by ABSOLUTE INSETS, not padding, on purpose. CSS
     * percentage padding resolves against the containing block's WIDTH on all
     * four sides — `padding-top: 8%` on a 9:16 card is 8% of the *width*, which
     * is roughly half what it should be. `top`/`bottom` percentages resolve
     * against height, which is the behaviour this needs.
     */
    const hasTopArt = placed('top').length > 0 || placed('corner').length > 0;
    const hasBottomArt = placed('bottom').length > 0 || placed('corner').length > 0;

    // Frame values clear the deepest rule with room to spare, so a descender or
    // an italic overhang does not touch it.
    const safeX = frameUrl ? 11 : 6;
    const safeTop = Math.max(frameUrl ? 9 : 4, hasTopArt ? 10 : 0);
    const safeBottom = Math.max(frameUrl ? 9 : 4, hasBottomArt ? 10 : 0);

    // The overlay is a separate layer rather than a filter on the background:
    // a filter would wash out the text sitting on top of it too.
    const overlay = Math.min(Math.max(Number(template.overlay_opacity) || 0, 0), 100) / 100;

    /**
     * The tint colour, and whether it is drawn at all.
     *
     * `overlay_enabled` gates only the styles whose form HAS the switch. On
     * every other layout style the column stays false while the slider is the
     * only control shown — so treating false as "off" everywhere would silently
     * disable the overlay on Classic, where it has always worked. The switch is
     * therefore read as an override that can only ever turn the tint OFF when a
     * form actually offered it.
     */
    const hasOverlaySwitch = OVERLAY_SWITCH_STYLES.has(
        `${template.layout_style ?? 'classic'}:${template.background_type}`
    );
    const overlayOff = template.overlay_enabled === false && hasOverlaySwitch;
    const overlayTint = hexToRgb(template.overlay_color) ?? '0,0,0';
    const overlayDrawn = overlay > 0 && !overlayOff;

    /**
     * The invitation's text colour, derived from what it actually sits on.
     *
     * This was hardcoded to a dark brown, which is right on ivory and illegible
     * on everything else — a deep-purple Elegant template, a near-black Modern
     * one and a deep-red Traditional one all rendered dark-brown-on-dark. The
     * overlay makes it worse, because it darkens the backdrop further without
     * the text knowing.
     *
     * So: work out the backdrop, composite the overlay onto it exactly as the
     * layer below paints it, and pick the ink from the result's luminance.
     */
    const backdrop = ((): [number, number, number] => {
        const base = rgbTriple(hex(template.background_color, '#FFF7F0')) ?? [255, 247, 240];

        if (template.background_type === 'gradient') {
            // Average the stops. A gradient has no single backdrop, and the
            // midpoint is what most of the text sits over.
            const stops = [template.gradient_from, template.gradient_via, template.gradient_to]
                .map((c) => rgbTriple(c ?? null))
                .filter(Boolean) as [number, number, number][];
            if (stops.length) {
                return [0, 1, 2].map((i) =>
                    Math.round(stops.reduce((sum, st) => sum + st[i], 0) / stops.length)
                ) as [number, number, number];
            }
        }

        /**
         * For a photo we cannot know the pixels, and guessing wrong is worse
         * than not guessing: assume a mid tone so the decision falls to the
         * overlay, which is the control that exists precisely to make text
         * readable over an image.
         */
        if (
            (template.background_type === 'image' || template.background_type === 'custom') &&
            template.background_image
        ) {
            return template.background_color ? base : [128, 128, 128];
        }

        return base;
    })();

    const tintTriple = overlayTint.split(',').map(Number) as [number, number, number];
    const effective = overlayDrawn ? composite(tintTriple, backdrop, overlay) : backdrop;

    /**
     * Pick whichever ink actually contrasts more, rather than thresholding the
     * luminance.
     *
     * A threshold gets mid-tones wrong in both directions: at L≈0.31 a
     * "that's light-ish, use light text" rule produced 2.6:1 where the dark ink
     * would have given 4.4:1. Comparing the two candidates is the same amount of
     * work and cannot be miscalibrated.
     *
     * Some mid-tone backdrops cannot reach 4.5:1 with EITHER ink. That is a
     * property of the colour, not a bug to code around — the Overlay / Shade
     * control is the thing that fixes it, which is what it is for.
     */
    const ink = toHexString(
        [INK_DARK, INK_LIGHT]
            .map((candidate) => ({ candidate, ratio: contrastRatio(candidate, effective) }))
            .sort((a, b) => b.ratio - a.ratio)[0].candidate
    );

    /**
     * Two accents, deliberately.
     *
     * `accent` stays exactly as picked for the LARGE decorative strokes — the
     * card's own border, where being a little soft is a design choice and where
     * shifting the colour would visibly disagree with the swatch in the form.
     *
     * `accentInk` is the same colour pushed only as far as legibility requires,
     * for anything carrying WORDS: the invite line, the ampersand, the QR label.
     * Those have to be readable before they are on-brand.
     */
    const accentRgb = rgbTriple(accent) ?? [138, 106, 59];
    const accentInk = toHexString(readableOn(accentRgb, effective));
    // Small strokes need to be seen but not read — 3:1, the WCAG bar for
    // non-text UI, rather than the 4.5:1 body-text bar.
    const accentLine = toHexString(readableOn(accentRgb, effective, 3));

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
                    style={{ color: accentInk, fontFamily: bodyFont }}
                >
                    {SAMPLE.invite_line}
                </div>
                <div
                    className="text-[8px] font-semibold uppercase tracking-[0.22em]"
                    style={{ color: accentInk, fontFamily: bodyFont }}
                >
                    {SAMPLE.occasion}
                </div>
            </div>
        ),
        host_names: (
            <div className="text-center leading-none" style={{ fontFamily: headingFont, color: ink }}>
                <div className="text-[26px] italic">{SAMPLE.hosts[0]}</div>
                <div className="my-0.5 text-[11px]" style={{ color: accentInk }}>
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
                    style={{ borderColor: accentLine }}
                >
                    <QrCode className="h-11 w-11" style={{ color: ink }} />
                </div>
                <div
                    className="rounded-sm border px-1.5 py-px text-[6px] font-semibold"
                    style={{ borderColor: accentLine, color: accentInk, fontFamily: bodyFont }}
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
                        style={{ borderColor: accentLine }}
                    >
                        <Camera className="h-3 w-3" style={{ color: accentLine }} />
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
                        style={{ borderColor: accentLine }}
                    >
                        <Share2 className="h-2 w-2" style={{ color: accentLine }} />
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
            <div className="flex items-center justify-center gap-1.5" style={{ color: accentLine }}>
                <Sparkles className="h-3 w-3" />
                <span className="h-px w-8" style={{ backgroundColor: accentLine }} />
                <Sparkles className="h-3 w-3" />
            </div>
        ),
    };

    const visible = order.filter(on);

    /**
     * Recompute the fit whenever anything that changes the content's natural
     * size changes — which components are on, the device tab, the orientation,
     * the fonts, and the card resizing under a responsive layout.
     */
    useLayoutEffect(() => {
        const box = boxRef.current;
        const content = contentRef.current;
        if (!box || !content) return;

        const measure = () => {
            const availH = box.clientHeight;
            const availW = box.clientWidth;
            // scrollHeight/Width are pre-transform, so this is the natural size
            // even while a scale is already applied.
            const naturalH = content.scrollHeight;
            const naturalW = content.scrollWidth;
            if (!availH || !naturalH) return;

            const ratio = Math.min(availH / naturalH, availW / naturalW, 1);
            // Never shrink past legibility. Below this the preview stops being
            // useful and the honest answer is that too much is switched on.
            setFit(Math.max(ratio, 0.45));
        };

        measure();
        // Both elements are observed. The box catches a responsive resize; the
        // content catches a reflow the deps cannot see, such as a web font
        // finishing loading and changing every line height at once.
        //
        // This cannot loop: a CSS transform does not change either element's
        // layout box, so applying the scale produces no resize notification.
        const ro = new ResizeObserver(measure);
        ro.observe(box);
        ro.observe(content);
        return () => ro.disconnect();
    }, [
        visible.join(','),
        device,
        template.orientation,
        template.primary_font,
        template.secondary_font,
        safeX,
        safeTop,
        safeBottom,
    ]);

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
                    // Selected by the templates detail page's PNG export — the
                    // card ONLY, not the device toggle or caption around it.
                    data-invitation-card
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
                    {overlay > 0 && !overlayOff && (
                        <div
                            className="pointer-events-none absolute inset-0"
                            style={{ backgroundColor: `rgba(${overlayTint},${overlay})` }}
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
                    {/*
                      `divider` is a real, seeded placement — a decoration is
                      genuinely selectable as this type — but had no render
                      branch at all: picking one ticked the checkbox, saved
                      cleanly, and then drew nothing.

                      NOT full width, unlike `top`/`bottom`. A divider is a short
                      centred rule; stretched edge to edge its end ornaments land
                      out at the margins and read as two unrelated shapes floating
                      either side of the content, which is exactly how it looked
                      when it was first drawn that way.
                    */}
                    {placed('divider').slice(0, 1).map((d) => (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img key={d.id} src={d.file_url!} alt=""
                            className="pointer-events-none absolute left-1/2 top-1/2 w-2/5 -translate-x-1/2 -translate-y-1/2 opacity-70" />
                    ))}

                    {/* The frame is drawn LAST, over the content: it occupies the
                        margin, and a border under the text would be half-hidden by
                        whatever component happens to reach the edge. */}
                    {frameUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={frameUrl} alt=""
                            className="pointer-events-none absolute inset-0 z-10 h-full w-full object-fill" />
                    ) : null}

                    {/* The safe area — see the note on safeX/safeTop above. It
                        keeps content clear of BOTH the frame's inner rule and any
                        edge decoration, at every card size. */}
                    <div
                        ref={boxRef}
                        className="absolute flex items-center justify-center overflow-hidden"
                        style={{
                            left: `${safeX}%`,
                            right: `${safeX}%`,
                            top: `${safeTop}%`,
                            bottom: `${safeBottom}%`,
                        }}
                    >
                        {/* `contentRef` measures the UNSCALED layout; the scale
                            is applied here so the measurement never chases its
                            own result. `w-full` keeps the natural width equal to
                            the safe area, so only genuine overflow shrinks it. */}
                        <div
                            ref={contentRef}
                            className="flex w-full flex-col items-center justify-center gap-1.5"
                            style={{ transform: `scale(${fit})`, transformOrigin: 'center center' }}
                        >
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
