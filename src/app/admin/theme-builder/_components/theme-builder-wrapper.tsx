"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useThemes, useCreateTheme, useUpdateTheme } from "@/hooks/use-themes";
import { useColorPalettes, type ColorPalette } from "@/hooks/use-color-palettes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Eye, Palette, Check, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import HomeSettingBuilder from "./home-setting-builder";
import type { HomeBlock } from "@/types/home-blocks";
import { PageLoader } from "@/components/common/page-loader";
import { useSearchParams } from "next/navigation";
import { useSubscriptions } from "@/hooks/use-subscriptions";

export default function ThemeBuilderWrapper() {
  const { data: themesRes, isLoading: themesLoading } = useThemes({ page: 1, limit: 100 });
  const { data: palettesRes } = useColorPalettes({ limit: 100, is_active: 1 });

  const createTheme = useCreateTheme();
  const updateTheme = useUpdateTheme();

  const searchParams = useSearchParams();
  const queryThemeId = searchParams.get("themeId") || null;

  // The ONLY theme that will be UPDATED on save — comes from URL only (Appearance → Edit Layout)
  // If null, Save always CREATES a new theme, no exceptions.
  const [editingThemeId] = useState<number | null>(
    queryThemeId ? parseInt(queryThemeId, 10) : null
  );

  const { data: plansRes } = useSubscriptions({ page: 1, limit: 100 });
  const subPlans  = useMemo(() => plansRes?.data ?? [], [plansRes]);
  const palettes  = useMemo(() => palettesRes?.data ?? [], [palettesRes]);

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
    home_blocks: [] as HomeBlock[],
  });

  const themes = useMemo(() => themesRes?.data ?? [], [themesRes]);

  // EDIT MODE: pre-fill form only from URL param (editingThemeId)
  useEffect(() => {
    if (!editingThemeId || themes.length === 0) return;
    const found = themes.find(t => t.id === editingThemeId);
    if (!found) return;
    setFormData({
      name: found.name || "",
      plans: Array.isArray(found.plans) ? found.plans.map(p => Number(p)) : [],
      palette_id: (found as any).palette_id ?? null,
      primary_color: found.primary_color || "#3b82f6",
      secondary_color: found.secondary_color || "#1e40af",
      text_color: found.text_color || "#1f2937",
      header_color: found.header_color || "#ffffff",
      footer_color: found.footer_color || "#f9fafb",
      hover_color: found.hover_color || "#eff6ff",
      home_blocks: Array.isArray(found.home_blocks)
        ? found.home_blocks
        : (typeof found.home_blocks === "string" ? JSON.parse(found.home_blocks) : []),
    });
  }, [editingThemeId, themes]);

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

  const handleSave = () => {
    const payload = { ...formData, is_active: 1, palette_id: formData.palette_id ?? null };

    if (editingThemeId) {
      // EDIT MODE — always update the specific theme from URL
      updateTheme.mutate({ id: editingThemeId, data: payload });
    } else {
      // CREATE MODE — always create new, no exceptions
      createTheme.mutate(payload);
    }
  };

  if (themesLoading) {
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

            {/* Field 1: Edit Mode Banner */}
            {editingThemeId && (
              <div className="space-y-1.5 flex-1 min-w-[200px]">
                <Label className="text-xs uppercase text-muted-foreground">Editing Theme</Label>
                <div className="h-11 flex items-center px-3 rounded-md border bg-primary/5 border-primary/20 text-sm font-bold text-primary gap-2">
                  <Palette className="size-4 shrink-0" />
                  {formData.name || "Loading..."}
                </div>
              </div>
            )}

            {/* Field 1b: Color Palette picker — always visible */}
            <div className="space-y-1.5 flex-1 min-w-[200px]">
              <Label className="text-xs uppercase text-muted-foreground">Color Palette</Label>
              <Select
                value={formData.palette_id?.toString() ?? "none"}
                onValueChange={handlePaletteSelect}
              >
                <SelectTrigger className="w-full font-medium h-11">
                  <SelectValue placeholder="— Pick a palette —" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-muted-foreground italic">— No palette —</SelectItem>
                  {palettes.map((p: ColorPalette) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[p.primary_color, p.secondary_color, p.header_color].filter(Boolean).map((c, i) => (
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
              <Label className="text-xs uppercase text-muted-foreground">Theme Name</Label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                placeholder="e.g. Ocean Blue"
                className="w-full h-11 font-bold text-foreground text-base"
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
                    className="w-full justify-between h-11 bg-muted/20 hover:bg-muted/30"
                  >
                    <div className="flex flex-wrap gap-1 items-center max-w-[90%] overflow-hidden">
                      {formData.plans.length > 0 ? (
                        formData.plans.map(id => {
                          const plan = subPlans.find(p => p.id === id);
                          return (
                            <Badge key={id} variant="secondary" className="text-[10px] h-6">
                              {plan?.name || id}
                            </Badge>
                          );
                        })
                      ) : (
                        <span className="text-muted-foreground text-sm italic">Assign plans...</span>
                      )}
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[300px]" align="start">
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
                              <span>{plan.name}</span>
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

            {/* Field 4: Displaying Theme Colors */}
            <div className="space-y-1.5 shrink-0 px-2">
              <Label className="text-xs uppercase text-muted-foreground ml-1">Theme Colors</Label>
              <div className="flex items-center gap-2 h-11 border rounded-md px-3 bg-muted/10 shadow-sm border-black/5">
                {formData.primary_color && (
                  <div title="Primary Color" className="w-5 h-5 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: formData.primary_color }} />
                )}
                {formData.secondary_color && (
                  <div title="Secondary Color" className="w-5 h-5 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: formData.secondary_color }} />
                )}
                {formData.header_color && (
                  <div title="Header Color" className="w-5 h-5 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: formData.header_color }} />
                )}
                {formData.footer_color && (
                  <div title="Footer Color" className="w-5 h-5 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: formData.footer_color }} />
                )}
                {(!formData.primary_color && !formData.secondary_color && !formData.header_color && !formData.footer_color) && (
                  <span className="text-[10px] text-muted-foreground">No colors...</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <Button variant="outline" className="gap-2 h-11" onClick={() => window.open(`${process.env.NEXT_PUBLIC_VENDOR_URL}/preview?themeId=${editingThemeId}`, '_blank')} disabled={!editingThemeId}>
              <Eye className="size-4" /> Live Preview
           </Button>
           <Button className="gap-2 h-11 px-6 shadow-lg shadow-primary/20" onClick={handleSave}>
              <Save className="size-4" /> {editingThemeId ? "Save Changes" : "Create Theme"}
           </Button>
        </div>
      </div>

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
                initialBlocks={formData.home_blocks}
                onBlocksChange={(blocks) => setFormData(p => ({ ...p, home_blocks: blocks }))}
              />
           </div>
        </div>
      </div>
    </div>
  );
}
