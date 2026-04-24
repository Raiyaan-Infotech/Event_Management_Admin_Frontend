'use client';

import { useState, useMemo } from 'react';
import { useThemes, useUpdateTheme, useDeleteTheme, Theme } from '@/hooks/use-themes';
import { useRouter } from 'next/navigation';
import { Palette, LayoutDashboard, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/common/page-loader';
import { DeleteDialog } from '@/components/common/delete-dialog';
import { TablePagination } from '@/components/common/table-pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSubscriptions } from '@/hooks/use-subscriptions';

export function AppearanceContent() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(12);
    const [planFilter, setPlanFilter] = useState<string>('all');

    const { data: res, isLoading } = useThemes({ page, limit });
    const allThemes: Theme[] = res?.data || [];
    const pagination = res?.pagination;

    const { data: plansRes } = useSubscriptions({ page: 1, limit: 100 });
    const subPlans = useMemo(() => plansRes?.data ?? [], [plansRes]);

    // Filter themes client-side by plan
    const themes = useMemo(() => {
        if (planFilter === 'all') return allThemes;
        return allThemes.filter(t => {
            const plans = Array.isArray(t.plans)
                ? t.plans.map(Number)
                : (typeof t.plans === 'string' ? JSON.parse(t.plans).map(Number) : []);
            return plans.includes(Number(planFilter));
        });
    }, [allThemes, planFilter]);

    const update = useUpdateTheme();
    const del = useDeleteTheme();
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const colorSwatches = (theme: Theme) => [
        { color: theme.primary_color, label: 'Primary' },
        { color: theme.secondary_color, label: 'Secondary' },
        { color: theme.header_color, label: 'Header' },
        { color: theme.footer_color, label: 'Footer' },
        { color: theme.hover_color, label: 'Hover' },
        { color: theme.text_color, label: 'Text' },
    ].filter(s => s.color);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-52 rounded-2xl bg-muted animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageLoader open={update.isPending || del.isPending} />

            {/* Plan Filter Bar */}
            <div className="flex items-center gap-3">
                <Select value={planFilter} onValueChange={(v) => { setPlanFilter(v); setPage(1); }}>
                    <SelectTrigger className="w-[220px] h-9 text-sm">
                        <SelectValue placeholder="Filter by plan..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Plans</SelectItem>
                        {subPlans.map((plan: any) => (
                            <SelectItem key={plan.id} value={plan.id.toString()}>{plan.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {planFilter !== 'all' && (
                    <button
                        onClick={() => setPlanFilter('all')}
                        className="text-xs text-muted-foreground hover:text-foreground underline"
                    >
                        Clear filter
                    </button>
                )}
                <span className="text-xs text-muted-foreground ml-auto">
                    {themes.length} theme{themes.length !== 1 ? 's' : ''} shown
                </span>
            </div>

            {themes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground gap-3">
                    <Palette className="h-12 w-12 opacity-20" />
                    <p className="text-lg font-medium">No themes saved yet</p>
                    <p className="text-sm">Go to <strong>Color Palette</strong> to create your first theme.</p>
                    <Button variant="outline" size="sm" onClick={() => router.push('/admin/themes')}>
                        Go to Color Palette
                    </Button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {themes.map((theme) => {
                            const isActive = Number(theme.is_active) === 1;
                            const swatches = colorSwatches(theme);
                            return (
                                <div
                                    key={theme.id}
                                    className={`relative rounded-2xl border bg-card shadow-sm overflow-hidden transition-all hover:shadow-md ${isActive ? 'ring-2 ring-primary' : ''}`}
                                >
                                    {/* Color Preview Bar */}
                                    <div className="h-3 flex w-full">
                                        {swatches.slice(0, 4).map((s, i) => (
                                            <div key={i} className="flex-1 h-full" style={{ backgroundColor: s.color || '#e5e7eb' }} />
                                        ))}
                                    </div>

                                    <div className="p-5 space-y-4">
                                        {/* Header */}
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="font-bold text-base leading-tight">{theme.name}</h3>
                                                <p className="text-[11px] text-muted-foreground mt-0.5">ID: {theme.id}</p>
                                            </div>
                                            {isActive
                                                ? <Badge className="gap-1 text-[10px] shrink-0"><CheckCircle2 className="h-3 w-3" /> Active</Badge>
                                                : <Badge variant="outline" className="gap-1 text-[10px] shrink-0 text-muted-foreground"><Circle className="h-3 w-3" /> Inactive</Badge>
                                            }
                                        </div>

                                        {/* Color Swatches */}
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            {swatches.map((s, i) => (
                                                <div
                                                    key={i}
                                                    title={`${s.label}: ${s.color}`}
                                                    className="w-6 h-6 rounded-full border border-black/10 shadow-sm"
                                                    style={{ backgroundColor: s.color || '#ccc' }}
                                                />
                                            ))}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 pt-1">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 gap-1.5 text-xs h-8"
                                                onClick={() => router.push(`/admin/theme-builder?themeId=${theme.id}`)}
                                            >
                                                <LayoutDashboard className="h-3.5 w-3.5" /> Edit Layout
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 gap-1.5 text-xs h-8"
                                                onClick={() => router.push(`/admin/themes?edit=${theme.id}`)}
                                            >
                                                <Palette className="h-3.5 w-3.5" /> Edit Colors
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive shrink-0"
                                                onClick={() => setDeleteId(theme.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>

                                        {/* Toggle Active */}
                                        <button
                                            onClick={() => update.mutate({ id: theme.id, data: { is_active: isActive ? 0 : 1 } })}
                                            className={`w-full text-xs py-1.5 rounded-lg border transition-colors ${isActive ? 'border-primary/30 bg-primary/5 text-primary hover:bg-primary/10' : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted'}`}
                                        >
                                            {isActive ? 'Set as Inactive' : 'Set as Active'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {pagination && (
                        <TablePagination
                            pagination={{ ...pagination, limit }}
                            onPageChange={setPage}
                            onLimitChange={setLimit}
                        />
                    )}
                </>
            )}

            <DeleteDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="Delete Theme?"
                description="This will permanently remove the theme and cannot be undone."
                isDeleting={del.isPending}
                onConfirm={() => {
                    if (deleteId) del.mutate(deleteId, {
                        onSuccess: () => setDeleteId(null),
                        onError: () => setDeleteId(null),
                    });
                }}
            />
        </div>
    );
}
