"use client";

import { Search } from "lucide-react";
import { useCommandPaletteStore } from "@/stores/command-palette-store";
import { cn } from "@/lib/utils";

export function CommandPaletteTrigger({
  className,
}: {
  className?: string;
}) {
  const setOpen = useCommandPaletteStore((s) => s.setOpen);

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground shadow-sm transition-colors",
        "hover:bg-accent/50 hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      aria-label="Open search and navigation"
    >
      <Search className="size-4 shrink-0" aria-hidden />
      <span className="hidden sm:inline">Search</span>
      <kbd className="pointer-events-none hidden rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:inline">
        <span className="sr-only">Keyboard shortcut: </span>
        <span aria-hidden>⌘</span>K
      </kbd>
    </button>
  );
}
