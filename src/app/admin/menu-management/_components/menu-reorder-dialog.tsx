'use client';

import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Save } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DynamicIcon } from '@/components/common/dynamic-icon';

import type { EventMenu } from '@/hooks/use-menu-management';

/**
 * The list's "Change Order" action.
 *
 * Up/down buttons rather than drag-and-drop: the list is paginated, so a drag
 * surface would imply you can reorder across pages when you can only reorder
 * what is currently loaded. The header says as much.
 */
export function MenuReorderDialog({
    open,
    onOpenChange,
    menus,
    isSaving,
    onSave,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    menus: EventMenu[];
    isSaving: boolean;
    onSave: (items: Array<{ id: number; sort_order: number }>) => void;
}) {
    const [ordered, setOrdered] = useState<EventMenu[]>(menus);

    // Re-seed whenever the dialog opens, so it never shows a stale order from a
    // previous open or a page that has since changed.
    useEffect(() => {
        if (open) setOrdered(menus);
    }, [open, menus]);

    const move = (index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= ordered.length) return;
        setOrdered((prev) => {
            const next = [...prev];
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
    };

    // Re-number from the first row's existing sort_order so this page's block
    // keeps its position relative to menus on other pages.
    const baseOrder = menus.length > 0 ? Math.min(...menus.map((m) => m.sort_order)) : 1;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Change Order</DialogTitle>
                    <DialogDescription>
                        Reorders the menus on this page. Menus on other pages are not affected.
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[55vh] space-y-2 overflow-y-auto pt-1">
                    {ordered.map((menu, index) => (
                        <div
                            key={menu.id}
                            className="flex items-center gap-3 rounded-md border border-border bg-card p-2.5"
                        >
                            <span className="w-6 shrink-0 text-center text-xs font-semibold tabular-nums text-muted-foreground">
                                {baseOrder + index}
                            </span>
                            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40">
                                <DynamicIcon name={menu.icon} color={menu.color} size="h-4 w-4" />
                            </span>
                            <span className="min-w-0 flex-1 break-all text-sm font-medium">{menu.name}</span>
                            <div className="flex shrink-0 gap-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    disabled={index === 0}
                                    onClick={() => move(index, -1)}
                                >
                                    <ArrowUp className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    disabled={index === ordered.length - 1}
                                    onClick={() => move(index, 1)}
                                >
                                    <ArrowDown className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {ordered.length === 0 && (
                        <p className="py-8 text-center text-sm text-muted-foreground">Nothing to reorder.</p>
                    )}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        disabled={isSaving || ordered.length === 0}
                        onClick={() =>
                            onSave(ordered.map((m, i) => ({ id: m.id, sort_order: baseOrder + i })))
                        }
                        className="gap-1.5"
                    >
                        <Save className="h-3.5 w-3.5" />
                        Save Order
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
