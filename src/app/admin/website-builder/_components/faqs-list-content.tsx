'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Plus,
    ExternalLink,
    Search,
    Filter,
    RotateCcw,
    Pencil,
    Trash2,
    Rocket,
    Mail,
    Share2,
    Users,
    Calendar,
    BarChart3,
    Headphones,
    Shield,
    HelpCircle,
    Loader2
} from 'lucide-react';
import { useWebsiteFaqs, useDeleteWebsiteFaq, useUpdateWebsiteFaq, WebsiteFaq } from '@/hooks/useWebsiteFaqs';
import { useWebsiteFaqCategories } from '@/hooks/useWebsiteFaqCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DeleteDialog } from '@/components/common/delete-dialog';
import { TablePagination } from '@/components/common/table-pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// Icon Map for Category Pills
const ICON_MAP: Record<string, any> = {
    Rocket,
    Mail,
    Share2,
    Users,
    Calendar,
    BarChart3,
    Headphones,
    Shield,
    HelpCircle,
};

export function FaqsListContent() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const { data: categories = [] } = useWebsiteFaqCategories();
    const { data: rawFaqs = [], isLoading } = useWebsiteFaqs({
        search: search.trim(),
        category_id: selectedCategory,
        is_active: selectedStatus,
    });

    const deleteMutation = useDeleteWebsiteFaq();
    const updateMutation = useUpdateWebsiteFaq();

    const [deleteId, setDeleteId] = useState<number | null>(null);

    // Instant & Server Synchronized Filtering Logic
    const filteredFaqs = useMemo(() => {
        return rawFaqs.filter((faq) => {
            // Search query filter
            if (search.trim()) {
                const q = search.toLowerCase().trim();
                const questionMatch = faq.question?.toLowerCase().includes(q);
                const answerMatch = faq.answer?.toLowerCase().includes(q);
                const tagsMatch = faq.tags?.toLowerCase().includes(q);
                const catMatch = faq.category?.name?.toLowerCase().includes(q);
                if (!questionMatch && !answerMatch && !tagsMatch && !catMatch) {
                    return false;
                }
            }
            // Category filter
            if (selectedCategory && selectedCategory !== 'all') {
                if (String(faq.faq_category_id) !== String(selectedCategory)) {
                    return false;
                }
            }
            // Status filter
            if (selectedStatus && selectedStatus !== 'all') {
                const isActiveBool = Number(faq.is_active) === 1 || faq.is_active === true;
                const targetActive = selectedStatus === '1' || selectedStatus === 'true';
                if (isActiveBool !== targetActive) {
                    return false;
                }
            }
            return true;
        });
    }, [rawFaqs, search, selectedCategory, selectedStatus]);

    // Apply Filter Button Handler
    const handleApplyFilter = () => {
        setPage(1);
    };

    // Reset Filter Button Handler
    const handleResetFilter = () => {
        setSearch('');
        setSelectedCategory('all');
        setSelectedStatus('all');
        setPage(1);
    };

    // Pagination Slicing
    const paginatedFaqs = useMemo(() => {
        const start = (page - 1) * limit;
        return filteredFaqs.slice(start, start + limit);
    }, [filteredFaqs, page]);

    const totalPages = Math.ceil(filteredFaqs.length / limit) || 1;

    // Toggle Active Status
    const handleToggleStatus = (faq: WebsiteFaq) => {
        updateMutation.mutate({
            id: faq.id,
            data: { is_active: !(Number(faq.is_active) === 1 || faq.is_active === true) }
        });
    };

    // Dynamic Dropdown Label Helpers
    const categoryLabel = selectedCategory === 'all'
        ? 'All Categories'
        : (categories.find(c => String(c.id) === selectedCategory)?.name || 'All Categories');

    const statusLabel = selectedStatus === 'all'
        ? 'All Status'
        : (selectedStatus === '1' ? 'Active' : 'Inactive');

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-16 text-foreground">
            {/* Top Header & Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">FAQs</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Manage frequently asked questions that will be displayed to users.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open('/#faqs', '_blank')}
                        className="gap-2 border-border bg-card hover:bg-accent text-foreground font-semibold"
                    >
                        Preview FAQs
                        <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => router.push('/admin/website-builder/faqs/create')}
                        className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Add New FAQ
                    </Button>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <Card className="border-border bg-card shadow-xs overflow-hidden">
                <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full">
                        {/* Search Input */}
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search FAQs by question or answer..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
                                className="pl-9 h-9 text-xs border-border bg-background text-foreground w-full"
                            />
                        </div>

                        {/* All Categories Dropdown */}
                        <div className="w-full lg:w-48 shrink-0">
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="h-9 text-xs border-border bg-background text-foreground w-full">
                                    <SelectValue placeholder="All Categories">{categoryLabel}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={String(cat.id)}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* All Status Dropdown */}
                        <div className="w-full lg:w-36 shrink-0">
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger className="h-9 text-xs border-border bg-background text-foreground w-full">
                                    <SelectValue placeholder="All Status">{statusLabel}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="1">Active</SelectItem>
                                    <SelectItem value="0">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Filter & Reset Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                            <Button
                                size="sm"
                                onClick={handleApplyFilter}
                                className="h-9 px-4 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs shadow-xs whitespace-nowrap"
                            >
                                <Filter className="h-3.5 w-3.5" />
                                Filter
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleResetFilter}
                                className="h-9 px-3.5 gap-1.5 border-border bg-background hover:bg-accent text-foreground text-xs font-semibold whitespace-nowrap"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Reset
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* FAQs Data Table */}
            <Card className="border-border bg-card shadow-xs overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-bold uppercase tracking-wider text-[11px]">
                                    <th className="py-3 px-4 w-12 text-center">#</th>
                                    <th className="py-3 px-4 min-w-[280px]">Question</th>
                                    <th className="py-3 px-4 min-w-[160px]">Category</th>
                                    <th className="py-3 px-4 w-32">Status</th>
                                    <th className="py-3 px-4 w-20 text-center">Order</th>
                                    <th className="py-3 px-4 w-44">Updated On</th>
                                    <th className="py-3 px-4 w-28 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-muted-foreground">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                                            Loading FAQs...
                                        </td>
                                    </tr>
                                ) : paginatedFaqs.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-muted-foreground">
                                            No FAQs found. Click <strong>+ Add New FAQ</strong> to create one.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedFaqs.map((faq, index) => {
                                        const globalIndex = (page - 1) * limit + index + 1;
                                        const isActive = Number(faq.is_active) === 1 || faq.is_active === true;
                                        const catIconName = faq.category?.icon || 'HelpCircle';
                                        const IconComp = ICON_MAP[catIconName] || HelpCircle;
                                        const catColor = faq.category?.color || '#8B5CF6';

                                        const formattedDate = faq.updated_at
                                            ? new Date(faq.updated_at).toLocaleDateString('en-GB', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })
                                            : '—';

                                        return (
                                            <tr key={faq.id} className="hover:bg-muted/20 transition-colors">
                                                <td className="py-3.5 px-4 font-semibold text-muted-foreground text-center">
                                                    {globalIndex}
                                                </td>
                                                <td className="py-3.5 px-4 font-semibold text-foreground max-w-md truncate">
                                                    {faq.question}
                                                    {Boolean(faq.is_featured) && (
                                                        <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20 text-[10px] py-0 px-1.5">
                                                            Featured
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    {faq.category ? (
                                                        <span
                                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-xs"
                                                            style={{
                                                                backgroundColor: `${catColor}15`,
                                                                color: catColor,
                                                                border: `1px solid ${catColor}30`,
                                                            }}
                                                        >
                                                            <IconComp className="h-3.5 w-3.5" />
                                                            {faq.category.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <Switch
                                                            checked={isActive}
                                                            onCheckedChange={() => handleToggleStatus(faq)}
                                                        />
                                                        <span className={`text-xs font-bold ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                                                            {isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 text-center font-medium text-foreground">
                                                    {faq.sort_order ?? 0}
                                                </td>
                                                <td className="py-3.5 px-4 text-muted-foreground font-medium">
                                                    {formattedDate}
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => router.push(`/admin/website-builder/faqs/edit/${faq.id}`)}
                                                            className="h-8 w-8 rounded-lg border-border text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => setDeleteId(faq.id)}
                                                            className="h-8 w-8 rounded-lg border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-300 cursor-pointer"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {!isLoading && filteredFaqs.length > 0 && (
                        <div className="p-4 border-t border-border/80">
                            {filteredFaqs.length > limit ? (
                                <TablePagination
                                    pagination={{
                                        page,
                                        totalPages,
                                        totalItems: filteredFaqs.length,
                                        limit,
                                        hasNextPage: page < totalPages,
                                        hasPrevPage: page > 1,
                                    }}
                                    onPageChange={setPage}
                                    onLimitChange={(newLimit) => {
                                        setLimit(newLimit);
                                        setPage(1);
                                    }}
                                />
                            ) : (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
                                    <span>Showing 1 to {filteredFaqs.length} of {filteredFaqs.length} FAQs</span>
                                    <div className="flex items-center gap-1.5">
                                        <Button variant="outline" size="sm" className="h-8 px-3 text-xs border-border bg-card text-foreground cursor-pointer" disabled>
                                            Previous
                                        </Button>
                                        <Button variant="outline" size="sm" className="h-8 w-8 text-xs bg-primary text-primary-foreground border-primary font-bold shadow-xs">
                                            1
                                        </Button>
                                        <Button variant="outline" size="sm" className="h-8 px-3 text-xs border-border bg-card text-foreground cursor-pointer" disabled>
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <DeleteDialog
                open={!!deleteId}
                onOpenChange={(val) => !val && setDeleteId(null)}
                onConfirm={() => {
                    if (deleteId) {
                        deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
                    }
                }}
                title="Delete FAQ"
                description="Are you sure you want to delete this question? This action cannot be undone."
            />
        </div>
    );
}
