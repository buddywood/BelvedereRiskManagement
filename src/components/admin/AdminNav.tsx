"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ADMIN_NAV_ITEMS: { href: string; label: string }[] = [
  { href: "/admin/advisors", label: "Advisors" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/intake", label: "Intake Management" },
  { href: "/admin/assessment", label: "Assessment Management" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-wrap items-center gap-2 border-b border-border/70 pb-4"
      aria-label="Admin sections"
    >
      {ADMIN_NAV_ITEMS.map(({ href, label }) => {
        const isActive =
          pathname === href || (href !== "/admin" && pathname.startsWith(href + "/"));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
