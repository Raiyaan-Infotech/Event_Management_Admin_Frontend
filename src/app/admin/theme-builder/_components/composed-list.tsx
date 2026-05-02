"use client";

import React from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff, X, Settings, Lock } from "lucide-react";
import { type HomeBlock, type BlockCatalogEntry, resolveIcon } from "@/types/home-blocks";
import { cn } from "@/lib/utils";

// ─── Locked row (header / footer — no drag, no remove) ──────────────────────

function LockedRow({
  block,
  onOpenEditPicker,
  catalog,
}: {
  block: HomeBlock;
  onOpenEditPicker: (blockType: string, currentVariant: string) => void;
  catalog: BlockCatalogEntry[];
}) {
  const entry = catalog.find((c) => c.block_type === block.block_type);
  const Icon  = entry ? resolveIcon(entry.icon) : null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b bg-muted/30">
      <div className="p-0.5 shrink-0 text-muted-foreground/30">
        <Lock className="size-4" />
      </div>

      {Icon && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-background shadow-sm">
          <Icon className="size-3.5 text-primary" />
        </div>
      )}

      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="text-[12px] font-semibold truncate">
          {entry?.label ?? block.block_type}
        </span>
        {block.variant && (
          <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
            {block.variant.replace("_", " ")}
          </span>
        )}
        <span className="text-[10px] text-muted-foreground/50 italic">fixed</span>
      </div>

      <button
        onClick={() => onOpenEditPicker(block.block_type, block.variant || "variant_1")}
        className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Change variant"
      >
        <Settings className="size-4" />
      </button>
    </div>
  );
}

// ─── Sortable row ────────────────────────────────────────────────────────────

function SortableRow({
  block,
  onToggleVisibility,
  onRemove,
  onOpenEditPicker,
  catalog,
}: {
  block: HomeBlock;
  onToggleVisibility: () => void;
  onRemove: () => void;
  onOpenEditPicker: (blockType: string, currentVariant: string) => void;
  catalog: BlockCatalogEntry[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.block_type });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const entry = catalog.find((c) => c.block_type === block.block_type);
  const Icon  = entry ? resolveIcon(entry.icon) : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 px-4 py-3 border-b last:border-b-0 bg-card transition-shadow",
        isDragging && "shadow-lg rounded-md z-50"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-0.5 shrink-0"
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-4" />
      </button>

      {Icon && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-background shadow-sm">
          <Icon className="size-3.5 text-primary" />
        </div>
      )}

      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="text-[12px] font-semibold truncate">
          {entry?.label ?? block.block_type}
        </span>
        {block.variant && (
          <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
            {block.variant.replace("_", " ")}
          </span>
        )}
      </div>

      <button
        onClick={() => onOpenEditPicker(block.block_type, block.variant || "variant_1")}
        className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Change variant"
      >
        <Settings className="size-4" />
      </button>

      <button
        onClick={onToggleVisibility}
        className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        aria-label={block.is_visible ? "Hide block" : "Show block"}
      >
        {block.is_visible ? <Eye className="size-4" /> : <EyeOff className="size-4 opacity-50" />}
      </button>

      <button
        onClick={onRemove}
        className="p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
        aria-label="Remove block"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

// ─── Composed list ───────────────────────────────────────────────────────────

interface ComposedListProps {
  blocks: HomeBlock[];
  onChange: (updated: HomeBlock[]) => void;
  catalog: BlockCatalogEntry[];
  onOpenEditPicker: (blockType: string, currentVariant: string) => void;
}

export default function ComposedList({ blocks, onChange, catalog, onOpenEditPicker }: ComposedListProps) {
  const sensors = useSensors(useSensor(PointerSensor));

  const headerBlock = blocks.find((b) => b.block_type === "header");
  const footerBlock = blocks.find((b) => b.block_type === "footer");
  const bodyBlocks  = blocks.filter((b) => b.block_type !== "header" && b.block_type !== "footer");

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex  = bodyBlocks.findIndex((b) => b.block_type === active.id);
    const newIndex  = bodyBlocks.findIndex((b) => b.block_type === over.id);
    const reordered = arrayMove(bodyBlocks, oldIndex, newIndex);
    onChange([
      ...(headerBlock ? [headerBlock] : []),
      ...reordered,
      ...(footerBlock ? [footerBlock] : []),
    ]);
  };

  const toggleVisibility = (block_type: string) => {
    onChange(blocks.map((b) => b.block_type === block_type ? { ...b, is_visible: !b.is_visible } : b));
  };

  const removeBlock = (block_type: string) => {
    onChange(blocks.filter((b) => b.block_type !== block_type));
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Locked header row — always top */}
      {headerBlock && (
        <LockedRow block={headerBlock} catalog={catalog} onOpenEditPicker={onOpenEditPicker} />
      )}

      {/* Draggable body blocks */}
      {bodyBlocks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center text-sm text-muted-foreground gap-2 px-6">
          <p className="font-medium">No blocks added yet</p>
          <p className="text-xs">
            Click items in the <span className="font-semibold text-foreground">UI Blocks</span> panel to build your layout.
          </p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={bodyBlocks.map((b) => b.block_type)} strategy={verticalListSortingStrategy}>
            {bodyBlocks.map((block) => (
              <SortableRow
                key={block.block_type}
                block={block}
                catalog={catalog}
                onOpenEditPicker={onOpenEditPicker}
                onToggleVisibility={() => toggleVisibility(block.block_type)}
                onRemove={() => removeBlock(block.block_type)}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}

      {/* Locked footer row — always bottom */}
      {footerBlock && (
        <LockedRow block={footerBlock} catalog={catalog} onOpenEditPicker={onOpenEditPicker} />
      )}
    </div>
  );
}
