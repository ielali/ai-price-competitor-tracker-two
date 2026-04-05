"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type LogoutButtonProps = {
  variant?: "default" | "ghost" | "outline";
  className?: string;
  /** When true, render as nav row (icon + label) for sidebar */
  layout?: "button" | "nav-row";
  /** Sidebar collapsed: icon only + tooltip */
  sidebarCollapsed?: boolean;
};

export function LogoutButton({
  variant = "outline",
  className,
  layout = "button",
  sidebarCollapsed = false,
}: LogoutButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      router.push("/login");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  if (layout === "nav-row") {
    const rowClass = cn(
      "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors",
      "hover:bg-accent/50 hover:text-accent-foreground",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    );

    if (sidebarCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={logout}
                disabled={pending}
                aria-label="Log out"
                className={rowClass}
              />
            }
          >
            <LogOut className="size-5 shrink-0" aria-hidden />
          </TooltipTrigger>
          <TooltipContent side="right">Log out</TooltipContent>
        </Tooltip>
      );
    }

    return (
      <button
        type="button"
        onClick={logout}
        disabled={pending}
        className={rowClass}
      >
        <LogOut className="size-5 shrink-0" aria-hidden />
        <span data-nav-label>{pending ? "Signing out…" : "Log out"}</span>
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant={variant}
      onClick={logout}
      disabled={pending}
      className={className}
    >
      <LogOut className="mr-2 size-4" aria-hidden />
      {pending ? "Signing out…" : "Log out"}
    </Button>
  );
}
