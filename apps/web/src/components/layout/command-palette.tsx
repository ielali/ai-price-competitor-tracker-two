"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useCommandPaletteStore } from "@/stores/command-palette-store";
import { bottomNavItem, mainNavItems } from "./nav-items";

const paletteItems = [...mainNavItems, bottomNavItem];

export function CommandPalette() {
  const router = useRouter();
  const open = useCommandPaletteStore((s) => s.open);
  const setOpen = useCommandPaletteStore((s) => s.setOpen);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "k" || !(e.metaKey || e.ctrlKey)) return;
      e.preventDefault();
      setOpen(!useCommandPaletteStore.getState().open);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [setOpen]);

  const runCommand = React.useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router, setOpen]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 shadow-lg sm:max-w-lg">
        <DialogTitle className="sr-only">Search navigation</DialogTitle>
        <DialogDescription className="sr-only">
          Jump to a page by name. Use arrow keys to choose, Enter to open.
        </DialogDescription>
        <Command className="rounded-lg border-0 shadow-none [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium">
          <CommandInput placeholder="Search pages…" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Navigate">
              {paletteItems.map((item) => {
                const Icon = item.icon;
                const value = `${item.label} ${item.href}`;
                return (
                  <CommandItem
                    key={item.href}
                    value={value}
                    keywords={[item.label, item.href]}
                    onSelect={() => runCommand(item.href)}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden />
                    {item.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
