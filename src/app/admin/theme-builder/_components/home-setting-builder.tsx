"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { HomeBlock } from "@/types/home-blocks";
import BlockPalette from "./block-palette";
import ComposedList from "./composed-list";
import VariantPicker from "./variant-picker";

export interface HomeSettingBuilderProps {
  initialBlocks?: HomeBlock[];
  onBlocksChange?: (blocks: HomeBlock[]) => void;
}

export default function HomeSettingBuilder({ initialBlocks, onBlocksChange }: HomeSettingBuilderProps) {
  const [blocks, setBlocks] = useState<HomeBlock[]>(initialBlocks ?? []);
  const [pickerBlockType, setPickerBlockType] = useState<string | null>(null);

  useEffect(() => {
    if (initialBlocks) setBlocks(initialBlocks);
  }, [initialBlocks]);

  const handleAdd = (blockType: string, variantId: string) => {
    if (blocks.some(b => b.block_type === blockType)) return;
    const updated = [...blocks, { block_type: blockType, variant: variantId, is_visible: true }];
    setBlocks(updated);
    onBlocksChange?.(updated);
  };

  const handleListChange = (updated: HomeBlock[]) => {
    setBlocks(updated);
    onBlocksChange?.(updated);
  };

  const addedTypes = useMemo(() => new Set(blocks.map(b => b.block_type)), [blocks]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
        <BlockPalette
          addedTypes={addedTypes}
          onOpenVariantPicker={(blockType) => setPickerBlockType(blockType)}
        />
        <ComposedList blocks={blocks} onChange={handleListChange} />
      </div>

      <VariantPicker
        blockType={pickerBlockType}
        onConfirm={handleAdd}
        onClose={() => setPickerBlockType(null)}
      />
    </>
  );
}
