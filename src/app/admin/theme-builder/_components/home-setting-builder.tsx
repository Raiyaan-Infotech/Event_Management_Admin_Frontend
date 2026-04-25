"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { HomeBlock } from "@/types/home-blocks";
import BlockPalette from "./block-palette";
import ComposedList from "./composed-list";
import VariantPicker from "./variant-picker";
import { useUiBlocksCatalog } from "@/hooks/use-ui-blocks";
import { Skeleton } from "@/components/ui/skeleton";

export interface HomeSettingBuilderProps {
  initialBlocks?: HomeBlock[];
  onBlocksChange?: (blocks: HomeBlock[]) => void;
}

interface EditPickerState {
  blockType: string;
  currentVariant: string;
}

export default function HomeSettingBuilder({ initialBlocks, onBlocksChange }: HomeSettingBuilderProps) {
  const [blocks, setBlocks] = useState<HomeBlock[]>(initialBlocks ?? []);

  // "Add" picker — opens when clicking a block in the palette
  const [pickerBlockType, setPickerBlockType] = useState<string | null>(null);

  // "Edit" picker — opens when clicking the Settings icon on an existing block
  const [editPicker, setEditPicker] = useState<EditPickerState | null>(null);

  const { data: catalog = [], isLoading: catalogLoading } = useUiBlocksCatalog();

  useEffect(() => {
    if (initialBlocks) setBlocks(initialBlocks);
  }, [initialBlocks]);

  // ── Add flow ──────────────────────────────────────────────────────────────
  const handleAdd = (blockType: string, variantId: string) => {
    if (blocks.some(b => b.block_type === blockType)) return;
    const updated = [...blocks, { block_type: blockType, variant: variantId, is_visible: true }];
    setBlocks(updated);
    onBlocksChange?.(updated);
  };

  // ── Edit variant flow ─────────────────────────────────────────────────────
  const handleEditVariant = (blockType: string, variantId: string) => {
    const updated = blocks.map(b =>
      b.block_type === blockType ? { ...b, variant: variantId } : b
    );
    setBlocks(updated);
    onBlocksChange?.(updated);
  };

  const handleListChange = (updated: HomeBlock[]) => {
    setBlocks(updated);
    onBlocksChange?.(updated);
  };

  const addedTypes = useMemo(() => new Set(blocks.map(b => b.block_type)), [blocks]);

  if (catalogLoading) {
    return <Skeleton className="h-[400px] w-full rounded-xl" />;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
        <BlockPalette
          addedTypes={addedTypes}
          onOpenVariantPicker={(blockType) => setPickerBlockType(blockType)}
          catalog={catalog}
        />
        <ComposedList
          blocks={blocks}
          onChange={handleListChange}
          catalog={catalog}
          onOpenEditPicker={(blockType, currentVariant) =>
            setEditPicker({ blockType, currentVariant })
          }
        />
      </div>

      {/* Add picker */}
      <VariantPicker
        blockType={pickerBlockType}
        onConfirm={handleAdd}
        onClose={() => setPickerBlockType(null)}
        catalog={catalog}
      />

      {/* Edit picker */}
      <VariantPicker
        blockType={editPicker?.blockType ?? null}
        initialVariant={editPicker?.currentVariant}
        isEditMode
        onConfirm={handleEditVariant}
        onClose={() => setEditPicker(null)}
        catalog={catalog}
      />
    </>
  );
}

