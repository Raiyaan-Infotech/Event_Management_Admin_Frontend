'use client';

import { useRouter } from 'next/navigation';
import {
    Bell,
    Pencil,
    Layers,
    Loader2,
    Tag,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DynamicIcon } from '@/components/common/dynamic-icon';
import { useNotificationTemplate } from '@/hooks/use-notification-templates';

interface TemplatePreviewModalProps {
    templateId: number | string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const SAMPLE_VALUES: Record<string, string> = {
    guest_name: 'Priya Sharma',
    event_name: 'Royal Heritage Gala & Wedding',
    event_date: 'Saturday, Oct 24, 2026',
    event_time: '6:30 PM',
    venue_name: 'The Grand Imperial Ballroom, Mumbai',
    event_link: 'eventinvit.app/e/royal-wedding-2026',
};

function renderText(text: string): string {
    if (!text) return '';
    return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => SAMPLE_VALUES[key] ?? match);
}

export function TemplatePreviewModal({
    templateId,
    open,
    onOpenChange,
}: TemplatePreviewModalProps) {
    const router = useRouter();
    const { data: template, isLoading } = useNotificationTemplate(open && templateId ? templateId : undefined);

    const handleEdit = () => {
        if (!template) return;
        onOpenChange(false);
        router.push(`/admin/notifications/templates/create?id=${template.id}`);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto p-0 gap-0 border-border bg-card shadow-2xl rounded-2xl">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm font-medium text-muted-foreground">Loading template preview...</p>
                    </div>
                ) : !template ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                        Template details could not be loaded.
                    </div>
                ) : (
                    <>
                        {/* Modal Header */}
                        <div className="border-b border-border bg-muted/30 px-6 py-5">
                            <div className="flex flex-wrap items-start justify-between gap-3 pr-6">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <Bell className="h-4 w-4" />
                                        </div>
                                        <DialogTitle className="text-lg font-bold text-foreground tracking-tight">
                                            {template.name}
                                        </DialogTitle>
                                    </div>
                                    <DialogDescription className="text-xs text-muted-foreground">
                                        Mobile push notification preview.
                                    </DialogDescription>
                                </div>

                                <Badge
                                    variant={Number(template.is_active) ? 'default' : 'outline'}
                                    className="shrink-0"
                                >
                                    {Number(template.is_active) ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>

                            {/* Metadata Pills */}
                            <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs">
                                {template.notificationCategory && (
                                    <span
                                        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold"
                                        style={{
                                            backgroundColor: `${template.notificationCategory.color || '#6B7280'}1A`,
                                            color: template.notificationCategory.color || '#6B7280',
                                        }}
                                    >
                                        <DynamicIcon
                                            name={template.notificationCategory.icon}
                                            color={template.notificationCategory.color}
                                            size="h-3.5 w-3.5"
                                        />
                                        {template.notificationCategory.name}
                                    </span>
                                )}

                                <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                                    <Tag className="h-3 w-3 text-muted-foreground" />
                                    {template.category?.name
                                        ? `${template.category.name}${template.eventType?.name ? ` • ${template.eventType.name}` : ''}`
                                        : 'Global (All Event Types)'}
                                </span>

                                {Array.isArray(template.channels) && template.channels.length > 0 && (
                                    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                                        <Layers className="h-3 w-3 text-muted-foreground" />
                                        {template.channels.map((c) => (c === 'push' ? 'Push Notification' : 'In-App')).join(', ')}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {/* Mobile Push Notification Card */}
                            <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-5 text-white shadow-xl dark:border-slate-800">
                                {/* Mobile Top Status Mock */}
                                <div className="mb-4 flex items-center justify-between text-[11px] font-medium tracking-tight text-slate-400">
                                    <span>9:41</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                        <span>5G</span>
                                        <span className="inline-block h-2.5 w-4 rounded-xs border border-slate-400" />
                                    </div>
                                </div>

                                {/* iOS / Modern Push Notification Banner */}
                                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-md">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-primary/80 shadow-md text-primary-foreground">
                                            <Bell className="h-4 w-4" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-bold tracking-tight text-white">
                                                        Event Invit
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-normal">
                                                        • now
                                                    </span>
                                                </div>
                                                {template.notificationCategory && (
                                                    <span
                                                        className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                                                        style={{
                                                            backgroundColor: `${template.notificationCategory.color || '#6B7280'}33`,
                                                            color: template.notificationCategory.color || '#E2E8F0',
                                                        }}
                                                    >
                                                        {template.notificationCategory.name}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="mt-1 break-words text-sm font-semibold text-white leading-snug">
                                                {renderText(template.title) || 'Notification Title'}
                                            </p>

                                            <p className="mt-0.5 break-words text-xs text-slate-300 leading-relaxed">
                                                {renderText(template.content) || 'Notification message will appear here.'}
                                            </p>

                                            {template.image_url && (
                                                <div className="mt-2.5 overflow-hidden rounded-xl border border-white/10 shadow-inner">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={template.image_url}
                                                        alt=""
                                                        className="h-36 w-full object-cover"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>


                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <DialogFooter className="border-t border-border bg-muted/20 px-6 py-4 flex flex-row items-center justify-between sm:justify-between">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onOpenChange(false)}
                            >
                                Close
                            </Button>

                            <Button
                                size="sm"
                                onClick={handleEdit}
                                className="gap-2"
                            >
                                <Pencil className="h-3.5 w-3.5" /> Edit Template
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
