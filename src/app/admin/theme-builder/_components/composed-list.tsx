"use client";

import React from "react";
import Image from "next/image";
import { resolveMediaUrl } from "@/lib/utils";
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
import { GripVertical, Eye, EyeOff, X, ChevronDown, Settings } from "lucide-react";
import { BLOCK_CATALOG, type HomeBlock } from "@/types/home-blocks";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Minimal shape used for header/footer preview placeholders (admin has no vendor context)
type NavMenuChild = { page_id: number | string; label: string };
type NavMenuItem = { label: string; page_ids: Array<number | string>; order: number; children: NavMenuChild[] };
type FooterColumn = { heading: string; page_ids: Array<number | string> };
type VendorAbout = {
  company_name?: string;
  company_logo?: string;
  short_description?: string;
  company_contact?: string; contact?: string;
  company_email?: string;   email?: string;
  company_address?: string; address?: string;
  facebook?: string; twitter?: string; instagram?: string;
  youtube?: string;  linkedin?: string; whatsapp?: string;
  nav_menu?: NavMenuItem[];
  footer_links?: FooterColumn[];
  copywrite?: string | null;
  poweredby?: string | null;
  social_visibility?: Record<string, boolean>;
  district?: { name?: string };
  locality?: { name?: string };
};

// ─── Fixed site header preview ──────────────────────────────────────────────

const DEFAULT_NAV: NavMenuItem[] = [
  { label: "Home",       page_ids: [], order: 0, children: [] },
  { label: "About Us",   page_ids: [], order: 1, children: [] },
  { label: "Contact Us", page_ids: [], order: 2, children: [] },
];

function SiteHeaderPreview({ vendor }: { vendor?: VendorAbout }) {
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);

  const navItems: NavMenuItem[] =
    vendor?.nav_menu && vendor.nav_menu.length > 0
      ? vendor.nav_menu
      : DEFAULT_NAV;

  const city = vendor?.district?.name ?? vendor?.locality?.name ?? null;

  return (
    <div className="border rounded-lg bg-white dark:bg-zinc-900 shadow-sm">
      {/* label strip */}
      {/* <div className="px-3 py-1.5 bg-muted/50 border-b rounded-t-lg flex items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Header
        </span>
        <span className="text-[10px] text-muted-foreground">— fixed, not editable here</span>
      </div> */}

      {/* header preview row */}
      <div className="flex items-center px-4 py-3 gap-4">
        {/* Logo + company info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 shrink-0 rounded-md border bg-muted flex items-center justify-center overflow-hidden">
            {vendor?.company_logo ? (
              <Image
                src={resolveMediaUrl(vendor.company_logo)}
                alt="Logo"
                width={36}
                height={36}
                className="object-contain"
              />
            ) : (
              <span className="text-sm font-bold text-muted-foreground">
                {vendor?.company_name?.charAt(0)?.toUpperCase() ?? "V"}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-bold leading-tight truncate">
              {vendor?.company_name ?? "Company Name"}
            </p>
            {city && (
              <p className="text-[10px] text-muted-foreground truncate">{city}</p>
            )}
          </div>
        </div>

        {/* Nav menu */}
        <nav className="flex items-center gap-0.5 shrink-0">
          {navItems.slice(0, 6).map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = openMenu === item.label;

            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => hasChildren && setOpenMenu(item.label)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                {/* Nav link */}
                <span className="flex items-center gap-0.5 px-3 py-1.5 rounded text-[11px] font-semibold text-foreground/80 hover:bg-primary/10 hover:text-primary transition-colors cursor-default whitespace-nowrap select-none">
                  {item.label}
                  {hasChildren && (
                    <ChevronDown
                      className={`size-3 shrink-0 transition-transform duration-150 ${
                        isOpen ? "rotate-180 text-primary" : "text-muted-foreground/60"
                      }`}
                    />
                  )}
                </span>

                {/* Dropdown — reference layout, app colors */}
                {hasChildren && isOpen && (
                  <div className="absolute top-full left-0 mt-0.5 min-w-[180px] rounded-md border bg-card shadow-xl py-2 z-50">
                    {item.children.map((child) => (
                      <div
                        key={child.page_id}
                        className="px-4 py-2 hover:bg-accent cursor-default"
                      >
                        <p className="text-[11px] font-bold text-foreground leading-tight">
                          {child.label}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

// ─── Single sortable row ────────────────────────────────────────────────────

function SortableRow({
  block,
  onToggleVisibility,
  onRemove,
  onUpdateVariant,
}: {
  block: HomeBlock;
  onToggleVisibility: () => void;
  onRemove: () => void;
  onUpdateVariant: (variant: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.block_type });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const entry = BLOCK_CATALOG.find((c) => c.block_type === block.block_type);
  const Icon = entry?.icon;

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
        id={`drag-handle-${block.block_type}`}
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

      <Sheet>
        <SheetTrigger asChild>
          <button
            id={`settings-block-${block.block_type}`}
            className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Settings"
          >
            <Settings className="size-4" />
          </button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{entry?.label ?? block.block_type} Settings</SheetTitle>
            <SheetDescription>Configure the style and variant for this block.</SheetDescription>
          </SheetHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2.5">
              <Label>Visual Variant</Label>
              <Select
                value={block.variant || "variant_1"}
                onValueChange={(val) => onUpdateVariant(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select variant" />
                </SelectTrigger>
                <SelectContent>
                  {(entry?.variants ?? []).map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Change the design variant for this block.
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <button
        id={`toggle-visibility-${block.block_type}`}
        onClick={onToggleVisibility}
        className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        aria-label={block.is_visible ? "Hide block" : "Show block"}
      >
        {block.is_visible ? (
          <Eye className="size-4" />
        ) : (
          <EyeOff className="size-4 opacity-50" />
        )}
      </button>

      <button
        id={`remove-block-${block.block_type}`}
        onClick={onRemove}
        className="p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
        aria-label="Remove block"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

// ─── Fixed site footer preview ──────────────────────────────────────────────

function SiteFooterPreview({ vendor }: { vendor?: VendorAbout }) {
  const columns      = vendor?.footer_links ?? [];
  const copywrite    = vendor?.copywrite ?? null;
  const poweredby    = vendor?.poweredby ?? null;
  const socials      = vendor?.social_visibility ?? {};

  // Social icons — show only those with a URL + visible
  const socialLinks = [
    { key: "facebook",  icon: "f",  url: vendor?.facebook  },
    { key: "twitter",   icon: "𝕏",  url: vendor?.twitter   },
    { key: "instagram", icon: "ig", url: vendor?.instagram  },
    { key: "youtube",   icon: "▶",  url: vendor?.youtube   },
    { key: "linkedin",  icon: "in", url: vendor?.linkedin   },
    { key: "whatsapp",  icon: "w",  url: vendor?.whatsapp  },
  ].filter((s) => s.url && socials[s.key as keyof typeof socials] !== false);

  return (
    <div className="border rounded-lg bg-white dark:bg-zinc-900 shadow-sm">
      {/* label strip */}
      {/* <div className="px-3 py-1.5 bg-muted/50 border-b rounded-t-lg flex items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Footer
        </span>
        <span className="text-[10px] text-muted-foreground">— fixed, not editable here</span>
      </div> */}

      {/* footer body — horizontal columns */}
      <div className="flex flex-row gap-5 px-5 py-5 items-start">

        {/* Col 1 — Logo + description + social */}
        <div className="flex flex-col gap-2 w-[200px] shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 shrink-0 rounded border bg-muted flex items-center justify-center overflow-hidden">
              {vendor?.company_logo ? (
                <Image src={resolveMediaUrl(vendor.company_logo)} alt="Logo" width={32} height={32} className="object-contain" />
              ) : (
                <span className="text-xs font-bold text-muted-foreground">
                  {vendor?.company_name?.charAt(0)?.toUpperCase() ?? "V"}
                </span>
              )}
            </div>
            <p className="text-[12px] font-bold truncate">{vendor?.company_name ?? "Company Name"}</p>
          </div>

          <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-3">
            {vendor?.short_description ?? "Your company short description goes here."}
          </p>

          {socialLinks.length > 0 && (
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {socialLinks.map((s) => (
                <span key={s.key} className="h-6 w-6 rounded border text-[9px] font-bold flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                  {s.icon}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px self-stretch bg-border shrink-0" />

        {/* Col 2…N — footer_links columns from API */}
        <div className="flex flex-row gap-8 flex-1">
          {columns.length > 0 ? (
            columns.slice(0, 3).map((col, i) => (
              <div key={i} className="flex flex-col gap-1.5 min-w-[90px]">
                <p className="text-[11px] font-bold text-foreground">{col.heading}</p>
                {col.page_ids.length > 0 ? (
                  col.page_ids.slice(0, 6).map((pid) => (
                    <span key={pid} className="text-[10px] text-muted-foreground hover:text-foreground cursor-default">
                      Page #{pid}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-muted-foreground/50 italic">No pages</span>
                )}
              </div>
            ))
          ) : (
            <p className="text-[10px] text-muted-foreground/50 italic">
              No columns — edit in Website → Footer
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="w-px self-stretch bg-border shrink-0" />

        {/* Last col — Contact info */}
        <div className="flex flex-col gap-1.5 w-[180px] shrink-0">
          <p className="text-[11px] font-bold text-foreground">Contact</p>
          {(vendor?.company_contact || vendor?.contact) && (
            <p className="text-[10px] text-muted-foreground">📞 {vendor.company_contact ?? vendor.contact}</p>
          )}
          {(vendor?.company_email || vendor?.email) && (
            <p className="text-[10px] text-muted-foreground break-all">✉ {vendor.company_email ?? vendor.email}</p>
          )}
          {(vendor?.company_address || vendor?.address) && (
            <p className="text-[10px] text-muted-foreground leading-relaxed">📍 {vendor.company_address ?? vendor.address}</p>
          )}
        </div>
      </div>

      {/* copyright bar */}
      <div className="border-t px-5 py-2 flex items-center justify-between gap-2">
        <span className="text-[10px] text-muted-foreground truncate">
          {copywrite ?? "© Your Company. All rights reserved."}
        </span>
        {poweredby && (
          <span className="text-[10px] text-muted-foreground/60 shrink-0">
            Powered by {poweredby}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Composed list ──────────────────────────────────────────────────────────

interface ComposedListProps {
  blocks: HomeBlock[];
  onChange: (updated: HomeBlock[]) => void;
}

export default function ComposedList({ blocks, onChange }: ComposedListProps) {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((b) => b.block_type === active.id);
    const newIndex = blocks.findIndex((b) => b.block_type === over.id);
    onChange(arrayMove(blocks, oldIndex, newIndex));
  };

  const toggleVisibility = (block_type: string) => {
    onChange(
      blocks.map((b) =>
        b.block_type === block_type ? { ...b, is_visible: !b.is_visible } : b
      )
    );
  };

  const removeBlock = (block_type: string) => {
    onChange(blocks.filter((b) => b.block_type !== block_type));
  };

  const updateVariant = (block_type: string, variant: string) => {
    onChange(
      blocks.map((b) => (b.block_type === block_type ? { ...b, variant } : b))
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {/* ── Fixed header preview (always shown, not draggable) ── */}
      <SiteHeaderPreview />

      {/* ── Draggable blocks ── */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-muted-foreground gap-2 px-6">
            <p className="font-medium">No blocks added yet</p>
            <p className="text-xs">
              Click items in the{" "}
              <span className="font-semibold text-foreground">UI Blocks</span>{" "}
              panel to build your home page layout.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={blocks.map((b) => b.block_type)}
              strategy={verticalListSortingStrategy}
            >
              {blocks.map((block) => (
                <SortableRow
                  key={block.block_type}
                  block={block}
                  onToggleVisibility={() => toggleVisibility(block.block_type)}
                  onRemove={() => removeBlock(block.block_type)}
                  onUpdateVariant={(variant) => updateVariant(block.block_type, variant)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* ── Fixed footer preview (always shown, not draggable) ── */}
      <SiteFooterPreview />
    </div>
  );
}
