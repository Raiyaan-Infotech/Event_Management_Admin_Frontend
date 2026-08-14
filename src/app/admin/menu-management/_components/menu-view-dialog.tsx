'use client';

import { Globe, Smartphone } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { DynamicIcon } from '@/components/common/dynamic-icon';

import type { EventMenu } from '@/hooks/use-menu-management';

/** Read-only detail view behind the list's "View" action. */
export function MenuViewDialog({
    menu,
    open,
    onOpenChange,
}: {
    menu: EventMenu | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    if (!menu) return null;

    const rows: Array<[string, React.ReactNode]> = [
        ['Slug', <span key="slug" className="break-all font-mono text-xs">/{menu.slug}</span>],
        ['Event Category', menu.category?.name ?? '—'],
        ['Event Type', menu.eventType?.name ?? '—'],
        ['Religion', menu.religion?.name ?? '—'],
        ['Sort Order', String(menu.sort_order)],
        [
            'Color',
            menu.color ? (
                <span key="color" className="flex items-center gap-2">
                    <span
                        className="inline-block h-4 w-4 rounded-full border border-border"
                        style={{ background: menu.color }}
                    />
                    <span className="font-mono text-xs">{menu.color}</span>
                </span>
            ) : (
                '—'
            ),
        ],
    ];

    const StatusPair = ({
        label,
        website,
        mobile,
        showWebsite,
        showMobile,
    }: {
        label: string;
        website: number;
        mobile: number;
        showWebsite: boolean;
        showMobile: boolean;
    }) => (
        <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
            <div className="flex flex-wrap gap-2">
                {showWebsite && (
                    <Badge variant={website ? 'default' : 'outline'} className="gap-1.5">
                        <Globe className="h-3 w-3" /> Website {website ? 'On' : 'Off'}
                    </Badge>
                )}
                {showMobile && (
                    <Badge variant={mobile ? 'default' : 'outline'} className="gap-1.5">
                        <Smartphone className="h-3 w-3" /> Mobile {mobile ? 'On' : 'Off'}
                    </Badge>
                )}
                {!showWebsite && !showMobile && <span className="text-xs text-muted-foreground">—</span>}
            </div>
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2.5">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-muted/40">
                            <DynamicIcon name={menu.icon} color={menu.color} size="h-4.5 w-4.5" />
                        </span>
                        <span className="break-all">{menu.name}</span>
                    </DialogTitle>
                    <DialogDescription>
                        {Number(menu.is_active) === 1 ? 'Active' : 'Inactive'} menu ·{' '}
                        {menu.menu_type.length > 0 ? menu.menu_type.join(' + ') : 'no platform'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-1">
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                        {rows.map(([label, value]) => (
                            <div key={label} className="space-y-0.5">
                                <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    {label}
                                </dt>
                                <dd className="text-sm text-foreground">{value}</dd>
                            </div>
                        ))}
                    </dl>

                    <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2">
                        <StatusPair
                            label="Display Status"
                            website={menu.display_website}
                            mobile={menu.display_mobile}
                            showWebsite={!!menu.is_website}
                            showMobile={!!menu.is_mobile}
                        />
                        <StatusPair
                            label="Active Status"
                            website={menu.active_website}
                            mobile={menu.active_mobile}
                            showWebsite={!!menu.is_website}
                            showMobile={!!menu.is_mobile}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
