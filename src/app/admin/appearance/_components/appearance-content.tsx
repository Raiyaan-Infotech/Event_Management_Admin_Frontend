'use client';

import { useState, useMemo, useEffect } from 'react';
import { useThemes, useUpdateTheme, useDeleteTheme, useUploadThemePreviewImage, useDuplicateTheme, Theme } from '@/hooks/use-themes';
import { useRouter } from 'next/navigation';
import { Palette, LayoutDashboard, Trash2, CheckCircle2, Circle, LayoutTemplate, Eye, Power, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/common/page-loader';
import { DeleteDialog } from '@/components/common/delete-dialog';
import { TablePagination } from '@/components/common/table-pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSubscriptions } from '@/hooks/use-subscriptions';
import { useColorPalettes } from '@/hooks/use-color-palettes';
import { ImageCropper } from '@/components/common/image-cropper';
import { safeParseArray } from '@/lib/safe-json';
import { Skeleton } from '@/components/ui/skeleton';

const PREVIEW_VENDOR_ID = '1';

// Mini browser mock — same as vendor portal InternalThemePreview
const InternalThemePreview = ({ theme }: { theme: Theme }) => {
    const blocks = safeParseArray(theme.home_blocks);
    return (
        <div className="relative w-full h-full rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5 bg-white dark:bg-[#121212] shadow-inner flex flex-col p-3">
            <div className="flex items-center gap-1.5 mb-3 border-b pb-2 dark:border-gray-800">
                <div className="h-2 w-2 rounded-full bg-red-400" />
                <div className="h-2 w-2 rounded-full bg-yellow-400" />
                <div className="h-2 w-2 rounded-full bg-green-400" />
            </div>
            <div className="space-y-3 opacity-80 flex-1">
                <div className="h-4 w-full rounded-md" style={{ backgroundColor: theme.header_color || '#e5e7eb' }} />
                <div className="h-16 w-full rounded-lg" style={{ backgroundColor: theme.primary_color || '#d1d5db' }} />
                <div className="grid grid-cols-3 gap-2">
                    <div className="h-12 col-span-2 rounded-lg" style={{ backgroundColor: theme.secondary_color || '#d1d5db' }} />
                    <div className="h-12 col-span-1 border rounded-lg dark:border-gray-700" />
                </div>
                <div className="text-[10px] text-muted-foreground mt-2 border-t pt-2 dark:border-gray-800 flex items-center justify-between">
                    <span className="flex items-center gap-1"><LayoutTemplate className="w-3 h-3" /> {blocks.length} Blocks</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.primary_color || '#ccc' }} />
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.secondary_color || '#ccc' }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

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
    const { data: palettesRes } = useColorPalettes({ page: 1, limit: 100 });
    const palettes = useMemo(() => palettesRes?.data ?? [], [palettesRes]);

    // Filter themes client-side by plan
    const themes = useMemo(() => {
        if (planFilter === 'all') return allThemes;
        return allThemes.filter(t => {
            const plans = safeParseArray(t.plans).map(Number);
            return plans.includes(Number(planFilter));
        });
    }, [allThemes, planFilter]);

    const update = useUpdateTheme();
    const del = useDeleteTheme();
    const duplicate = useDuplicateTheme();
    const uploadPreview = useUploadThemePreviewImage();
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [uploadingId, setUploadingId] = useState<number | null>(null);
    const [selectedThemeId, setSelectedThemeId] = useState<number | null>(null);

    useEffect(() => {
        if (!themes.length) {
            setSelectedThemeId(null);
            return;
        }
        if (!themes.some((theme) => theme.id === selectedThemeId)) {
            setSelectedThemeId(themes[0].id);
        }
    }, [themes, selectedThemeId]);

    const handlePreviewUpload = (themeId: number, file: File) => {
        setUploadingId(themeId);
        uploadPreview.mutate({ id: themeId, file }, {
            onSettled: () => setUploadingId(null),
        });
    };

    const handlePreviewRemove = (themeId: number) => {
        update.mutate({ id: themeId, data: { preview_image: null } });
    };

    const handlePaletteChange = (theme: Theme, value: string) => {
        if (value === 'none') {
            update.mutate({
                id: theme.id,
                data: { palette_id: null },
            });
            return;
        }

        const palette = palettes.find((item) => item.id === Number(value));
        if (!palette) return;

        update.mutate({
            id: theme.id,
            data: {
                palette_id: palette.id,
                primary_color: palette.primary_color,
                secondary_color: palette.secondary_color,
                header_color: palette.header_color,
                footer_color: palette.footer_color,
                hover_color: palette.hover_color,
                text_color: palette.text_color,
            },
        });
    };

    const colorSwatches = (theme: Theme) => [
        { color: theme.primary_color, label: 'Primary' },
        { color: theme.secondary_color, label: 'Secondary' },
        { color: theme.header_color, label: 'Header' },
        { color: theme.footer_color, label: 'Footer' },
        { color: theme.hover_color, label: 'Hover' },
        { color: theme.text_color, label: 'Text' },
    ].filter(s => s.color);
    const paletteSwatches = (palette: any) => [
        palette.primary_color,
        palette.secondary_color,
        palette.header_color,
        palette.footer_color,
        palette.hover_color,
        palette.text_color,
    ].filter(Boolean);

    const selectedTheme = themes.find((theme) => theme.id === selectedThemeId) || null;
    const selectedPalette = selectedTheme?.palette_id
        ? palettes.find((palette) => palette.id === Number(selectedTheme.palette_id)) || null
        : null;

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-52 rounded-2xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageLoader open={update.isPending || del.isPending || duplicate.isPending || uploadPreview.isPending} />

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
                    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {themes.map((theme) => {
                                const isActive = Number(theme.is_active) === 1;
                                const isSelected = selectedThemeId === theme.id;
                                const swatches = colorSwatches(theme);
                                return (
                                    <button
                                        key={theme.id}
                                        type="button"
                                        onClick={() => setSelectedThemeId(theme.id)}
                                        className={`relative text-left rounded-2xl border bg-card shadow-sm overflow-hidden transition-all hover:shadow-md focus:outline-none ${
                                            isSelected
                                                ? 'ring-2 ring-primary border-primary/40'
                                                : 'border-border hover:border-primary/30'
                                        }`}
                                    >
                                        <div className="relative h-[320px] border-b bg-muted/30">
                                            <div className="absolute inset-0">
                                                {theme.preview_image ? (
                                                    <img src={theme.preview_image} alt={theme.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full p-4">
                                                        <InternalThemePreview theme={theme} />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="absolute right-3 top-3">
                                                {isActive
                                                    ? <Badge className="gap-1 text-[10px] shrink-0 shadow-sm"><CheckCircle2 className="h-3 w-3" /> Active</Badge>
                                                    : <Badge variant="outline" className="gap-1 text-[10px] shrink-0 bg-background/90 backdrop-blur text-muted-foreground"><Circle className="h-3 w-3" /> Inactive</Badge>
                                                }
                                            </div>
                                        </div>

                                        <div className="flex min-h-[108px] items-center justify-between gap-4 px-5 py-4">
                                            <div className="min-w-0">
                                                <h3 className="truncate font-bold text-base leading-tight">{theme.name}</h3>
                                                <p className="text-[11px] text-muted-foreground mt-1">Theme ID #{theme.id}</p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {swatches.map((s, i) => (
                                                    <div
                                                        key={i}
                                                        title={`${s.label}: ${s.color}`}
                                                        className="h-8 w-8 rounded-full border border-black/10 shadow-sm"
                                                        style={{ backgroundColor: s.color || '#ccc' }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="xl:sticky xl:top-6">
                            <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
                                {selectedTheme ? (
                                    <>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Selected Theme</p>
                                            <div>
                                                <h3 className="text-lg font-bold leading-tight">{selectedTheme.name}</h3>
                                            </div>
                                        </div>

                                        <div className="space-y-3 pt-1">
                                            <ImageCropper
                                                title={`${selectedTheme.name} preview`}
                                                description="Upload and crop the theme preview image."
                                                targetWidth={1200}
                                                targetHeight={800}
                                                currentImage={selectedTheme.preview_image || ''}
                                                onImageCropped={(file) => handlePreviewUpload(selectedTheme.id, file)}
                                                onRemove={() => handlePreviewRemove(selectedTheme.id)}
                                                showMediaPicker={false}
                                            />
                                            {uploadingId === selectedTheme.id && (
                                                <p className="text-xs text-muted-foreground">Uploading preview image...</p>
                                            )}

                                            <Button
                                                variant="outline"
                                                className="w-full justify-start gap-2"
                                                onClick={() => router.push(`/admin/theme-builder?themeId=${selectedTheme.id}`)}
                                            >
                                                <LayoutDashboard className="h-4 w-4" /> Edit Theme
                                            </Button>

                                            <div className="space-y-2">
                                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Color Palette</p>
                                                <Select
                                                    value={selectedTheme.palette_id ? selectedTheme.palette_id.toString() : 'none'}
                                                    onValueChange={(value) => handlePaletteChange(selectedTheme, value)}
                                                >
                                                    <SelectTrigger className="w-full h-12">
                                                        <div className="flex w-full items-center justify-between gap-3">
                                                            <div className="min-w-0 text-left">
                                                                <p className="truncate text-sm font-medium leading-none">
                                                                    {selectedPalette?.name || 'No palette'}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                                {colorSwatches(selectedTheme).map((s, i) => (
                                                                    <span
                                                                        key={i}
                                                                        className="h-4 w-4 rounded-full border border-black/10 shadow-sm"
                                                                        style={{ backgroundColor: s.color || '#ccc' }}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">
                                                            <span className="italic text-muted-foreground">No palette</span>
                                                        </SelectItem>
                                                        {palettes.map((palette) => (
                                                            <SelectItem key={palette.id} value={palette.id.toString()}>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex items-center gap-1.5">
                                                                        {paletteSwatches(palette)
                                                                            .map((color, i) => (
                                                                                <span
                                                                                    key={i}
                                                                                    className="h-4 w-4 rounded-full border border-black/10"
                                                                                    style={{ backgroundColor: color || '#ccc' }}
                                                                                />
                                                                            ))}
                                                                    </div>
                                                                    <span>{palette.name}</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <Button
                                                variant="outline"
                                                className="w-full justify-start gap-2"
                                                onClick={() => update.mutate({ id: selectedTheme.id, data: { is_active: Number(selectedTheme.is_active) === 1 ? 0 : 1 } })}
                                            >
                                                <Power className="h-4 w-4" />
                                                {Number(selectedTheme.is_active) === 1 ? 'Set as Inactive' : 'Set as Active'}
                                            </Button>

                                            <Button
                                                variant="outline"
                                                className="w-full justify-start gap-2"
                                                onClick={() => duplicate.mutate(selectedTheme.id)}
                                                disabled={duplicate.isPending}
                                            >
                                                <Copy className="h-4 w-4" /> Duplicate
                                            </Button>

                                            <Button
                                                variant="destructive"
                                                className="w-full justify-start gap-2"
                                                onClick={() => setDeleteId(selectedTheme.id)}
                                            >
                                                <Trash2 className="h-4 w-4" /> Delete
                                            </Button>

                                            <Button
                                                variant="outline"
                                                className="w-full justify-start gap-2"
                                                onClick={() => {
                                                    if (!selectedTheme) return;
                                                    const blocks = safeParseArray(selectedTheme.home_blocks).map((b: any) => ({
                                                        block_type: b.block_type,
                                                        variant: b.variant || 'variant_1',
                                                        is_visible: true,
                                                    }));
                                                    const params = new URLSearchParams({
                                                        themeId: selectedTheme.id.toString(),
                                                        vendorId: PREVIEW_VENDOR_ID,
                                                        blocks: btoa(JSON.stringify(blocks)),
                                                    });
                                                    if (selectedTheme.primary_color)   params.set('primary',   selectedTheme.primary_color);
                                                    if (selectedTheme.secondary_color) params.set('secondary', selectedTheme.secondary_color);
                                                    if (selectedTheme.header_color)    params.set('header',    selectedTheme.header_color);
                                                    if (selectedTheme.footer_color)    params.set('footer',    selectedTheme.footer_color);
                                                    if (selectedTheme.text_color)      params.set('text',      selectedTheme.text_color);
                                                    if (selectedTheme.hover_color)     params.set('hover',     selectedTheme.hover_color);
                                                    const vendorBaseUrl = process.env.NEXT_PUBLIC_VENDOR_URL || 'http://localhost:3001';
                                                    window.open(`${vendorBaseUrl}/preview?${params.toString()}`, '_blank', 'noopener,noreferrer');
                                                }}
                                            >
                                                <Eye className="h-4 w-4" /> Preview
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-16 text-center text-muted-foreground space-y-3">
                                        <LayoutTemplate className="mx-auto h-10 w-10 opacity-20" />
                                        <p className="text-sm font-medium">Select a theme to manage it</p>
                                    </div>
                                )}
                            </div>
                        </div>
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
