'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Search,
    RotateCcw,
    MoreVertical,
    Eye,
    Pencil,
    Copy,
    LayoutList,
    Trash2,
    Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
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
import {
    useSubscriptionPlans,
    useUpdateSubscriptionPlanStatus,
    useDuplicateSubscriptionPlan,
    useDeleteSubscriptionPlan,
    formatPlanPrice,
    BILLING_CYCLES,
    type SubscriptionPlan,
} from '@/hooks/use-subscription-plans';
import { useEventCategories, useEventTypes, useReligions } from '@/hooks/use-menu-management';

const ALL = 'all';

function formatDateTime(value: string) {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return (
        <>
            <div>{d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            <div className="text-[11px] text-muted-foreground">
                {d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            </div>
        </>
    );
}

export function SubscriptionPlansContent() {
    const router = useRouter();

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState(ALL);
    const [typeId, setTypeId] = useState(ALL);
    const [religionId, setReligionId] = useState(ALL);
    const [status, setStatus] = useState(ALL);
    const [cycle, setCycle] = useState(ALL);

    const [deleteId, setDeleteId] = useState<number | null>(null);

    const { data, isLoading } = useSubscriptionPlans({
        page,
        limit,
        search: search || undefined,
        event_category_id: categoryId === ALL ? undefined : categoryId,
        event_type_id: typeId === ALL ? undefined : typeId,
        religion_id: religionId === ALL ? undefined : religionId,
        is_active: status === ALL ? undefined : status,
        billing_cycle: cycle === ALL ? undefined : cycle,
    });

    // limit:200 — a filter listing only the first page of options hides the rest.
    const { data: categories } = useEventCategories({ limit: 200, is_active: true });
    const { data: eventTypes } = useEventTypes({
        limit: 200,
        is_active: true,
        event_category_id: categoryId === ALL ? undefined : categoryId,
    });
    const { data: religions } = useReligions({
        limit: 200,
        is_active: true,
        event_category_id: categoryId === ALL ? undefined : categoryId,
        event_type_id: typeId === ALL ? undefined : typeId,
    });

    const updateStatus = useUpdateSubscriptionPlanStatus();
    const duplicatePlan = useDuplicateSubscriptionPlan();
    const deletePlan = useDeleteSubscriptionPlan();

    const plans = data?.data ?? [];
    const pagination = data?.pagination ?? null;
    const hasFilters =
        !!search || categoryId !== ALL || typeId !== ALL || religionId !== ALL || status !== ALL || cycle !== ALL;

    const resetFilters = () => {
        setSearch('');
        setCategoryId(ALL);
        setTypeId(ALL);
        setReligionId(ALL);
        setStatus(ALL);
        setCycle(ALL);
        setPage(1);
    };

    /** Client-side CSV of the current page — no export endpoint exists yet. */
    const exportCsv = () => {
        const header = ['Plan Name', 'Plan Code', 'Event Category', 'Event Type', 'Religion', 'Billing Cycle', 'Price', 'Status', 'Total Menus', 'Created On'];
        const rows = plans.map((p) => [
            p.name,
            p.plan_code,
            p.category?.name ?? 'All Categories',
            p.eventType?.name ?? 'All Types',
            p.religion?.name ?? 'All Religions',
            p.billing_cycle,
            formatPlanPrice(p),
            Number(p.is_active) === 1 ? 'Active' : 'Inactive',
            String(p.total_menus),
            p.created_at,
        ]);
        const csv = [header, ...rows]
            .map((r) => r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
            .join('\n');
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = `subscription-plans-page-${pagination?.page ?? 1}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const isBusy = duplicatePlan.isPending || deletePlan.isPending;

    return (
        <PermissionGuard permission="subscription_plans.view">
            <div className="space-y-5">
                <PageLoader open={isBusy} />

                {/* Header */}
                <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight text-foreground">Subscription Plans</h1>
                        <p className="text-xs text-muted-foreground">
                            Plans customers can subscribe to, scoped by event category, type and religion.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={exportCsv} disabled={plans.length === 0} className="h-9 gap-2">
                            <Download className="h-4 w-4" /> Export
                        </Button>
                        <Button onClick={() => router.push('/admin/subscriptions/create')} className="h-9 gap-2">
                            <Plus className="h-4 w-4" /> Add Plan
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card className="border-border bg-card shadow-xs">
                    <CardContent className="space-y-3 p-4">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
                            <div className="space-y-1.5 lg:col-span-1">
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
                                        placeholder="Search plan name, code, type..."
                                        className="h-10 pl-9"
                                    />
                                </div>
                            </div>

                            <FilterSelect
                                label="Event Category"
                                value={categoryId}
                                allLabel="All Categories"
                                options={categories?.data ?? []}
                                onChange={(v) => {
                                    setCategoryId(v);
                                    // A type/religion from the old category would filter to nothing.
                                    setTypeId(ALL);
                                    setReligionId(ALL);
                                    setPage(1);
                                }}
                            />
                            <FilterSelect
                                label="Event Type"
                                value={typeId}
                                allLabel="All Types"
                                options={eventTypes?.data ?? []}
                                onChange={(v) => {
                                    setTypeId(v);
                                    setReligionId(ALL);
                                    setPage(1);
                                }}
                            />
                            <FilterSelect
                                label="Religion"
                                value={religionId}
                                allLabel="All Religions"
                                options={religions?.data ?? []}
                                onChange={(v) => {
                                    setReligionId(v);
                                    setPage(1);
                                }}
                            />

                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    Status
                                </Label>
                                <Select
                                    value={status}
                                    onValueChange={(v) => {
                                        setStatus(v);
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ALL}>All Status</SelectItem>
                                        <SelectItem value="1">Active</SelectItem>
                                        <SelectItem value="0">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    Billing Cycle
                                </Label>
                                <Select
                                    value={cycle}
                                    onValueChange={(v) => {
                                        setCycle(v);
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ALL}>All Cycles</SelectItem>
                                        {BILLING_CYCLES.map((c) => (
                                            <SelectItem key={c.value} value={c.value}>
                                                {c.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={resetFilters}
                                disabled={!hasFilters}
                                className="h-9 gap-2 text-xs"
                            >
                                <RotateCcw className="h-3.5 w-3.5" /> Reset
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card className="border-border bg-card shadow-xs">
                    <CardContent className="p-0">
                        <div className="w-full overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-border/60 hover:bg-transparent">
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>Plan Name</TableHead>
                                        <TableHead>Plan Code</TableHead>
                                        <TableHead>Event Category</TableHead>
                                        <TableHead>Event Type</TableHead>
                                        <TableHead>Religion</TableHead>
                                        <TableHead>Billing Cycle</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                        <TableHead className="text-center">Total Menus</TableHead>
                                        <TableHead>Created On</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={12} className="py-16 text-center text-muted-foreground">
                                                Loading plans...
                                            </TableCell>
                                        </TableRow>
                                    ) : plans.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={12} className="py-16 text-center text-muted-foreground">
                                                {hasFilters
                                                    ? 'No plans match these filters.'
                                                    : 'No plans yet. Click "Add Plan" to create your first one.'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        plans.map((row, index) => {
                                            const locked = !!row.has_pending_approval;
                                            const rowNumber =
                                                ((pagination?.page ?? 1) - 1) * (pagination?.limit ?? limit) + index + 1;

                                            return (
                                                <TableRow key={row.id} className="border-b border-border/40">
                                                    <TableCell className="text-sm text-muted-foreground">{rowNumber}</TableCell>

                                                    <TableCell>
                                                        <div className="min-w-0">
                                                            <div className="break-all text-sm font-semibold text-foreground">
                                                                {row.name}
                                                            </div>
                                                            {row.short_description && (
                                                                <div className="max-w-[220px] break-all line-clamp-1 text-[11px] text-muted-foreground">
                                                                    {row.short_description}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>

                                                    <TableCell>
                                                        <span className="font-mono text-xs font-semibold">{row.plan_code}</span>
                                                    </TableCell>

                                                    {/* A null scope means the plan applies to everything. */}
                                                    <TableCell className="text-sm">
                                                        {row.category?.name ?? (
                                                            <span className="text-muted-foreground">All Categories</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {row.eventType?.name ?? (
                                                            <span className="text-muted-foreground">All Types</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {row.religion?.name ?? (
                                                            <span className="text-muted-foreground">All Religions</span>
                                                        )}
                                                    </TableCell>

                                                    <TableCell className="text-sm capitalize">{row.billing_cycle}</TableCell>

                                                    <TableCell className="whitespace-nowrap text-sm font-semibold tabular-nums">
                                                        {formatPlanPrice(row)}
                                                    </TableCell>

                                                    {/* Always a switch, as specified. */}
                                                    <TableCell className="text-center">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <Switch
                                                                checked={Number(row.is_active) === 1}
                                                                disabled={locked}
                                                                onCheckedChange={(v) =>
                                                                    updateStatus.mutate({ id: row.id, is_active: v })
                                                                }
                                                            />
                                                            {row.is_trial ? (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="border-sky-300 bg-sky-50 text-[10px] text-sky-700"
                                                                >
                                                                    Trial
                                                                </Badge>
                                                            ) : (
                                                                <span className="text-[10px] text-muted-foreground">
                                                                    {Number(row.is_active) === 1 ? 'Active' : 'Inactive'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="text-center text-sm font-semibold tabular-nums">
                                                        {row.total_menus}
                                                    </TableCell>

                                                    <TableCell className="whitespace-nowrap text-sm">
                                                        {formatDateTime(row.created_at)}
                                                    </TableCell>

                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48">
                                                                <DropdownMenuItem
                                                                    onClick={() => router.push(`/admin/subscriptions/${row.id}`)}
                                                                >
                                                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    disabled={locked}
                                                                    onClick={() =>
                                                                        router.push(`/admin/subscriptions/create?id=${row.id}`)
                                                                    }
                                                                >
                                                                    <Pencil className="mr-2 h-4 w-4" /> Edit Plan
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    disabled={locked}
                                                                    onClick={() => duplicatePlan.mutate(row.id)}
                                                                >
                                                                    <Copy className="mr-2 h-4 w-4" /> Duplicate Plan
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    disabled={locked}
                                                                    onClick={() =>
                                                                        router.push(`/admin/subscriptions/create?id=${row.id}&step=2`)
                                                                    }
                                                                >
                                                                    <LayoutList className="mr-2 h-4 w-4" /> Manage Menus
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    disabled={locked}
                                                                    onClick={() =>
                                                                        updateStatus.mutate({
                                                                            id: row.id,
                                                                            is_active: Number(row.is_active) !== 1,
                                                                        })
                                                                    }
                                                                >
                                                                    {Number(row.is_active) === 1 ? 'Deactivate' : 'Activate'}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    disabled={locked}
                                                                    onClick={() => setDeleteId(row.id)}
                                                                    className="text-destructive focus:text-destructive"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Plan
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

                        {pagination && (
                            <div className="px-4 pb-4">
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

                <DeleteDialog
                    open={deleteId !== null}
                    onOpenChange={(open: boolean) => !open && setDeleteId(null)}
                    title="Delete Plan"
                    description="Are you sure you want to delete this subscription plan? Its menu selection and limits are removed too. This action cannot be undone."
                    isDeleting={deletePlan.isPending}
                    onConfirm={() => {
                        if (deleteId !== null) {
                            deletePlan.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
                        }
                    }}
                />
            </div>
        </PermissionGuard>
    );
}

function FilterSelect({
    label,
    value,
    allLabel,
    options,
    onChange,
}: {
    label: string;
    value: string;
    allLabel: string;
    options: Array<{ id: number; name: string }>;
    onChange: (value: string) => void;
}) {
    return (
        <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="h-10">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={ALL}>{allLabel}</SelectItem>
                    {options.map((o) => (
                        <SelectItem key={o.id} value={String(o.id)}>
                            {o.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
