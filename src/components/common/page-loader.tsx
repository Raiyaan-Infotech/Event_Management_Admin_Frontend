"use client";

import { cn } from "@/lib/utils";

interface PageLoaderProps {
  open: boolean;
  text?: string;
  /**
   * Fully hides the page behind the loader instead of letting it show through.
   *
   * The default is deliberately translucent — on a normal page load it reads as
   * "this screen is busy" while you can still see what you are waiting for.
   * That falls apart for an action that REPLACES what is on screen: the old
   * artwork stays visible through the blur, so it looks like the loader and the
   * stale result are being shown at the same time.
   *
   * Opt-in rather than the default because ~150 screens render this component
   * and flipping all of them is a change nobody asked for.
   */
  solid?: boolean;
}

export function PageLoader({ open, text = "Loading...", solid = false }: PageLoaderProps) {
  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center",
        solid ? "bg-background" : "bg-background/80 backdrop-blur-sm"
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}
