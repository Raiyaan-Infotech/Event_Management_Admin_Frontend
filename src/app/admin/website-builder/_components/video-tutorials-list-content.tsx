'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Search,
    RotateCcw,
    Pencil,
    Trash2,
    Eye,
    Loader2,
    Play,
    Clock,
    Sparkles,
    CheckCircle2,
    Tag,
    X,
    FileText,
    List,
    BarChart,
    HelpCircle
} from 'lucide-react';
import {
    useVideoTutorials,
    useDeleteVideoTutorial,
    useUpdateVideoTutorialStatus,
    useVideoTutorialCategories,
    useVideoTutorialSubCategories,
    useVideoTutorialDifficultyLevels,
    useVideoTutorialTypes,
    VideoTutorial
} from '@/hooks/useVideoTutorials';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DeleteDialog } from '@/components/common/delete-dialog';
import { TablePagination } from '@/components/common/table-pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

function formatDuration(seconds: number): string {
    if (!seconds || seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function VideoTutorialsListContent() {
    const router = useRouter();

    // Search & Filter State
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    // Pagination State
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    // Queries
    const { data: categories = [] } = useVideoTutorialCategories();
    const { data: subcategories = [] } = useVideoTutorialSubCategories({
        category_id: selectedCategory !== 'all' ? selectedCategory : undefined
    });
    const { data: difficultyLevels = [] } = useVideoTutorialDifficultyLevels();
    const { data: tutorialTypes = [] } = useVideoTutorialTypes();

    const { data: tutorials = [], isLoading } = useVideoTutorials({
        search: search.trim() || undefined,
        category_id: selectedCategory !== 'all' ? selectedCategory : undefined,
        subcategory_id: selectedSubCategory !== 'all' ? selectedSubCategory : undefined,
        difficulty_level_id: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
        is_active: selectedStatus !== 'all' ? selectedStatus : undefined,
    });

    // Mutations
    const deleteMutation = useDeleteVideoTutorial();
    const toggleStatusMutation = useUpdateVideoTutorialStatus();

    // Dialog States
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [previewTutorial, setPreviewTutorial] = useState<VideoTutorial | null>(null);

    // Filter Reset
    const handleResetFilter = () => {
        setSearch('');
        setSelectedCategory('all');
        setSelectedSubCategory('all');
        setSelectedDifficulty('all');
        setSelectedStatus('all');
        setPage(1);
    };

    // Client-side filtering fallback
    const filteredTutorials = useMemo(() => {
        return tutorials.filter((item) => {
            if (search.trim()) {
                const q = search.toLowerCase().trim();
                const titleMatch = item.title?.toLowerCase().includes(q);
                const descMatch = item.short_description?.toLowerCase().includes(q);
                if (!titleMatch && !descMatch) return false;
            }
            if (selectedCategory !== 'all' && String(item.category_id) !== selectedCategory) {
                return false;
            }
            if (selectedSubCategory !== 'all' && String(item.subcategory_id) !== selectedSubCategory) {
                return false;
            }
            if (selectedDifficulty !== 'all' && String(item.difficulty_level_id) !== selectedDifficulty) {
                return false;
            }
            if (selectedStatus !== 'all') {
                const isActiveBool = Number(item.is_active) === 1 || item.is_active === true;
                const targetActive = selectedStatus === '1' || selectedStatus === 'true';
                if (isActiveBool !== targetActive) return false;
            }
            return true;
        });
    }, [tutorials, search, selectedCategory, selectedSubCategory, selectedDifficulty, selectedStatus]);

    // Pagination Slicing
    const paginatedTutorials = useMemo(() => {
        const start = (page - 1) * limit;
        return filteredTutorials.slice(start, start + limit);
    }, [filteredTutorials, page, limit]);

    const totalPages = Math.ceil(filteredTutorials.length / limit) || 1;

    // Toggle Status
    const handleToggleStatus = (item: VideoTutorial) => {
        const currentActive = Number(item.is_active) === 1 || item.is_active === true;
        toggleStatusMutation.mutate({ id: item.id, is_active: !currentActive });
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-16 text-foreground">
            {/* Top Header & Add Tutorial Action */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-4">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                        Video Tutorials
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Manage and organize all video tutorials for your users.
                    </p>
                </div>
                <Button
                    size="sm"
                    onClick={() => router.push('/admin/website-builder/video-tutorials/create')}
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-sm cursor-pointer whitespace-nowrap"
                >
                    <Plus className="h-4 w-4" />
                    Add Tutorial
                </Button>
            </div>

            {/* Search & Multi-Filter Card */}
            <Card className="border-border bg-card shadow-xs overflow-hidden">
                <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full">
                        {/* Search Input */}
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search tutorials..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="pl-9 h-9 text-xs border-border bg-background text-foreground w-full"
                            />
                        </div>

                        {/* Category Dropdown */}
                        <div className="w-full lg:w-44 shrink-0">
                            <Select
                                value={selectedCategory}
                                onValueChange={(val) => {
                                    setSelectedCategory(val);
                                    setSelectedSubCategory('all');
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="h-9 text-xs border-border bg-background text-foreground w-full">
                                    <SelectValue placeholder="All Categories">
                                        {selectedCategory === 'all'
                                            ? 'All Categories'
                                            : categories.find((c) => String(c.id) === String(selectedCategory))?.name}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Sub Category Dropdown */}
                        <div className="w-full lg:w-44 shrink-0">
                            <Select
                                value={selectedSubCategory}
                                onValueChange={(val) => {
                                    setSelectedSubCategory(val);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="h-9 text-xs border-border bg-background text-foreground w-full">
                                    <SelectValue placeholder="All Sub Categories">
                                        {selectedSubCategory === 'all'
                                            ? 'All Sub Categories'
                                            : subcategories.find((sc) => String(sc.id) === String(selectedSubCategory))?.name}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Sub Categories</SelectItem>
                                    {subcategories.map((sc) => (
                                        <SelectItem key={sc.id} value={String(sc.id)}>
                                            {sc.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Difficulty Level Dropdown */}
                        <div className="w-full lg:w-36 shrink-0">
                            <Select
                                value={selectedDifficulty}
                                onValueChange={(val) => {
                                    setSelectedDifficulty(val);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="h-9 text-xs border-border bg-background text-foreground w-full">
                                    <SelectValue placeholder="All Levels">
                                        {selectedDifficulty === 'all'
                                            ? 'All Levels'
                                            : difficultyLevels.find((d) => String(d.id) === String(selectedDifficulty))?.name}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Levels</SelectItem>
                                    {difficultyLevels.map((d) => (
                                        <SelectItem key={d.id} value={String(d.id)}>
                                            {d.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status Dropdown */}
                        <div className="w-full lg:w-32 shrink-0">
                            <Select
                                value={selectedStatus}
                                onValueChange={(val) => {
                                    setSelectedStatus(val);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="h-9 text-xs border-border bg-background text-foreground w-full">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="1">Active</SelectItem>
                                    <SelectItem value="0">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Reset Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResetFilter}
                            className="h-9 px-3.5 gap-1.5 border-border bg-background hover:bg-accent text-foreground text-xs font-semibold whitespace-nowrap shrink-0"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Reset
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Video Tutorials Data Table */}
            <Card className="border-border bg-card shadow-xs overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-bold uppercase tracking-wider text-[11px]">
                                    <th className="py-3 px-4 w-12 text-center">#</th>
                                    <th className="py-3 px-4 min-w-[300px]">Tutorial</th>
                                    <th className="py-3 px-4 min-w-[140px]">Category</th>
                                    <th className="py-3 px-4 min-w-[150px]">Sub Category</th>
                                    <th className="py-3 px-4 min-w-[120px]">Difficulty</th>
                                    <th className="py-3 px-4 min-w-[140px]">Type</th>
                                    <th className="py-3 px-4 w-24">Duration</th>
                                    <th className="py-3 px-4 w-28">Status</th>
                                    <th className="py-3 px-4 w-36">Published On</th>
                                    <th className="py-3 px-4 w-28 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={10} className="py-16 text-center text-muted-foreground">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                                            Loading video tutorials...
                                        </td>
                                    </tr>
                                ) : paginatedTutorials.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="py-16 text-center text-muted-foreground">
                                            No video tutorials found. Click <strong>+ Add Tutorial</strong> to create one.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedTutorials.map((item, index) => {
                                        const globalIndex = (page - 1) * limit + index + 1;
                                        const isActive = Number(item.is_active) === 1 || item.is_active === true;
                                        const diffName = item.difficulty_name || 'Beginner';
                                        const diffColor = item.difficulty_color || '#22C55E';
                                        const typeName = item.type_name || 'Walkthrough';
                                        const formattedDate = item.publish_date || item.created_at
                                            ? new Date(item.publish_date || item.created_at!).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: '2-digit',
                                                year: 'numeric',
                                            })
                                            : '—';

                                        return (
                                            <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                                                {/* # Index */}
                                                <td className="py-3.5 px-4 font-semibold text-muted-foreground text-center">
                                                    {globalIndex}
                                                </td>

                                                {/* Tutorial Thumbnail + Title + Description */}
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative h-14 w-24 rounded-xl border border-border overflow-hidden bg-slate-900 shrink-0 shadow-xs group">
                                                            {item.thumbnail_url ? (
                                                                <img src={item.thumbnail_url} alt={item.title} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary">
                                                                    <Play className="h-5 w-5 fill-primary" />
                                                                </div>
                                                            )}
                                                            <div className="absolute bottom-1 right-1 bg-black/80 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded shadow-xs">
                                                                {formatDuration(item.duration_seconds)}
                                                            </div>
                                                        </div>
                                                        <div className="min-w-0 flex-1 space-y-0.5">
                                                            <h4 className="font-extrabold text-foreground text-xs leading-snug line-clamp-1">
                                                                {item.title}
                                                            </h4>
                                                            <p className="text-[11px] text-muted-foreground line-clamp-1">
                                                                {item.short_description || 'No description available.'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Category Pill */}
                                                <td className="py-3.5 px-4">
                                                    {item.category_name ? (
                                                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold text-[11px] px-2.5 py-0.5">
                                                            {item.category_name}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </td>

                                                {/* Sub Category Text */}
                                                <td className="py-3.5 px-4 text-foreground font-semibold text-xs">
                                                    {item.subcategory_name || '—'}
                                                </td>

                                                {/* Difficulty Pill */}
                                                <td className="py-3.5 px-4">
                                                    <span
                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold shadow-xs"
                                                        style={{
                                                            backgroundColor: `${diffColor}18`,
                                                            color: diffColor,
                                                            border: `1px solid ${diffColor}35`,
                                                        }}
                                                    >
                                                        {diffName}
                                                    </span>
                                                </td>

                                                {/* Type Name */}
                                                <td className="py-3.5 px-4 font-semibold text-xs text-foreground">
                                                    {typeName}
                                                </td>

                                                {/* Duration */}
                                                <td className="py-3.5 px-4 text-foreground font-bold text-xs">
                                                    {formatDuration(item.duration_seconds)}
                                                </td>

                                                {/* Status Switch */}
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <Switch
                                                            checked={isActive}
                                                            onCheckedChange={() => handleToggleStatus(item)}
                                                        />
                                                        <span className={`text-xs font-bold ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                                                            {isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Published On */}
                                                <td className="py-3.5 px-4 text-muted-foreground font-medium text-xs">
                                                    {formattedDate}
                                                </td>

                                                {/* Actions */}
                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => router.push(`/admin/website-builder/video-tutorials/edit/${item.id}`)}
                                                            className="h-8 w-8 rounded-lg border-border text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/10 cursor-pointer"
                                                            title="Edit Tutorial"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => setPreviewTutorial(item)}
                                                            className="h-8 w-8 rounded-lg border-border text-muted-foreground hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 cursor-pointer"
                                                            title="Preview Tutorial"
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => setDeleteId(item.id)}
                                                            className="h-8 w-8 rounded-lg border-rose-200 text-rose-500 hover:bg-rose-50 hover:border-rose-300 cursor-pointer"
                                                            title="Delete Tutorial"
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

                    {/* Table Pagination Footer */}
                    {!isLoading && filteredTutorials.length > 0 && (
                        <div className="p-4 border-t border-border/80">
                            {filteredTutorials.length > limit ? (
                                <TablePagination
                                    pagination={{
                                        page,
                                        totalPages,
                                        totalItems: filteredTutorials.length,
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
                                    <span>Showing 1 to {filteredTutorials.length} of {filteredTutorials.length} tutorials</span>
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

            {/* Video Preview Modal */}
            <Dialog open={!!previewTutorial} onOpenChange={(open) => !open && setPreviewTutorial(null)}>
                <DialogContent className="max-w-3xl bg-card border-border text-foreground p-6 rounded-2xl shadow-xl">
                    {previewTutorial && (
                        <div className="space-y-4">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-extrabold text-foreground flex items-center justify-between gap-4">
                                    <span className="truncate">{previewTutorial.title}</span>
                                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                                        {previewTutorial.category_name || 'Tutorial'}
                                    </Badge>
                                </DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground">
                                    {previewTutorial.short_description}
                                </DialogDescription>
                            </DialogHeader>

                            {/* Player / Thumbnail View */}
                            <div className="relative aspect-video rounded-2xl border border-border overflow-hidden bg-slate-950 flex items-center justify-center shadow-inner">
                                {previewTutorial.video_url && (previewTutorial.video_url.includes('youtube') || previewTutorial.video_url.includes('youtu.be')) ? (
                                    <iframe
                                        src={previewTutorial.video_url.replace('watch?v=', 'embed/')}
                                        className="h-full w-full"
                                        allowFullScreen
                                    />
                                ) : previewTutorial.video_file_url ? (
                                    <video src={previewTutorial.video_file_url} controls className="h-full w-full object-contain" />
                                ) : previewTutorial.thumbnail_url ? (
                                    <div className="relative h-full w-full">
                                        <img src={previewTutorial.thumbnail_url} alt="Thumbnail" className="h-full w-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <div className="h-14 w-14 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg">
                                                <Play className="h-6 w-6 fill-primary-foreground ml-0.5" />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center space-y-2 text-slate-400">
                                        <Play className="h-10 w-10 mx-auto text-primary" />
                                        <p className="text-xs">No video preview available.</p>
                                    </div>
                                )}
                            </div>

                            {/* Key Takeaways */}
                            {previewTutorial.key_takeaways && (
                                <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1.5">
                                    <h5 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                        <Sparkles className="h-4 w-4 text-primary" />
                                        What You'll Learn (Key Takeaways)
                                    </h5>
                                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                                        {previewTutorial.key_takeaways}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <DeleteDialog
                open={!!deleteId}
                onOpenChange={(val) => !val && setDeleteId(null)}
                onConfirm={() => {
                    if (deleteId) {
                        deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
                    }
                }}
                title="Delete Video Tutorial"
                description="Are you sure you want to delete this video tutorial? This action cannot be undone."
            />
        </div>
    );
}
