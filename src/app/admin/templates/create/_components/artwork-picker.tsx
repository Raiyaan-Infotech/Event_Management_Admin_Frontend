'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Check, ImageOff, X } from 'lucide-react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/**
 * The Border / Frame Style and Decorations pickers in wizard step 2.
 *
 * One component for both, because they are the same interaction: a strip of
 * thumbnails with a "View More" tile opening the full catalogue. The only
 * difference is single vs multiple selection, which is the `multiple` prop.
 *
 * ── WHY A SHARED CATALOGUE AND NOT AN ENUM ───────────────────────────────────
 * Both of these used to be hardcoded lists of adjectives — `border_style` mapped
 * to a CSS class and `decorations` rendered nothing at all. They now point at
 * the Frame Styles and Decorations modules, so what the admin picks here IS the
 * artwork that gets drawn.
 *
 * ── SUGGESTED, NOT FILTERED ──────────────────────────────────────────────────
 * When a `suggestCategoryId` is given (step 1's Style), matching items sort to
 * the front and are labelled — but everything stays selectable. A hard filter
 * would forbid a minimal gold frame on a Traditional template, which is a real
 * combination somebody will want.
 */

export interface ArtworkItem {
    id: number;
    name: string;
    file_url: string | null;
    /** Frame styles carry one; decorations do not. */
    template_category_id?: number | null;
    /** Decorations carry a placement; shown as a caption in the dialog. */
    type_label?: string;
}

interface ArtworkPickerProps {
    label: string;
    optional?: boolean;
    items: ArtworkItem[];
    isLoading?: boolean;
    /** Single-select (frame) passes one id or null; multi (decorations) an array. */
    multiple?: boolean;
    selectedId?: number | null;
    selectedIds?: number[];
    onSelect?: (id: number | null) => void;
    onToggle?: (id: number) => void;
    /** Step 1's Style. Matching items sort first — see the note above. */
    suggestCategoryId?: number | null;
    /** Where "manage these" goes when the catalogue is empty. */
    manageHref: string;
    manageLabel: string;
    emptyHint: string;
}

/** How many tiles sit inline before the "View More" tile. */
const INLINE = 4;

export function ArtworkPicker({
    label,
    optional,
    items,
    isLoading,
    multiple = false,
    selectedId = null,
    selectedIds = [],
    onSelect,
    onToggle,
    suggestCategoryId = null,
    manageHref,
    manageLabel,
    emptyHint,
}: ArtworkPickerProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const isOn = (id: number) => (multiple ? selectedIds.includes(id) : selectedId === id);

    /**
     * Suggested first, then everything else — and anything already SELECTED is
     * pulled to the front regardless. Without that last part a chosen frame can
     * sit at position 30 and the strip shows four tiles none of which are lit,
     * so the control reads as having lost the selection.
     */
    const ordered = useMemo(() => {
        const rank = (item: ArtworkItem) => {
            if (isOn(item.id)) return 0;
            if (suggestCategoryId && item.template_category_id === suggestCategoryId) return 1;
            return 2;
        };
        return [...items].sort((a, b) => rank(a) - rank(b));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items, suggestCategoryId, selectedId, selectedIds.join(',')]);

    const inline = ordered.slice(0, INLINE);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return q ? ordered.filter((i) => i.name.toLowerCase().includes(q)) : ordered;
    }, [ordered, search]);

    const suggestedCount = suggestCategoryId
        ? items.filter((i) => i.template_category_id === suggestCategoryId).length
        : 0;

    const tile = (item: ArtworkItem, size: 'sm' | 'lg') => (
        <button
            key={item.id}
            type="button"
            title={item.name}
            onClick={() => (multiple ? onToggle?.(item.id) : onSelect?.(isOn(item.id) ? null : item.id))}
            className={cn(
                'relative flex flex-col items-center justify-center overflow-hidden rounded-lg border transition-colors',
                size === 'sm' ? 'h-[68px] w-full' : 'h-[110px] w-full',
                isOn(item.id)
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border hover:border-primary/40'
            )}
        >
            {item.file_url ? (
                // `contain`: cropping a border's corners or a corner ornament
                // hides the only part that identifies it.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.file_url} alt="" className="h-full w-full object-contain p-1" />
            ) : (
                <ImageOff className="h-4 w-4 text-muted-foreground" />
            )}

            {isOn(item.id) ? (
                <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-primary">
                    <Check className="h-2.5 w-2.5 text-primary-foreground" />
                </span>
            ) : null}

            {size === 'lg' ? (
                <span className="w-full truncate bg-background/85 px-1.5 py-1 text-[10px] font-medium">
                    {item.name}
                    {item.type_label ? (
                        <span className="text-muted-foreground"> · {item.type_label}</span>
                    ) : null}
                </span>
            ) : null}
        </button>
    );

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
                <Label>
                    {label}{' '}
                    {optional ? (
                        <span className="font-normal text-muted-foreground">(Optional)</span>
                    ) : null}
                </Label>
                {multiple && selectedIds.length > 0 ? (
                    <button
                        type="button"
                        onClick={() => selectedIds.forEach((id) => onToggle?.(id))}
                        className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive"
                    >
                        <X className="h-3 w-3" /> Clear {selectedIds.length}
                    </button>
                ) : null}
            </div>

            {isLoading ? (
                <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-[68px] animate-pulse rounded-lg bg-muted" />
                    ))}
                </div>
            ) : items.length === 0 ? (
                /* An empty catalogue points at the fix rather than showing a dead
                   row of boxes that can never be filled from this screen. */
                <div className="rounded-lg border border-dashed border-border p-4 text-center">
                    <p className="text-xs text-muted-foreground">{emptyHint}</p>
                    <Button asChild variant="outline" size="sm" className="mt-2 h-7 text-xs">
                        <Link href={manageHref}>{manageLabel}</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-5 gap-2">
                    {inline.map((item) => tile(item, 'sm'))}
                    <button
                        type="button"
                        onClick={() => { setSearch(''); setOpen(true); }}
                        className="flex h-[68px] flex-col items-center justify-center gap-0.5 rounded-lg border border-border text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        View More
                    </button>
                </div>
            )}

            {suggestedCount > 0 ? (
                <p className="text-[11px] text-muted-foreground">
                    {suggestedCount} match the style picked in step 1, shown first. Anything else is
                    still selectable.
                </p>
            ) : null}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[720px]">
                    <DialogHeader>
                        <DialogTitle>{label}</DialogTitle>
                    </DialogHeader>

                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search..."
                        className="h-9"
                    />

                    <div className="grid max-h-[420px] grid-cols-2 gap-3 overflow-y-auto p-0.5 sm:grid-cols-4">
                        {filtered.map((item) => tile(item, 'lg'))}
                        {filtered.length === 0 ? (
                            <p className="col-span-full py-8 text-center text-xs text-muted-foreground">
                                Nothing matches “{search}”.
                            </p>
                        ) : null}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                        <Button asChild variant="ghost" size="sm" className="h-8 text-xs">
                            <Link href={manageHref}>{manageLabel}</Link>
                        </Button>
                        {/* Multi-select keeps the dialog open while ticking; single
                            closes on pick, since there is nothing more to do. */}
                        <Button size="sm" className="h-8 text-xs" onClick={() => setOpen(false)}>
                            Done
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function Label({ children }: { children: React.ReactNode }) {
    return <span className="text-xs font-semibold text-foreground">{children}</span>;
}
