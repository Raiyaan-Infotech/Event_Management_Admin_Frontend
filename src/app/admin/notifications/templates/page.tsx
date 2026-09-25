'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Search,
    RotateCcw,
    MoreVertical,
    Pencil,
    Copy,
    Eye,
    Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { TablePagination } from '@/components/common/table-pagination';
import { DeleteDialog } from '@/components/common/delete-dialog';
import { PageLoader } from '@/components/common/page-loader';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { DynamicIcon } from '@/components/common/dynamic-icon';
import { TemplatePreviewModal } from './_components/template-preview-modal';
import { cn } from '@/lib/utils';
import { useEventCategories } from '@/hooks/use-menu-management';
import { useNotificationCategories } from '@/hooks/use-notification-categories';
import {
    useNotificationTemplates,
    useUpdateNotificationTemplateStatus,
    useDuplicateNotificationTemplate,
    useDeleteNotificationTemplate,
} from '@/hooks/use-notification-templates';

const ALL = 'all';

export default function NotificationTemplatesPage() {
    const router = useRouter();

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [categoryTab, setCategoryTab] = useState<string>(ALL);
    const [eventCategoryId, setEventCategoryId] = useState(ALL);
    const [status, setStatus] = useState(ALL);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [previewId, setPreviewId] = useState<number | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const pId = params.get('preview');
            if (pId) {
                const parsed = Number(pId);
                if (Number.isInteger(parsed) && parsed > 0) {
                    setPreviewId(parsed);
                }
            }
        }
    }, []);

    const { data: notificationCategories } = useNotificationCategories({ limit: 200, is_active: true });
    const { data: eventCategories } = useEventCategories({ limit: 200, is_active: true });

    // Counts per tab — a single wide fetch, counted client-side. Template
    // volume here is tens, not thousands, so this stays cheap.
    const { data: countsData } = useNotificationTemplates({ limit: 1000 });
    const counts = useMemo(() => {
        const byCategory: Record<number, number> = {};
        (countsData?.data ?? []).forEach((t) => {
            byCategory[t.notification_category_id] = (byCategory[t.notification_category_id] ?? 0) + 1;
        });
        return byCategory;
    }, [countsData]);
    const totalCount = countsData?.data?.length ?? 0;

    const { data, isLoading } = useNotificationTemplates({
        page,
        limit,
        search: search || undefined,
        notification_category_id: categoryTab === ALL ? undefined : categoryTab,
        event_category_id: eventCategoryId === ALL ? undefined : eventCategoryId,
        is_active: status === ALL ? undefined : status === 'active',
    });

    const updateStatus = useUpdateNotificationTemplateStatus();
    const duplicateTemplate = useDuplicateNotificationTemplate();
    const deleteTemplate = useDeleteNotificationTemplate();

    const templates = data?.data ?? [];
    const pagination = data?.pagination ?? null;
    const hasFilters =
        !!search || categoryTab !== ALL || eventCategoryId !== ALL || status !== ALL;

    const clearFilters = () => {
        setSearch('');
        setCategoryTab(ALL);
        setEventCategoryId(ALL);
        setStatus(ALL);
        setPage(1);
    };

    const previewTemplate = (id: number) => {
        setPreviewId(id);
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('preview', String(id));
            window.history.replaceState({}, '', url.toString());
        }
    };

    const handleClosePreview = () => {
        setPreviewId(null);
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            if (url.searchParams.has('preview')) {
                url.searchParams.delete('preview');
                window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
            }
        }
    };

    // The status switch saves too — without it in here, flipping Active/Inactive
    // showed no loader at all while the request ran.
    const isBusy =
        isLoading || updateStatus.isPending || duplicateTemplate.isPending || deleteTemplate.isPending;

    return (
        <PermissionGuard permission="notification_templates.view">
            <div className="space-y-5">
                <PageLoader open={isBusy} text={updateStatus.isPending ? "Updating status..." : "Loading..."} />

                <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight text-foreground">
                            Transactional Notification Templates
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Create and manage system generated notifications for RSVPs, reminders, invitations and more.
                        </p>
                    </div>
                    <Button onClick={() => router.push('/admin/notifications/templates/create')} className="h-9 gap-2">
                        <Plus className="h-4 w-4" /> Add Template
                    </Button>
                </div>

                <Tabs
                    value={categoryTab}
                    onValueChange={(v) => {
                        setCategoryTab(v);
                        setPage(1);
                    }}
                >
                    <TabsList className="h-auto flex-wrap justify-start gap-1 bg-muted/40 p-1">
                        <TabsTrigger value={ALL} className="gap-1.5">
                            All Templates <span className="text-[11px] opacity-70">({totalCount})</span>
                        </TabsTrigger>
                        {(notificationCategories?.data ?? []).map((c) => (
                            <TabsTrigger key={c.id} value={String(c.id)} className="gap-1.5">
                                <DynamicIcon name={c.icon} color={c.color} size="h-3.5 w-3.5" />
                                {c.name} <span className="text-[11px] opacity-70">({counts[c.id] ?? 0})</span>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                <Card className="border-border bg-card shadow-xs">
                    <CardContent className="space-y-3 p-4">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                            <div className="space-y-1.5 lg:col-span-2">
                                <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    Search
                                </Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            setPage(1);
                                        }}
                                        placeholder="Search templates by name, title or content..."
                                        className="h-10 pl-9"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    Notification Category
                                </Label>
                                <Select
                                    value={categoryTab}
                                    onValueChange={(v) => {
                                        setCategoryTab(v);
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ALL}>All Notification Categories</SelectItem>
                                        {(notificationCategories?.data ?? []).map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    Event Category
                                </Label>
                                <Select
                                    value={eventCategoryId}
                                    onValueChange={(v) => {
                                        setEventCategoryId(v);
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ALL}>All Categories</SelectItem>
                                        {(eventCategories?.data ?? []).map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <div className="w-40 space-y-1.5">
                                <Select
                                    value={status}
                                    onValueChange={(v) => {
                                        setStatus(v);
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ALL}>All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={clearFilters}
                                disabled={!hasFilters}
                                className="h-9 gap-2 text-xs"
                            >
                                <RotateCcw className="h-3.5 w-3.5" /> Reset
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card shadow-xs">
                    <CardContent className="p-0">
                        <div className="w-full overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-border/60 hover:bg-transparent">
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead className="min-w-[200px]">Template Name</TableHead>
                                        <TableHead className="whitespace-nowrap">Notification Category</TableHead>
                                        <TableHead className="whitespace-nowrap">Event Category</TableHead>
                                        <TableHead className="min-w-[160px]">Title</TableHead>
                                        <TableHead className="min-w-[220px]">Content Preview</TableHead>
                                        <TableHead className="whitespace-nowrap text-center">Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="py-16 text-center text-muted-foreground">
                                                Loading templates...
                                            </TableCell>
                                        </TableRow>
                                    ) : templates.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="py-16 text-center text-muted-foreground">
                                                {hasFilters
                                                    ? 'No templates match these filters.'
                                                    : 'No templates yet. Click "Add Template" to create your first one.'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        templates.map((row, index) => {
                                            const locked = !!row.has_pending_approval;
                                            const rowNumber =
                                                ((pagination?.page ?? 1) - 1) * (pagination?.limit ?? limit) + index + 1;
                                            const active = !!Number(row.is_active);

                                            return (
                                                <TableRow key={row.id} className="border-b border-border/40">
                                                    <TableCell className="text-sm text-muted-foreground">{rowNumber}</TableCell>

                                                    <TableCell>
                                                        <div className="flex items-center gap-2.5">
                                                            <span
                                                                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border"
                                                                style={
                                                                    row.notificationCategory?.color
                                                                        ? { backgroundColor: `${row.notificationCategory.color}1A` }
                                                                        : undefined
                                                                }
                                                            >
                                                                <DynamicIcon
                                                                    name={row.notificationCategory?.icon}
                                                                    color={row.notificationCategory?.color}
                                                                    size="h-3.5 w-3.5"
                                                                />
                                                            </span>
                                                            <span className="break-all text-sm font-semibold text-foreground">
                                                                {row.name}
                                                            </span>
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="text-sm text-foreground">
                                                        {row.notificationCategory ? (
                                                            <span
                                                                className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-semibold"
                                                                style={{
                                                                    backgroundColor: `${row.notificationCategory.color || '#6B7280'}1A`,
                                                                    color: row.notificationCategory.color || '#6B7280',
                                                                }}
                                                            >
                                                                <DynamicIcon
                                                                    name={row.notificationCategory.icon}
                                                                    color={row.notificationCategory.color}
                                                                    size="h-3 w-3"
                                                                />
                                                                {row.notificationCategory.name}
                                                            </span>
                                                        ) : (
                                                            '—'
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-foreground">
                                                        {row.category?.name ?? '—'}
                                                    </TableCell>
                                                    <TableCell className="max-w-[180px] break-all text-sm text-foreground">
                                                        {row.title}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div
                                                            role="button"
                                                            tabIndex={0}
                                                            onClick={() => previewTemplate(row.id)}
                                                            className="group/preview cursor-pointer text-left focus:outline-none"
                                                            title="Click to preview template modal"
                                                        >
                                                            <span
                                                                className="block max-w-xs break-all line-clamp-2 text-xs text-muted-foreground transition-colors group-hover/preview:text-primary group-hover/preview:underline"
                                                            >
                                                                {row.content}
                                                            </span>
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="text-center">
                                                        <Switch
                                                            checked={active}
                                                            disabled={locked || updateStatus.isPending}
                                                            onCheckedChange={(value) =>
                                                                updateStatus.mutate({ id: row.id, is_active: value })
                                                            }
                                                            className="mx-auto"
                                                        />
                                                    </TableCell>

                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    disabled={locked}
                                                                    title={
                                                                        locked
                                                                            ? 'This template has a change awaiting approval.'
                                                                            : undefined
                                                                    }
                                                                >
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-52">
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        router.push(
                                                                            `/admin/notifications/templates/create?id=${row.id}`
                                                                        )
                                                                    }
                                                                >
                                                                    <Pencil className="mr-2 h-4 w-4" /> Edit Template
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => duplicateTemplate.mutate(row.id)}
                                                                >
                                                                    <Copy className="mr-2 h-4 w-4" /> Duplicate Template
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => previewTemplate(row.id)}>
                                                                    <Eye className="mr-2 h-4 w-4" /> Preview Template
                                                                </DropdownMenuItem>

                                                                <DropdownMenuSeparator />

                                                                <DropdownMenuItem
                                                                    onClick={() => setDeleteId(row.id)}
                                                                    className="text-destructive focus:text-destructive"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Template
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {pagination && pagination.totalItems > 0 && (
                            <div className="border-t border-border px-4 py-3">
                                <TablePagination
                                    pagination={pagination}
                                    onPageChange={setPage}
                                    onLimitChange={(v) => {
                                        setLimit(v);
                                        setPage(1);
                                    }}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                <TemplatePreviewModal
                    templateId={previewId}
                    open={previewId !== null}
                    onOpenChange={(open) => {
                        if (!open) handleClosePreview();
                    }}
                />

                <DeleteDialog
                    open={deleteId !== null}
                    onOpenChange={(open: boolean) => !open && setDeleteId(null)}
                    title="Delete Notification Template"
                    description="Are you sure you want to delete this template? This action cannot be undone."
                    isDeleting={deleteTemplate.isPending}
                    onConfirm={() => {
                        if (deleteId !== null) {
                            deleteTemplate.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
                        }
                    }}
                />
            </div>
        </PermissionGuard>
    );
}
