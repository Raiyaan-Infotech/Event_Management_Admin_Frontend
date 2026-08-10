'use client';

import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { GripVertical, Link as LinkIcon, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MultiSelectPages } from './multi-select-pages';

export interface ChildMenuItem {
    id: string;
    label: string;
    iconKey?: string;
    link?: string | null;
    required?: boolean;
}

export interface DraggableItemListItem {
    id: string | number;
    label: string;
    icon?: LucideIcon;
    description?: string;
    children?: ChildMenuItem[];
    locked?: boolean;
    required?: boolean;
    /**
     * The database row id, when this item is backed by a saved row.
     *
     * Distinct from `id`, which callers set to a page slug ('home', 'features')
     * so the list can be matched against page options. Translations are
     * addressed by the row id, so it has to survive that mapping — dropping it
     * is what made nav-menu labels untranslatable.
     */
    dbId?: number;
}

export interface PageOption {
    label: string;
    value: string;
    icon?: LucideIcon;
}

interface DraggableItemListProps {
    items: DraggableItemListItem[];
    pageOptions?: PageOption[];
    onDelete?: (item: DraggableItemListItem) => void;
    onReorder?: (items: DraggableItemListItem[]) => void;
    onAddChild?: (parentId: string | number, child: ChildMenuItem) => void;
    onDeleteChild?: (parentId: string | number, childId: string) => void;
    /** Extra per-row controls, rendered left of the built-in buttons. */
    renderActions?: (item: DraggableItemListItem) => React.ReactNode;
    emptyText?: string;
    className?: string;
}

function childPageValue(child: ChildMenuItem): string {
    if (child.iconKey) return child.iconKey;
    if (child.link) return String(child.link).replace(/^\/+/, '');
    return '';
}

function pageChildValues(children: ChildMenuItem[], pageOptions: PageOption[]) {
    const validValues = new Set(pageOptions.map((option) => option.value));
    return children
        .map(childPageValue)
        .filter((value) => value !== '' && validValues.has(value));
}

function ChildPagePicker({
    parentId,
    children,
    pageOptions,
    onAddChild,
    onDeleteChild,
    onClose,
}: {
    parentId: string | number;
    children: ChildMenuItem[];
    pageOptions: PageOption[];
    onAddChild?: (parentId: string | number, child: ChildMenuItem) => void;
    onDeleteChild?: (parentId: string | number, childId: string) => void;
    onClose: () => void;
}) {
    const panelRef = React.useRef<HTMLDivElement>(null);
    const selectedValues = pageChildValues(children, pageOptions);

    React.useEffect(() => {
        function handlePointerDown(event: MouseEvent) {
            const target = event.target as Node;
            if (panelRef.current?.contains(target)) return;
            if (target instanceof Element && target.closest('[data-child-menu-toggle]')) {
                return;
            }
            onClose();
        }
        document.addEventListener('mousedown', handlePointerDown);
        return () => document.removeEventListener('mousedown', handlePointerDown);
    }, [onClose]);

    const handleChange = (nextValues: string[]) => {
        const addedValues = nextValues.filter((value) => !selectedValues.includes(value));
        const removedValues = selectedValues.filter((value) => !nextValues.includes(value));

        let didAdd = false;
        addedValues.forEach((value) => {
            const option = pageOptions.find((page) => page.value === value);
            if (!option) return;

            onAddChild?.(parentId, {
                id: `child-${value}-${Date.now()}`,
                label: option.label,
                iconKey: value,
                link: null,
            });
            didAdd = true;
        });

        removedValues.forEach((value) => {
            const child = children.find((item) => childPageValue(item) === value);
            if (child) {
                onDeleteChild?.(parentId, child.id);
            }
        });

        if (didAdd) {
            onClose();
        }
    };

    return (
        <div
            ref={panelRef}
            className="mx-3 mb-2.5 rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2"
        >
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="text-xs font-bold text-primary">Add Child Menu</p>
                    <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                        Select pages to show below this menu item.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded p-1 text-muted-foreground hover:bg-card hover:text-foreground"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>

            <MultiSelectPages
                value={selectedValues}
                options={pageOptions}
                onChange={handleChange}
                placeholder="Add child page"
            />
        </div>
    );
}

function ChildRow({ child, onDelete }: { child: ChildMenuItem; onDelete: () => void }) {
    return (
        <div className="relative flex items-center gap-2 rounded-md border bg-card/60 px-3 py-2 text-xs">
            <span className="absolute -left-[18px] top-1/2 h-px w-[14px] bg-border" />
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                <LinkIcon className="h-3 w-3" />
            </span>
            <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-foreground">{child.label}</p>
                {child.link ? <p className="truncate text-[10px] text-muted-foreground">{child.link}</p> : null}
            </div>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:bg-destructive/10 shrink-0"
                onClick={onDelete}
            >
                <Trash2 className="h-3.5 w-3.5" />
            </Button>
        </div>
    );
}

export function DraggableItemList({
    items,
    pageOptions = [],
    onDelete,
    onReorder,
    onAddChild,
    onDeleteChild,
    renderActions,
    emptyText = 'No items added.',
    className,
}: DraggableItemListProps) {
    const dragItemIndex = React.useRef<number | null>(null);
    const dragOverItemIndex = React.useRef<number | null>(null);
    const [draggingIndex, setDraggingIndex] = React.useState<number | null>(null);
    const [overIndex, setOverIndex] = React.useState<number | null>(null);
    const [expandedParentId, setExpandedParentId] = React.useState<string | number | null>(null);

    const handleDragStart = (index: number) => {
        if (items[index]?.locked) return;
        dragItemIndex.current = index;
        setDraggingIndex(index);
    };

    const handleDragEnter = (index: number) => {
        if (dragItemIndex.current === null || items[dragItemIndex.current]?.locked) return;
        dragOverItemIndex.current = index;
        setOverIndex(index);
    };

    const handleDragEnd = () => {
        if (
            dragItemIndex.current !== null &&
            dragOverItemIndex.current !== null &&
            dragItemIndex.current !== dragOverItemIndex.current
        ) {
            const reordered = [...items];
            const [moved] = reordered.splice(dragItemIndex.current, 1);
            if (!moved?.locked) {
                reordered.splice(dragOverItemIndex.current, 0, moved);
                onReorder?.(reordered);
            }
        }
        dragItemIndex.current = null;
        dragOverItemIndex.current = null;
        setDraggingIndex(null);
        setOverIndex(null);
    };

    if (!items.length) {
        return <div className={cn('rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground', className)}>{emptyText}</div>;
    }

    return (
        <div className={cn('space-y-2', className)}>
            {items.map((item, index) => {
                const IconComponent = item.icon || LinkIcon;
                const isDragging = draggingIndex === index;
                const isOver = overIndex === index && draggingIndex !== index;
                const children = item.children ?? [];
                const isChildPickerOpen = expandedParentId === item.id;

                return (
                    <div
                        key={item.id}
                        draggable={!item.locked}
                        onDragStart={() => handleDragStart(index)}
                        onDragEnter={() => handleDragEnter(index)}
                        onDragOver={(e) => e.preventDefault()}
                        onDragEnd={handleDragEnd}
                        className={cn(
                            'rounded-lg border bg-card transition-all',
                            isDragging && 'opacity-40 scale-[0.99] border-dashed border-primary',
                            isOver && 'border-primary bg-primary/5'
                        )}
                    >
                        <div className="flex items-center justify-between p-3">
                            <div className="flex items-center gap-3">
                                <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground/60 active:cursor-grabbing" />
                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                                    <IconComponent className="h-4 w-4" />
                                </div>
                                <span className="text-xs font-bold text-foreground">{item.label}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                {renderActions?.(item)}

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    data-child-menu-toggle
                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                    onClick={() => setExpandedParentId(isChildPickerOpen ? null : item.id)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => onDelete?.(item)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Child Menu Picker */}
                        {isChildPickerOpen && (
                            <ChildPagePicker
                                parentId={item.id}
                                children={children}
                                pageOptions={pageOptions}
                                onAddChild={onAddChild}
                                onDeleteChild={onDeleteChild}
                                onClose={() => setExpandedParentId(null)}
                            />
                        )}

                        {/* Child Rows */}
                        {children.length > 0 && (
                            <div className="ml-8 mr-3 mb-3 pl-3 border-l space-y-1.5">
                                {children.map((child) => (
                                    <ChildRow
                                        key={child.id}
                                        child={child}
                                        onDelete={() => onDeleteChild?.(item.id, child.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export function AddCustomLinkRow({ onAdd }: { onAdd: (name: string, link: string) => void }) {
    const [open, setOpen] = React.useState(false);
    const [name, setName] = React.useState('');
    const [link, setLink] = React.useState('');

    const handleAdd = () => {
        if (!name.trim()) return;
        onAdd(name.trim(), link.trim());
        setName('');
        setLink('');
        setOpen(false);
    };

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-primary/50 text-xs font-bold text-primary transition-colors hover:bg-primary/5"
            >
                <Plus className="h-4 w-4" />
                Add Custom Link
            </button>
        );
    }

    return (
        <div className="space-y-3 rounded-lg border border-primary/40 bg-primary/5 p-3.5">
            <p className="text-xs font-bold text-primary">New Custom Link</p>

            <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Menu Name</label>
                <input
                    type="text"
                    placeholder="e.g. Blog, Portfolio..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                />
            </div>

            <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Link URL</label>
                <input
                    type="text"
                    placeholder="https://..."
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="w-full rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                />
            </div>

            <div className="flex gap-2 pt-1">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        setName('');
                        setLink('');
                        setOpen(false);
                    }}
                    className="flex-1 text-xs"
                >
                    Cancel
                </Button>
                <Button
                    type="button"
                    onClick={handleAdd}
                    className="flex-1 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    Add
                </Button>
            </div>
        </div>
    );
}
