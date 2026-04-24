"use client";

import React from "react";
import { PlusCircle } from "lucide-react";
import { BLOCK_CATALOG } from "@/types/home-blocks";
import { cn } from "@/lib/utils";

interface BlockPaletteProps {
  addedTypes: Set<string>;
  onOpenVariantPicker: (blockType: string) => void;
}

export default function BlockPalette({ addedTypes, onOpenVariantPicker }: BlockPaletteProps) {
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/40">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">UI Blocks</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">Click to choose a variant</p>
      </div>

      <div className="flex flex-col divide-y">
        {BLOCK_CATALOG.map((entry) => {
          const isAdded = addedTypes.has(entry.block_type);
          const Icon = entry.icon;

          return (
            <button
              key={entry.block_type}
              id={`palette-${entry.block_type}`}
              onClick={() => !isAdded && onOpenVariantPicker(entry.block_type)}
              disabled={isAdded}
              className={cn(
                "flex items-start gap-3 px-4 py-3 text-left transition-colors w-full",
                isAdded
                  ? "opacity-40 cursor-not-allowed bg-muted/20"
                  : "hover:bg-accent cursor-pointer"
              )}
            >
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-background shadow-sm">
                <Icon className="size-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold leading-tight">{entry.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">{entry.description}</p>
              </div>
              {!isAdded && <PlusCircle className="size-4 shrink-0 mt-1 text-primary/60" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
