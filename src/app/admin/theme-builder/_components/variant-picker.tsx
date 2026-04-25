"use client";

import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type BlockCatalogEntry } from "@/types/home-blocks";
import { Check, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface VariantPickerProps {
  blockType: string | null;
  onConfirm: (blockType: string, variantId: string) => void;
  onClose: () => void;
  catalog: BlockCatalogEntry[];
  /** Pre-select this variant (used in edit mode) */
  initialVariant?: string;
  /** When true, shows "Save Changes" button label instead of "Add Block" */
  isEditMode?: boolean;
}

export default function VariantPicker({ blockType, onConfirm, onClose, catalog, initialVariant, isEditMode }: VariantPickerProps) {
  const [selected, setSelected] = React.useState<string>(initialVariant || "variant_1");

  const entry = catalog.find(c => c.block_type === blockType);
  const vendorUrl = process.env.NEXT_PUBLIC_VENDOR_URL || "";

  // When block type changes or initialVariant changes, sync selection
  React.useEffect(() => {
    setSelected(initialVariant || "variant_1");
  }, [blockType, initialVariant]);

  const handleConfirm = () => {
    if (!blockType) return;
    onConfirm(blockType, selected);
    onClose();
  };

  return (
    <Sheet open={!!blockType} onOpenChange={open => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 py-5 border-b shrink-0">
          <SheetTitle className="text-base flex items-center gap-2">
            {isEditMode ? <Pencil className="size-4 text-primary" /> : null}
            {isEditMode ? "Edit Variant" : "Choose Variant"} — <span className="text-primary">{entry?.label}</span>
          </SheetTitle>
          <p className="text-xs text-muted-foreground mt-0.5">{entry?.description}</p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {entry?.variants.map(v => {
            const isSelected = selected === v.id;
            const previewSrc = vendorUrl
              ? `${vendorUrl}/preview?block=${blockType}&variant=${v.id}&vendorId=1`
              : "";

            return (
              <div
                key={v.id}
                onClick={() => setSelected(v.id)}
                className={cn(
                  "rounded-xl border-2 overflow-hidden cursor-pointer transition-all",
                  isSelected
                    ? "border-primary shadow-md shadow-primary/10"
                    : "border-border hover:border-primary/40"
                )}
              >
                {/* Label row */}
                <div className={cn(
                  "flex items-center justify-between px-4 py-2.5 border-b",
                  isSelected ? "bg-primary/5" : "bg-muted/30"
                )}>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0",
                      isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                    )}>
                      {isSelected && <Check className="size-3 text-white" strokeWidth={3} />}
                    </div>
                    <span className="text-sm font-semibold">{v.label}</span>
                  </div>
                  <Badge variant={isSelected ? "default" : "outline"} className="text-[10px]">
                    {v.id.replace("_", " ")}
                  </Badge>
                </div>

                {/* iframe preview */}
                {previewSrc ? (
                  <div className="relative w-full bg-muted/10" style={{ height: 260 }}>
                    <iframe
                      src={previewSrc}
                      title={`${entry?.label} — ${v.label}`}
                      className="absolute inset-0 w-full h-full border-0 pointer-events-none"
                      style={{ transform: "scale(0.65)", transformOrigin: "top left", width: "154%", height: "154%" }}
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center text-xs text-muted-foreground bg-muted/20">
                    Set NEXT_PUBLIC_VENDOR_URL to see preview
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="shrink-0 border-t px-6 py-4 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm} className="gap-2 px-8">
            <Check className="size-4" /> {isEditMode ? "Save Changes" : "Add Block"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
