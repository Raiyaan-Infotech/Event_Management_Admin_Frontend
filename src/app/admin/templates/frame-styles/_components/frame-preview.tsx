'use client';

import { useState } from 'react';
import { Eye, Smartphone, Monitor, QrCode, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { FrameLayout } from '@/hooks/use-frame-styles';

/**
 * The Upload Frame Style screen's Preview panel.
 *
 * It draws SAMPLE invitation content — Rahul & Priya — with the uploaded file
 * laid over it as the frame, because a frame style has no event. The point is
 * that the upload has a visible consequence: without it the drop zone succeeds,
 * the file reaches S3, and nothing on screen changes, which is exactly how the
 * template uploader came to read as broken (§234).
 *
 * ── THE FRAME IS AN OVERLAY, NOT A BORDER ────────────────────────────────────
 * It is absolutely positioned over the whole card with `object-fill`, because a
 * frame SVG is drawn to occupy the full rectangle — its corners belong in the
 * corners. `object-contain` would letterbox it and leave the card's own edges
 * showing through, `cover` would crop the corner ornament off entirely.
 *
 * `pointer-events-none` so the artwork never eats a click meant for the card.
 */

const SAMPLE = {
    invite_line: 'TOGETHER WITH THEIR FAMILIES',
    hosts: ['Rahul', 'Priya'],
    sub: 'INVITE YOU TO CELEBRATE THEIR WEDDING',
    day: 'SATURDAY',
    date: '24',
    month: 'MAY 2025',
    time: '6:30 PM ONWARDS',
    venue_name: 'The Grand Imperia',
    venue_line: 'Banquet & Convention Centre',
    venue_city: 'Koramangala, Bengaluru - 560034',
    qr_note: 'SCAN TO VIEW DETAILS',
};

export function FramePreview({
    fileUrl,
    layouts,
    className,
}: {
    fileUrl: string | null;
    /** Which shapes this frame claims to support — the device toggle honours it. */
    layouts: FrameLayout[];
    className?: string;
}) {
    const [device, setDevice] = useState<'mobile' | 'web'>('mobile');

    // Web renders landscape, mobile renders portrait. A frame that does not
    // claim a shape still previews in it — the toggle is for LOOKING, and
    // refusing to draw would leave a blank panel with no explanation. The note
    // underneath says so instead.
    const shape: FrameLayout = device === 'web' ? 'landscape' : 'portrait';
    const unsupported = !layouts.includes(shape);

    return (
        <div className={cn('space-y-3', className)}>
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">Preview</span>
                </div>
                <div className="flex rounded-md border border-border p-0.5">
                    {([
                        { key: 'mobile' as const, icon: Smartphone, label: 'Mobile' },
                        { key: 'web' as const, icon: Monitor, label: 'Web' },
                    ]).map(({ key, icon: Icon, label }) => (
                        <Button
                            key={key}
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setDevice(key)}
                            className={cn(
                                'h-7 gap-1.5 px-3 text-xs',
                                device === key && 'bg-primary/10 font-semibold text-primary'
                            )}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="flex justify-center">
                <div
                    className={cn(
                        'relative overflow-hidden rounded-sm bg-[#FFFBF5] shadow-md',
                        device === 'web' ? 'w-full max-w-[420px] aspect-[16/10]' : 'w-[262px] aspect-[3/4]'
                    )}
                >
                    {/* Content sits UNDER the frame, inset so the artwork has room
                        to sit in the margin rather than across the text. */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-9 py-8 text-center">
                        <div className="text-[6px] font-semibold uppercase tracking-[0.18em] text-[#8A6A3B]">
                            {SAMPLE.invite_line}
                        </div>

                        <div className="leading-none text-[#7B2D3B]" style={{ fontFamily: 'Georgia, serif' }}>
                            <div className="text-[22px] italic">{SAMPLE.hosts[0]}</div>
                            <div className="my-0.5 text-[10px]">&amp;</div>
                            <div className="text-[22px] italic">{SAMPLE.hosts[1]}</div>
                        </div>

                        <div className="text-[5.5px] font-semibold uppercase tracking-[0.16em] text-[#8A6A3B]">
                            {SAMPLE.sub}
                        </div>

                        <div className="mt-1 flex items-center gap-1.5 text-[#3A2C22]">
                            <span className="border-y border-[#C9A227] px-1.5 py-0.5 text-[6px] font-semibold uppercase tracking-wider">
                                {SAMPLE.day}
                            </span>
                            <span className="text-[19px] font-bold leading-none">{SAMPLE.date}</span>
                            <span className="border-y border-[#C9A227] px-1.5 py-0.5 text-[6px] font-semibold uppercase tracking-wider">
                                {SAMPLE.month}
                            </span>
                        </div>
                        <div className="text-[5.5px] tracking-[0.14em] text-[#3A2C22] opacity-80">
                            {SAMPLE.time}
                        </div>

                        <div className="mt-1 text-[#3A2C22]">
                            <div className="flex items-center justify-center gap-1 text-[7px] font-bold">
                                <MapPin className="h-2 w-2 text-[#B23A48]" />
                                {SAMPLE.venue_name}
                            </div>
                            <div className="text-[5.5px] opacity-75">{SAMPLE.venue_line}</div>
                            <div className="text-[5.5px] opacity-75">{SAMPLE.venue_city}</div>
                        </div>

                        <div className="mt-1 flex flex-col items-center gap-0.5">
                            <div className="text-[5px] uppercase tracking-[0.14em] text-[#8A6A3B]">
                                {SAMPLE.qr_note}
                            </div>
                            <span className="grid h-9 w-9 place-items-center border border-[#C9A227] bg-white">
                                <QrCode className="h-7 w-7 text-[#3A2C22]" />
                            </span>
                        </div>
                    </div>

                    {/* The uploaded frame, over everything. */}
                    {fileUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={fileUrl}
                            alt=""
                            className="pointer-events-none absolute inset-0 h-full w-full object-fill"
                        />
                    ) : (
                        <div className="pointer-events-none absolute inset-0 m-2 rounded-sm border-2 border-dashed border-border" />
                    )}
                </div>
            </div>

            <p className="text-center text-[11px] leading-snug text-muted-foreground">
                {!fileUrl
                    ? 'Upload a frame file to see it applied to a sample invitation.'
                    : unsupported
                        ? `Shown for reference — this frame does not list ${shape} as a supported layout.`
                        : `Sample content, framed by your upload, as it appears on ${device === 'web' ? 'web' : 'mobile'}.`}
            </p>
        </div>
    );
}
