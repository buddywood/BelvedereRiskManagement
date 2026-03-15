"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS: { href: string; label: string }[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/intake", label: "Intake" },
  { href: "/advisor", label: "Advisor" },
  { href: "/advisor/dashboard", label: "Governance" },
  { href: "/assessment", label: "Assessment" },
  { href: "/profiles", label: "Profiles" },
  { href: "/settings", label: "Settings" },
];

interface ProtectedNavProps {
  showAdvisor?: boolean;
}

export function ProtectedNav({ showAdvisor = false }: ProtectedNavProps) {
  const pathname = usePathname();

  const items = showAdvisor
    ? NAV_ITEMS
    : NAV_ITEMS.filter((item) => item.href !== "/advisor" && item.href !== "/advisor/dashboard");

  return (
    <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:flex md:grid-cols-5">
      {items.map(({ href, label }) => {
        const isActive =
          href === pathname ||
          (href !== "/dashboard" && pathname.startsWith(href + "/"));
        return (
          <Button
            asChild
            variant="ghost"
            size="sm"
            className={cn(
              "h-9 w-full px-3",
              isActive &&
                "bg-secondary text-foreground font-semibold hover:bg-secondary hover:text-foreground"
            )}
            key={href}
          >
            <Link href={href} aria-current={isActive ? "page" : undefined}>
              {label}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
