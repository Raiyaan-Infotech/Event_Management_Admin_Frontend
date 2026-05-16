"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useThemes, useTheme, useCreateTheme, useUpdateTheme } from "@/hooks/use-themes";
import { useColorPalettes, type ColorPalette } from "@/hooks/use-color-palettes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Palette, Check, AlertTriangle, Eye, Monitor, Tablet, Smartphone, RefreshCw, PanelRightOpen, PanelRightClose } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import HomeSettingBuilder from "./home-setting-builder";
import type { HomeBlock } from "@/types/home-blocks";
import { PageLoader } from "@/components/common/page-loader";
import { useSearchParams } from "next/navigation";
import { useSubscriptions } from "@/hooks/use-subscriptions";
import { normalizeHomeBlocks, safeParseArray } from "@/lib/safe-json";

const PREVIEW_VENDOR_ID = "1";

export default function ThemeBuilderWrapper() {
  const router = useRouter();
  const { isLoading: themesLoading } = useThemes({ page: 1, limit: 100 });
  const { data: palettesRes } = useColorPalettes({ limit: 100, is_active: 1 });

  const createTheme = useCreateTheme();
  const updateTheme = useUpdateTheme();

  // ── Live preview state ────────────────────────────────────────────────────
  const [showPreview, setShowPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [livePreviewUrl, setLivePreviewUrl] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0);

  const searchParams = useSearchParams();
  const queryThemeId = searchParams.get("themeId") || null;
  const editingThemeId = useMemo(() => {
    if (!queryThemeId) return null;
    const parsed = Number.parseInt(queryThemeId, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }, [queryThemeId]);

  // Fetch the full theme detail (includes home_blocks) when editing — list endpoint omits home_blocks
  const { data: editingTheme, isLoading: editingThemeLoading } = useTheme(editingThemeId ?? 0);

  const { data: plansRes } = useSubscriptions({ page: 1, limit: 100 });
  const subPlans  = useMemo(() => plansRes?.data ?? [], [plansRes]);
  const validPlanIds = useMemo(() => new Set(subPlans.map((plan) => plan.id)), [subPlans]);
  const palettes  = useMemo(() => palettesRes?.data ?? [], [palettesRes]);
  const normalizedHomeBlocks = useMemo(
    () => normalizeHomeBlocks(editingTheme?.home_blocks) as HomeBlock[],
    [editingTheme?.home_blocks]
  );
  const builderKey = useMemo(
    () => `${editingThemeId ?? "new"}-${normalizedHomeBlocks.map((block) => `${block.block_type}:${block.variant}:${block.is_visible}`).join("|")}`,
    [editingThemeId, normalizedHomeBlocks]
  );

  // Local Form State
  const [formData, setFormData] = useState({
    name: "",
    plans: [] as number[],
    palette_id: null as number | null,
    primary_color: "#3b82f6",
    secondary_color: "#1e40af",
    text_color: "#1f2937",
    header_color: "#ffffff",
    footer_color: "#f9fafb",
    hover_color: "#eff6ff",
    preview_image: null as string | null,
    home_blocks: [] as HomeBlock[],
  });

  // header + footer are always rendered structurally (PublicNavbar/PublicFooter)
  // Only content blocks that need explicit inclusion are required.
  const REQUIRED_BLOCKS: string[] = [];
  const missingBlocks = useMemo(
    () => REQUIRED_BLOCKS.filter(r => !formData.home_blocks.some(b => b.block_type === r)),
    [formData.home_blocks]
  );

  // EDIT MODE: pre-fill form from the detail endpoint (includes home_blocks)
  useEffect(() => {
    if (!editingThemeId || !editingTheme) return;
    const t = editingTheme;
    setFormData({
      name: t.name || "",
      plans: safeParseArray<number | string>(t.plans)
        .map((p) => Number(p))
        .filter((planId) => validPlanIds.has(planId)),
      palette_id: (t as any).palette_id ?? null,
      primary_color: t.primary_color || "#3b82f6",
      secondary_color: t.secondary_color || "#1e40af",
      text_color: t.text_color || "#1f2937",
      header_color: t.header_color || "#ffffff",
      footer_color: t.footer_color || "#f9fafb",
      hover_color: t.hover_color || "#eff6ff",
      preview_image: t.preview_image || null,
      home_blocks: normalizedHomeBlocks,
    });
  }, [editingThemeId, editingTheme, normalizedHomeBlocks, validPlanIds]);

  // When a palette is selected, copy its colors into the form and track palette_id
  const handlePaletteSelect = (paletteId: string) => {
    if (paletteId === "none") {
      setFormData(prev => ({ ...prev, palette_id: null }));
      return;
    }
    const found = palettes.find((p: ColorPalette) => p.id.toString() === paletteId);
    if (!found) return;
    setFormData(prev => ({
      ...prev,
      palette_id:      found.id,
      primary_color:   found.primary_color   || prev.primary_color,
      secondary_color: found.secondary_color || prev.secondary_color,
      text_color:      found.text_color      || prev.text_color,
      header_color:    found.header_color    || prev.header_color,
      footer_color:    found.footer_color    || prev.footer_color,
      hover_color:     found.hover_color     || prev.hover_color,
    }));
  };

  const previewUrl = useMemo(() => {
    if (!formData.home_blocks.length) return null;
    const blocks = formData.home_blocks.map(b => ({
      block_type: b.block_type,
      variant: b.variant || "variant_1",
      is_visible: b.is_visible !== false,
    }));
    const params = new URLSearchParams({ vendorId: PREVIEW_VENDOR_ID });
    if (editingThemeId) params.set("themeId", editingThemeId.toString());
    if (blocks.length) params.set("blocks", btoa(JSON.stringify(blocks)));
    if (formData.primary_color)   params.set("primary",   formData.primary_color);
    if (formData.secondary_color) params.set("secondary", formData.secondary_color);
    if (formData.header_color)    params.set("header",    formData.header_color);
    if (formData.footer_color)    params.set("footer",    formData.footer_color);
    if (formData.text_color)      params.set("text",      formData.text_color);
    if (formData.hover_color)     params.set("hover",     formData.hover_color);
    const vendorBaseUrl = process.env.NEXT_PUBLIC_VENDOR_URL || "http://localhost:3001";
    return `${vendorBaseUrl}/preview?${params.toString()}`;
  }, [editingThemeId, formData]);

  // Debounce live preview URL — refresh iframe 1.2s after any change
  useEffect(() => {
    if (!showPreview || !previewUrl) return;
    const t = setTimeout(() => setLivePreviewUrl(previewUrl), 1200);
    return () => clearTimeout(t);
  }, [previewUrl, showPreview]);

  const deviceWidth: Record<string, string> = {
    desktop: "100%",
    tablet:  "768px",
    mobile:  "390px",
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Theme name is required.');
      document.getElementById('theme-name-input')?.focus();
      return;
    }
    if (!formData.palette_id) {
      toast.error('Color palette is required.');
      return;
    }
    const payload = { ...formData, is_active: 1, palette_id: formData.palette_id ?? null };

    if (editingThemeId) {
      updateTheme.mutate({ id: editingThemeId, data: payload });
    } else {
      createTheme.mutate(payload, {
        onSuccess: (data: any) => {
          const newId = data?.id;
          if (newId) router.push(`/admin/theme-builder?themeId=${newId}`);
        },
      });
    }
  };

  if (themesLoading || (editingThemeId && editingThemeLoading)) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[300px] rounded-xl" />
          <Skeleton className="h-[300px] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageLoader open={createTheme.isPending || updateTheme.isPending} />

      {/* --- TOP: THEME SELECTION --- */}
      <div className="bg-card p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1 space-y-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Palette className="size-4" /> Active Configuration
          </h2>
          
          <div className="flex flex-row items-end gap-5 mt-3 flex-wrap">

            {/* Field 1: Color Palette picker */}
            <div className="space-y-1.5 flex-1 min-w-[200px]">
              <Label className="text-xs uppercase text-muted-foreground">Color Palette <span className="text-destructive">*</span></Label>
              <Select
                value={formData.palette_id?.toString() ?? "none"}
                onValueChange={handlePaletteSelect}
              >
                <SelectTrigger className="w-full font-medium h-11">
                  <SelectValue placeholder="— Pick a palette —" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" disabled className="text-muted-foreground italic">— Pick a palette —</SelectItem>
                  {palettes.map((p: ColorPalette) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[p.primary_color, p.secondary_color, p.text_color, p.header_color, p.footer_color, p.hover_color].filter(Boolean).map((c, i) => (
                            <span key={i} className="w-3 h-3 rounded-full border border-black/10 inline-block" style={{ backgroundColor: c! }} />
                          ))}
                        </div>
                        {p.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Field 2: Editable Theme Name Input */}
            <div className="space-y-1.5 flex-1 min-w-[200px]">
              <Label className="text-xs uppercase text-muted-foreground">Theme Name <span className="text-destructive">*</span></Label>
              <Input
                id="theme-name-input"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                placeholder="e.g. Ocean Blue"
                className="w-full h-11 font-medium text-foreground text-sm"
              />
            </div>

            {/* Field 3: Multi-Plan Assignment */}
            <div className="space-y-1.5 flex-[2] min-w-[300px]">
              <Label className="text-xs uppercase text-muted-foreground mr-2">Assigned Plans</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between h-11 bg-background font-medium hover:bg-muted/20"
                  >
                    <div className="flex flex-wrap gap-1.5 items-center max-w-[90%] overflow-hidden">
                      {formData.plans.length > 0 ? (
                        formData.plans.map(id => {
                          const plan = subPlans.find(p => p.id === id);
                          if (!plan) return null;
                          return (
                            <Badge
                              key={id}
                              variant="secondary"
                              className="h-6 rounded-full border border-border/60 bg-muted px-2.5 text-[10px] font-semibold text-foreground shadow-none"
                            >
                              {plan.name}
                            </Badge>
                          );
                        })
                      ) : (
                        <span className="text-sm text-muted-foreground">Assign plans...</span>
                      )}
                    </div>
                    <span className="ml-3 text-xs font-semibold text-muted-foreground">
                      {formData.plans.length > 0 ? `${formData.plans.length} selected` : ""}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[340px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search plans..." />
                    <CommandList>
                      <CommandEmpty>No plan found.</CommandEmpty>
                      <CommandGroup>
                        {subPlans.map((plan) => {
                          const isSelected = formData.plans.includes(plan.id);
                          return (
                            <CommandItem
                              key={plan.id}
                              className="flex items-center gap-2 px-3 py-2.5"
                              onSelect={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  plans: isSelected
                                    ? prev.plans.filter(id => id !== plan.id)
                                    : [...prev.plans, plan.id]
                                }));
                              }}
                            >
                              <div className={cn(
                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                              )}>
                                <Check className={cn("h-3 w-3")} />
                              </div>
                              <span className="font-medium">{plan.name}</span>
                              <span className="ml-auto text-xs text-muted-foreground">${plan.price}</span>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {missingBlocks.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-1.5">
              <AlertTriangle className="size-3.5 shrink-0" />
              <span>Missing required blocks: <strong>{missingBlocks.join(', ')}</strong></span>
            </div>
          )}
          <div className="flex items-center gap-2">
            {previewUrl && (
              <Link
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-md border border-border bg-background text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                <Eye className="size-4" /> Preview
              </Link>
            )}
            <Button
              variant="outline"
              className="gap-2 h-11 px-5"
              onClick={() => {
                setShowPreview(v => !v);
                if (!showPreview && previewUrl) setLivePreviewUrl(previewUrl);
              }}
            >
              {showPreview ? <PanelRightClose className="size-4" /> : <PanelRightOpen className="size-4" />}
              {showPreview ? "Close Preview" : "Live Preview"}
            </Button>
            <Button className="gap-2 h-11 px-6 shadow-lg shadow-primary/20" onClick={handleSave}>
              <Save className="size-4" /> {editingThemeId ? "Save Changes" : "Create Theme"}
            </Button>
          </div>
        </div>
      </div>

      {showPreview ? (
        /* ── SPLIT-SCREEN: Builder left, Live Preview right ── */
        <div className="grid grid-cols-[1fr_1fr] gap-4 items-start" style={{ minHeight: "calc(100vh - 280px)" }}>
          {/* Left — block builder */}
          <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-5 border-b bg-muted/30">
              <h3 className="font-bold">Home Page Layout</h3>
              <p className="text-xs text-muted-foreground">Arrange visual blocks for this theme</p>
            </div>
            <div className="p-6">
              <HomeSettingBuilder
                key={builderKey}
                initialBlocks={editingThemeId && normalizedHomeBlocks.length > 0 ? normalizedHomeBlocks : formData.home_blocks}
                onBlocksChange={(blocks) => setFormData(p => ({ ...p, home_blocks: blocks }))}
              />
            </div>
          </div>

          {/* Right — live iframe */}
          <div className="sticky top-4 rounded-2xl border shadow-sm overflow-hidden flex flex-col bg-card" style={{ height: "calc(100vh - 120px)" }}>
            {/* Toolbar */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-muted/30 shrink-0">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">Live Preview</span>

              {/* Device buttons */}
              <div className="flex items-center gap-1 ml-auto">
                {(["desktop", "tablet", "mobile"] as const).map((d) => {
                  const Icon = d === "desktop" ? Monitor : d === "tablet" ? Tablet : Smartphone;
                  return (
                    <button
                      key={d}
                      onClick={() => setPreviewDevice(d)}
                      className={cn(
                        "p-1.5 rounded-md transition-colors",
                        previewDevice === d
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                      title={d.charAt(0).toUpperCase() + d.slice(1)}
                    >
                      <Icon className="size-4" />
                    </button>
                  );
                })}
              </div>

              <div className="w-px h-4 bg-border mx-1" />

              {/* Refresh */}
              <button
                onClick={() => { setLivePreviewUrl(previewUrl); setIframeKey(k => k + 1); }}
                className="p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                title="Refresh preview"
              >
                <RefreshCw className="size-4" />
              </button>

              {/* Open in tab */}
              {previewUrl && (
                <Link
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  title="Open in new tab"
                >
                  <Eye className="size-4" />
                </Link>
              )}
            </div>

            {/* iframe container */}
            <div className="flex-1 overflow-hidden flex items-start justify-center bg-muted/20 p-3">
              {livePreviewUrl ? (
                <iframe
                  key={iframeKey}
                  src={livePreviewUrl}
                  style={{
                    width: deviceWidth[previewDevice],
                    maxWidth: "100%",
                    height: "100%",
                    border: "none",
                    borderRadius: "8px",
                    background: "white",
                    transition: "width 0.3s ease",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
                  }}
                  title="Live Preview"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground h-full">
                  <Monitor className="size-10 opacity-20" />
                  <p className="text-sm font-medium">Waiting for changes…</p>
                  <p className="text-xs">Preview auto-refreshes 1.2s after any edit</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 items-start">
          {/* --- HOME BLOCK BUILDER --- */}
          <div className="bg-card p-1 rounded-2xl border shadow-sm overflow-hidden min-h-[800px]">
            <div className="p-5 border-b bg-muted/30 flex items-center justify-between">
              <div>
                <h3 className="font-bold">Home Page Layout</h3>
                <p className="text-xs text-muted-foreground">Arrange visual blocks for this theme</p>
              </div>
            </div>
            <div className="p-6">
              <HomeSettingBuilder
                key={builderKey}
                initialBlocks={editingThemeId && normalizedHomeBlocks.length > 0 ? normalizedHomeBlocks : formData.home_blocks}
                onBlocksChange={(blocks) => setFormData(p => ({ ...p, home_blocks: blocks }))}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
