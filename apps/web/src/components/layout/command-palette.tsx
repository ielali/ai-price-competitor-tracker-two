"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { bottomNavItem, mainNavItems } from "@/components/layout/nav-items";

const paletteItems = [...mainNavItems, bottomNavItem];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "k" || !(e.metaKey || e.ctrlKey)) return;
      if (e.defaultPrevented) return;
      e.preventDefault();
      setOpen((v) => !v);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const runCommand = React.useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <DialogTitle className="sr-only">Go to page</DialogTitle>
      <DialogDescription className="sr-only">
        Search by page name or path, then press Enter to navigate.
      </DialogDescription>
      <CommandInput placeholder="Search pages and go…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {paletteItems.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.href}
                value={`${item.label} ${item.href}`}
                onSelect={() => runCommand(item.href)}
              >
                <Icon className="h-4 w-4" aria-hidden />
                <span>{item.label}</span>
                <CommandShortcut>{item.href}</CommandShortcut>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
