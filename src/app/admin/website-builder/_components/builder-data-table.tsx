'use client';

import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, GripVertical, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface Column<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T, index: number) => React.ReactNode;
    className?: string;
    headerClassName?: string;
}

export interface FilterOption {
    value: string;
    label: string;
}

export interface FilterConfig {
    id: string;
    placeholder: string;
    value: string;
    onChange: (val: string) => void;
    options: FilterOption[];
    widthClass?: string;
}

export interface BuilderDataTableProps<T> {
    title: string;
    totalCount?: number;
    searchPlaceholder?: string;
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
    filters?: FilterConfig[];
    extraHeaderActions?: React.ReactNode;
    columns: Column<T>[];
    data: T[];
    isLoading?: boolean;
    emptyMessage?: string;
    keyExtractor: (item: T, index: number) => string | number;
    pageSize?: number;
    enableDragAndDrop?: boolean;
    onReorder?: (reorderedData: T[]) => void;
}

export function BuilderDataTable<T>({
    title,
    totalCount,
    searchPlaceholder = 'Search...',
    searchQuery,
    onSearchChange,
    filters = [],
    extraHeaderActions,
    columns,
    data = [],
    isLoading = false,
    emptyMessage = 'No records found.',
    keyExtractor,
    pageSize = 10,
    enableDragAndDrop = true,
    onReorder,
}: BuilderDataTableProps<T>) {
    const [currentPage, setCurrentPage] = useState(1);
    const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

    const totalRecords = totalCount !== undefined ? totalCount : data.length;
    const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = data.slice(startIndex, startIndex + pageSize);

    const handleSearchInput = (val: string) => {
        if (onSearchChange) {
            onSearchChange(val);
            setCurrentPage(1);
        }
    };

    const handleDragStart = (e: React.DragEvent, idx: number) => {
        if (!enableDragAndDrop) return;
        setDraggedIdx(idx);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        if (!enableDragAndDrop) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetIdx: number) => {
        if (!enableDragAndDrop) return;
        e.preventDefault();
        if (draggedIdx === null || draggedIdx === targetIdx) return;

        const reordered = [...data];
        const [moved] = reordered.splice(draggedIdx, 1);
        reordered.splice(targetIdx, 0, moved);

        setDraggedIdx(null);
        if (onReorder) {
            onReorder(reordered);
        }
    };

    return (
        <Card className="shadow-xs border-border bg-card">
            {/* Header: Title, Search, Filters, Extra Actions */}
            <CardHeader className="py-3 px-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-muted/40">
                <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
                    <span>{title} ({totalRecords})</span>
                </CardTitle>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {/* Search Input */}
                    {onSearchChange !== undefined ? (
                        <div className="relative w-full sm:w-56">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                placeholder={searchPlaceholder}
                                value={searchQuery || ''}
                                onChange={(e) => handleSearchInput(e.target.value)}
                                className="h-8 pl-8 text-xs border-border bg-card text-foreground placeholder:text-muted-foreground"
                            />
                        </div>
                    ) : null}

                    {/* Filter Dropdowns */}
                    {filters.map((f) => (
                        <div key={f.id} className={f.widthClass || 'w-36'}>
                            <Select
                                value={f.value}
                                onValueChange={(val) => {
                                    f.onChange(val);
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="h-8 text-xs border-border bg-card text-foreground">
                                    <SelectValue placeholder={f.placeholder}>
                                        {f.options.find((opt) => opt.value === f.value)?.label || f.placeholder}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {f.options.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ))}

                    {/* Extra Header Actions */}
                    {extraHeaderActions}
                </div>
            </CardHeader>

            {/* Table Content */}
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-muted/50 text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
                            <tr>
                                {enableDragAndDrop ? <th className="py-2.5 px-3 w-12 text-center">#</th> : null}
                                {columns.map((col, idx) => (
                                    <th key={idx} className={cn('py-2.5 px-3', col.headerClassName)}>
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={columns.length + (enableDragAndDrop ? 1 : 0)} className="py-8 text-center text-xs text-muted-foreground">
                                        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                                        Loading records...
                                    </td>
                                </tr>
                            ) : paginatedData.length > 0 ? (
                                paginatedData.map((item, idx) => {
                                    const realIdx = startIndex + idx;
                                    return (
                                        <tr
                                            key={keyExtractor(item, realIdx)}
                                            draggable={enableDragAndDrop}
                                            onDragStart={(e) => handleDragStart(e, realIdx)}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, realIdx)}
                                            className={cn(
                                                'hover:bg-muted/40 transition-colors',
                                                draggedIdx === realIdx && 'opacity-50 bg-primary/5'
                                            )}
                                        >
                                            {enableDragAndDrop ? (
                                                <td className="py-3 px-3 text-center text-muted-foreground font-mono cursor-grab active:cursor-grabbing">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50" />
                                                        <span>{realIdx + 1}</span>
                                                    </div>
                                                </td>
                                            ) : null}

                                            {columns.map((col, colIdx) => (
                                                <td key={colIdx} className={cn('py-3 px-3', col.className)}>
                                                    {col.cell ? col.cell(item, realIdx) : String(col.accessorKey ? item[col.accessorKey] ?? '' : '')}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={columns.length + (enableDragAndDrop ? 1 : 0)} className="py-8 text-center text-xs text-muted-foreground">
                                        {emptyMessage}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/40 text-xs text-muted-foreground">
                    <span>
                        Showing {data.length === 0 ? 0 : startIndex + 1} to{' '}
                        {Math.min(startIndex + pageSize, data.length)} of {data.length} entries
                    </span>
                    <div className="flex items-center gap-1.5">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="h-7 px-2.5 text-xs font-semibold border-border cursor-pointer disabled:opacity-50"
                        >
                            <ChevronLeft className="h-3.5 w-3.5 mr-0.5" /> Previous
                        </Button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={page === currentPage ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className={cn(
                                    'h-7 w-7 p-0 text-xs font-bold cursor-pointer',
                                    page === currentPage
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'border-border text-foreground hover:bg-muted'
                                )}
                            >
                                {page}
                            </Button>
                        ))}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="h-7 px-2.5 text-xs font-semibold border-border cursor-pointer disabled:opacity-50"
                        >
                            Next <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
