'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Search,
    RotateCcw,
    Globe,
    Smartphone,
    MoreVertical,
    Eye,
    Pencil,
    Copy,
    ArrowUp,
    ArrowDown,
    Trash2,
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
import { DynamicIcon } from '@/components/common/dynamic-icon';
import { cn } from '@/lib/utils';
import {
    useEventMenus,
    useEventCategories,
    useEventTypes,
    useReligions,
    useUpdateEventMenuStatus,
    useDuplicateEventMenu,
    useReorderEventMenus,
    useDeleteEventMenu,
} from '@/hooks/use-menu-management';

const ALL = 'all';

export default function MenuListPage() {
    const router = useRouter();

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [menuType, setMenuType] = useState(ALL);
    const [categoryId, setCategoryId] = useState(ALL);
    const [typeId, setTypeId] = useState(ALL);
    const [religionId, setReligionId] = useState(ALL);

    const [deleteId, setDeleteId] = useState<number | null>(null);

    const { data, isLoading } = useEventMenus({
        page,
        limit,
        search: search || undefined,
        menu_type: menuType === ALL ? undefined : menuType,
        event_category_id: categoryId === ALL ? undefined : categoryId,
        event_type_id: typeId === ALL ? undefined : typeId,
        religion_id: religionId === ALL ? undefined : religionId,
    });

    // Filter dropdowns. limit:200 because a filter that only lists the first
    // page of options silently hides the rest.
    const { data: categories } = useEventCategories({ limit: 200, is_active: true });
    // Event Type options narrow to the chosen category, so the two filters
    // cannot contradict each other.
    const { data: eventTypes } = useEventTypes({
        limit: 200,
        is_active: true,
        event_category_id: categoryId === ALL ? undefined : categoryId,
    });
    // Religions are scoped under (category, type) too, so this narrows with the
    // other two filters rather than listing every religion in the company.
    const { data: religions } = useReligions({
        limit: 200,
        is_active: true,
        event_category_id: categoryId === ALL ? undefined : categoryId,
        event_type_id: typeId === ALL ? undefined : typeId,
    });

    const updateStatus = useUpdateEventMenuStatus();
    const duplicateMenu = useDuplicateEventMenu();
    const reorderMenus = useReorderEventMenus();
    const deleteMenu = useDeleteEventMenu();

    const menus = data?.data ?? [];
    const pagination = data?.pagination ?? null;
    const hasFilters =
        !!search || menuType !== ALL || categoryId !== ALL || typeId !== ALL || religionId !== ALL;

    const clearFilters = () => {
        setSearch('');
        setMenuType(ALL);
        setCategoryId(ALL);
        setTypeId(ALL);
        setReligionId(ALL);
        setPage(1);
    };

    /**
     * The Change Order column's arrows — move one row up or down by one position.
     *
     * Only the rows on screen are reordered: the arrows reuse the pool of
     * sort_order values this page already holds, so rows on other pages keep
     * their positions. That also means the first and last row of a page cannot
     * step across the page boundary — the neighbour they would swap with is not
     * loaded — so those two arrows are disabled.
     *
     * Ties are renumbered rather than swapped. `parseSort` orders on sort_order
     * alone with no tiebreak, so swapping two rows that already share a value
     * writes the same numbers back and the row visibly does not move.
     */
    const moveRow = (index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= menus.length) return;

        const reordered = [...menus];
        [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

        const pool = menus.map((m) => Number(m.sort_order) || 0).sort((a, b) => a - b);
        const hasTies = new Set(pool).size !== pool.length;
        const base = pool[0] ?? 0;

        reorderMenus.mutate(
            reordered.map((row, i) => ({
                id: row.id,
                sort_order: hasTies ? base + i : pool[i],
            }))
        );
    };

    // isLoading covers the first fetch; a background refetch must not flash
    // the overlay over a table that already has rows.
    const isBusy =
        isLoading || duplicateMenu.isPending || deleteMenu.isPending || reorderMenus.isPending;

    return (
        <PermissionGuard permission="event_menus.view">
            <div className="space-y-5">
                <PageLoader open={isBusy} text={isLoading ? "Loading menus..." : "Loading..."} />

                {/* Header */}
                <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight text-foreground">Menu List</h1>
                        <p className="text-xs text-muted-foreground">
                            Menus shown on the website and mobile app, grouped by event category, type and religion.
                        </p>
                    </div>

                    <Button
                        onClick={() => router.push('/admin/menu-management/menus/create')}
                        className="h-9 gap-2"
                    >
                        <Plus className="h-4 w-4" /> Add New Menu
                    </Button>
                </div>

                {/* Filters */}
                <Card className="border-border bg-card shadow-xs">
                    <CardContent className="space-y-3 p-4">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                            <div className="space-y-1.5">
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
                                        placeholder="Search menu name..."
                                        className="h-10 pl-9"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    Menu Type
                                </Label>
                                <Select
                                    value={menuType}
                                    onValueChange={(v) => {
                                        setMenuType(v);
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ALL}>All</SelectItem>
                                        <SelectItem value="website">Website</SelectItem>
                                        <SelectItem value="mobile">Mobile App</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    Event Category
                                </Label>
                                <Select
                                    value={categoryId}
                                    onValueChange={(v) => {
                                        setCategoryId(v);
                                        // The chosen type and religion may not belong
                                        // to the new category, which would filter to
                                        // nothing.
                                        setTypeId(ALL);
                                        setReligionId(ALL);
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ALL}>All</SelectItem>
                                        {(categories?.data ?? []).map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    Event Type
                                </Label>
                                <Select
                                    value={typeId}
                                    onValueChange={(v) => {
                                        setTypeId(v);
                                        // Religion is scoped to the type.
                                        setReligionId(ALL);
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ALL}>All</SelectItem>
                                        {(eventTypes?.data ?? []).map((t) => (
                                            <SelectItem key={t.id} value={String(t.id)}>
                                                {t.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    Religion
                                </Label>
                                <Select
                                    value={religionId}
                                    onValueChange={(v) => {
                                        setReligionId(v);
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ALL}>All</SelectItem>
                                        {(religions?.data ?? []).map((r) => (
                                            <SelectItem key={r.id} value={String(r.id)}>
                                                {r.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={clearFilters}
                                disabled={!hasFilters}
                                className="h-9 gap-2 text-xs"
                            >
                                <RotateCcw className="h-3.5 w-3.5" /> Clear Filters
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
                                    {/* The four Display/Active toggle columns were removed: with 13
                                        columns the Menu Name cell collapsed to one character per line.
                                        Those flags are still set in the Add/Edit form and shown in the
                                        View dialog. */}
                                    <TableRow className="border-b border-border/60 hover:bg-transparent">
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead className="min-w-[200px]">Menu Name</TableHead>
                                        <TableHead className="whitespace-nowrap">Menu Type</TableHead>
                                        <TableHead className="whitespace-nowrap text-center">Change Order</TableHead>
                                        <TableHead className="whitespace-nowrap">Event Category</TableHead>
                                        <TableHead className="whitespace-nowrap">Event Type</TableHead>
                                        <TableHead className="whitespace-nowrap">Religion</TableHead>
                                        <TableHead className="whitespace-nowrap text-center">Sort Order</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={10} className="py-16 text-center text-muted-foreground">
                                                Loading menus...
                                            </TableCell>
                                        </TableRow>
                                    ) : menus.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={10} className="py-16 text-center text-muted-foreground">
                                                {hasFilters
                                                    ? 'No menus match these filters.'
                                                    : 'No menus yet. Click "Add New Menu" to create your first one.'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        menus.map((row, index) => {
                                            const locked = !!row.has_pending_approval;
                                            const rowNumber =
                                                ((pagination?.page ?? 1) - 1) * (pagination?.limit ?? limit) + index + 1;

                                            return (
                                                <TableRow key={row.id} className="border-b border-border/40">
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {rowNumber}
                                                    </TableCell>

                                                    <TableCell>
                                                        <div className="flex items-center gap-2.5">
                                                            <span
                                                                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40"
                                                                style={row.color ? { borderColor: `${row.color}33` } : undefined}
                                                            >
                                                                <DynamicIcon name={row.icon} color={row.color} size="h-4 w-4" />
                                                            </span>
                                                            <div className="min-w-0">
                                                                <div className="break-all text-sm font-semibold text-foreground">
                                                                    {row.name}
                                                                </div>
                                                                <div className="break-all font-mono text-[11px] text-muted-foreground">
                                                                    /{row.slug}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>

                                                    <TableCell>
                                                        <div className="flex items-center gap-1.5">
                                                            {row.is_website ? (
                                                                <span
                                                                    title="Website"
                                                                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-primary/30 bg-primary/5 text-primary"
                                                                >
                                                                    <Globe className="h-3.5 w-3.5" />
                                                                </span>
                                                            ) : null}
                                                            {row.is_mobile ? (
                                                                <span
                                                                    title="Mobile App"
                                                                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-primary/30 bg-primary/5 text-primary"
                                                                >
                                                                    <Smartphone className="h-3.5 w-3.5" />
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                    </TableCell>

                                                    <TableCell>
                                                        <div className="flex items-center justify-center gap-1">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                                title="Move up"
                                                                aria-label={`Move ${row.name} up`}
                                                                disabled={index === 0 || reorderMenus.isPending}
                                                                onClick={() => moveRow(index, -1)}
                                                                className="h-7 w-7 rounded-md"
                                                            >
                                                                <ArrowUp className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                                title="Move down"
                                                                aria-label={`Move ${row.name} down`}
                                                                disabled={
                                                                    index === menus.length - 1 || reorderMenus.isPending
                                                                }
                                                                onClick={() => moveRow(index, 1)}
                                                                className="h-7 w-7 rounded-md"
                                                            >
                                                                <ArrowDown className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>

                                                    <TableCell>
                                                        <TaxonomyBadge
                                                            value={row.category?.name}
                                                            color={row.category?.color}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <TaxonomyBadge
                                                            value={row.eventType?.name}
                                                            color={row.eventType?.color}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <TaxonomyBadge
                                                            value={row.religion?.name}
                                                            color={row.religion?.color}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="text-center text-sm font-semibold tabular-nums">
                                                        {row.sort_order}
                                                    </TableCell>

                                                    <TableCell className="text-center">
                                                        {/* A row awaiting approval keeps the badge: its status is
                                                            not the admin's to flip until the request is decided. */}
                                                        {Number(row.is_active) === 2 ? (
                                                            <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
                                                                Pending
                                                            </Badge>
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-1">
                                                                <Switch
                                                                    checked={Number(row.is_active) === 1}
                                                                    disabled={locked}
                                                                    onCheckedChange={(v) =>
                                                                        updateStatus.mutate({ id: row.id, is_active: v })
                                                                    }
                                                                />
                                                                <span
                                                                    className={cn(
                                                                        'text-[10px] font-semibold',
                                                                        Number(row.is_active) === 1
                                                                            ? 'text-emerald-600'
                                                                            : 'text-muted-foreground'
                                                                    )}
                                                                >
                                                                    {Number(row.is_active) === 1 ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </TableCell>

                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-8 w-8 rounded-lg"
                                                                >
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-44">
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        router.push(`/admin/menu-management/menus/${row.id}`)
                                                                    }
                                                                >
                                                                    <Eye className="mr-2 h-4 w-4" /> View
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    disabled={locked}
                                                                    onClick={() =>
                                                                        router.push(
                                                                            `/admin/menu-management/menus/create?id=${row.id}`
                                                                        )
                                                                    }
                                                                >
                                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    disabled={locked}
                                                                    onClick={() => duplicateMenu.mutate(row.id)}
                                                                >
                                                                    <Copy className="mr-2 h-4 w-4" /> Duplicate
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    disabled={locked}
                                                                    onClick={() => setDeleteId(row.id)}
                                                                    className="text-destructive focus:text-destructive"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
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
                    title="Delete Menu"
                    description="Are you sure you want to delete this menu? This action cannot be undone."
                    isDeleting={deleteMenu.isPending}
                    onConfirm={() => {
                        if (deleteId !== null) {
                            deleteMenu.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
                        }
                    }}
                />
            </div>
        </PermissionGuard>
    );
}

/**
 * A taxonomy value (category / type / religion) as a badge, tinted from the
 * record's own colour.
 *
 * The colour drives the dot, border and background wash only — never the text.
 * These are admin-picked and some are very pale (#fdefc9 is real data), which
 * as a text colour would be illegible on a light chip. A record with no colour
 * degrades to a plain neutral chip rather than losing the badge.
 */
function TaxonomyBadge({ value, color }: { value?: string | null; color?: string | null }) {
    if (!value) return <span className="text-sm text-muted-foreground">—</span>;

    return (
        <Badge
            variant="outline"
            // Wraps rather than truncates — the table is auto-layout, so a
            // truncate here would collapse the column instead of clipping.
            className="max-w-[170px] gap-1.5 whitespace-normal break-words border-border bg-muted/40 text-[11px] font-medium leading-tight text-foreground"
            style={color ? { borderColor: `${color}55`, backgroundColor: `${color}14` } : undefined}
        >
            {color ? (
                <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                />
            ) : null}
            {value}
        </Badge>
    );
}
