'use client';

/**
 * Frame Style List — the uploaded border artwork that frames an invitation.
 *
 * The Preview column shows the file itself, because that IS the record. Name,
 * category and layouts are only how it gets found again.
 *
 * Distinct from `event_templates.border_style`, which is an enum mapping to a
 * CSS border class — a double line is not an ornate frame.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Eye, ImageOff, Frame as FrameIcon } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { CommonTable, type CommonColumn } from '@/components/common/common-table';
import { PageLoader } from '@/components/common/page-loader';
import { DeleteDialog } from '@/components/common/delete-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    useFrameStyles,
    useFrameStyleStats,
    useUpdateFrameStyleStatus,
    useDeleteFrameStyle,
    layoutsLabel,
    type FrameStyle,
} from '@/hooks/use-frame-styles';
import { useTemplateCategories } from '@/hooks/use-template-categories';

export default function FrameStylesPage() {
    const router = useRouter();

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState('all');
    const [status, setStatus] = useState('all');

    const [deleting, setDeleting] = useState<FrameStyle | null>(null);

    const { data, isLoading } = useFrameStyles({
        page,
        limit,
        search: search || undefined,
        template_category_id: categoryId === 'all' ? undefined : Number(categoryId),
        status: status === 'all' ? undefined : status,
    });
    const { data: stats } = useFrameStyleStats();

    // Only active categories — offering a disabled one in the filter would show
    // rows the Add form can no longer produce.
    const { data: categories } = useTemplateCategories({ limit: 200, is_active: 1 });

    const toggleStatus = useUpdateFrameStyleStatus();
    const deleteFrame = useDeleteFrameStyle();

    const rows: FrameStyle[] = data?.data ?? [];
    const pagination = data?.pagination;
    const busy = toggleStatus.isPending || deleteFrame.isPending;

    const statCards = [
        { key: 'total', label: 'Total Frame Styles', value: stats?.total ?? 0 },
        { key: 'active', label: 'Active', value: stats?.active ?? 0 },
        { key: 'inactive', label: 'Inactive', value: stats?.inactive ?? 0 },
        { key: 'draft', label: 'Drafts', value: stats?.draft ?? 0 },
    ];

    const columns: CommonColumn<FrameStyle>[] = [
        {
            key: 'preview',
            header: 'Preview',
            className: 'w-[100px]',
            render: (row) => (
                <span className="flex h-12 w-16 items-center justify-center overflow-hidden rounded border border-border bg-muted/30">
                    {row.file_url ? (
                        // The frame is usually an SVG with transparency, so it is
                        // `contain` on a light tile rather than `cover` — cropping
                        // a border's corners hides the only thing that identifies it.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={row.file_url}
                            alt=""
                            className="h-full w-full object-contain p-0.5"
                        />
                    ) : (
                        <ImageOff className="h-4 w-4 text-muted-foreground" />
                    )}
                </span>
            ),
        },
        {
            key: 'name',
            header: 'Frame Style Name',
            className: 'min-w-[180px]',
            render: (row) => (
                <div className="min-w-0">
                    <p className="break-all line-clamp-2 font-medium">{row.name}</p>
                    {/* A draft is invisible to anything that consumes frames,
                        whatever its Active toggle says — so it is called out on
                        the row rather than only in the Status filter. */}
                    {row.status === 'draft' ? (
                        <Badge variant="outline" className="mt-1 text-[10px]">
                            Draft
                        </Badge>
                    ) : null}
                </div>
            ),
        },
        {
            key: 'category',
            header: 'Category',
            className: 'min-w-[120px]',
            render: (row) =>
                row.category ? (
                    <Badge variant="secondary" className="break-words">
                        {row.category.name}
                    </Badge>
                ) : (
                    // The category was deleted. The row keeps its reference, so
                    // restoring the category re-files it automatically.
                    <span className="text-xs text-muted-foreground">Uncategorised</span>
                ),
        },
        {
            key: 'supported_layouts',
            header: 'Supported Layouts',
            hideOnMobile: true,
            className: 'min-w-[160px]',
            render: (row) => (
                <span className="break-words text-xs">
                    {row.supported_layouts_label || layoutsLabel(row.supported_layouts)}
                </span>
            ),
        },
    ];

    return (
        <>
            <PageLoader open={busy} />

            <PageHeader
                title="Frame Styles"
                description="Border and frame artwork, classified by template category."
                action={
                    <Button onClick={() => router.push('/admin/templates/frame-styles/create')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Upload Frame Style
                    </Button>
                }
            />

            <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {statCards.map((card) => (
                    <Card key={card.key} className="flex items-center gap-3 p-4">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <FrameIcon className="h-4 w-4 text-muted-foreground" />
                        </span>
                        <div className="min-w-0">
                            <p className="text-xl font-bold leading-none">{card.value}</p>
                            <p className="mt-1 break-words text-xs text-muted-foreground">{card.label}</p>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Category</span>
                    <Select
                        value={categoryId}
                        onValueChange={(v) => { setCategoryId(v); setPage(1); }}
                    >
                        <SelectTrigger className="w-[190px]">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {(categories?.data ?? []).map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            {/* Draft/published is a different question from
                                active/inactive, so both live in one filter here
                                rather than pretending they are the same axis. */}
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <CommonTable<FrameStyle>
                columns={columns}
                data={rows}
                isLoading={isLoading}
                emptyMessage="No frame styles yet. Upload one to get started."
                searchPlaceholder="Search frame styles..."
                onSearch={(value) => {
                    setSearch(value);
                    setPage(1);
                }}
                extraActions={[
                    {
                        icon: Eye,
                        title: 'View',
                        onClick: (row: FrameStyle) =>
                            router.push(`/admin/templates/frame-styles/${row.id}`),
                    },
                ]}
                onStatusToggle={(row, value) =>
                    toggleStatus.mutate({ id: row.id, is_active: value })
                }
                onEdit={(row) =>
                    router.push(`/admin/templates/frame-styles/create?id=${row.id}`)
                }
                onDelete={(row) => setDeleting(row)}
                pagination={
                    pagination
                        ? {
                              page,
                              pageSize: limit,
                              totalItems: pagination.totalItems ?? 0,
                              totalPages: pagination.totalPages ?? 1,
                              onPageChange: setPage,
                              onPageSizeChange: (size) => {
                                  setLimit(size);
                                  setPage(1);
                              },
                          }
                        : undefined
                }
            />

            <DeleteDialog
                open={!!deleting}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="Delete frame style"
                description={
                    deleting
                        ? `Delete "${deleting.name}"? Any template using this frame will fall back to its border style.`
                        : ''
                }
                isDeleting={deleteFrame.isPending}
                onConfirm={() => {
                    if (deleting) {
                        deleteFrame.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
                    }
                }}
            />
        </>
    );
}
