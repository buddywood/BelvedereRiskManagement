"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CLIENT_NAV_ITEMS: { href: string; label: string }[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/intake", label: "Intake" },
  { href: "/assessment", label: "Assessment" },
  { href: "/documents", label: "Documents" },
  { href: "/profiles", label: "Profiles & Roles" },
  { href: "/settings", label: "Settings" },
];

const ADVISOR_NAV_ITEMS: { href: string; label: string }[] = [
  { href: "/advisor", label: "Clients" },
  { href: "/advisor/pipeline", label: "Pipeline" },
  { href: "/advisor/invitations", label: "Invitations" },
  { href: "/advisor/dashboard", label: "Dashboard" },
  { href: "/advisor/intelligence", label: "Risk Intelligence" },
  { href: "/advisor/notifications", label: "Notifications" },
  { href: "/advisor/billing", label: "Billing" },
  { href: "/advisor/settings", label: "Settings" },
];

const ADMIN_NAV_ITEMS: { href: string; label: string }[] = [
  { href: "/admin", label: "Admin" },
  { href: "/admin/advisors", label: "Advisors" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/leads", label: "Assessment requests" },
  { href: "/admin/intake", label: "Intake Management" },
  { href: "/admin/assessment", label: "Assessment Management" },
  { href: "/admin/settings", label: "Settings" },
];

interface ProtectedNavProps {
  showAdvisor?: boolean;
  showAdmin?: boolean;
  restrictNavToIntake?: boolean;
  /** When false for clients, Assessment link is disabled until advisor approves intake */
  intakeApprovedForClient?: boolean;
}

export function ProtectedNav({
  showAdvisor = false,
  showAdmin = false,
  restrictNavToIntake = false,
  intakeApprovedForClient = false,
}: ProtectedNavProps) {
  const pathname = usePathname();

  const items = showAdmin
    ? ADMIN_NAV_ITEMS
    : showAdvisor
      ? ADVISOR_NAV_ITEMS
      : CLIENT_NAV_ITEMS;

  // When restrictNavToIntake (client, intake not submitted), only Intake is enabled
  const isClientRestricted = restrictNavToIntake && !showAdvisor && !showAdmin;
  const enabledHrefs = isClientRestricted ? new Set(["/intake"]) : null;

  // For clients with submitted but not approved intake: Assessment is disabled
  const isClientAssessmentLocked =
    !showAdvisor && !showAdmin && !intakeApprovedForClient;
  const disabledAssessmentHref = isClientAssessmentLocked
    ? "/assessment"
    : null;

  // Most specific matching route wins (e.g. /advisor/dashboard over /advisor)
  const activeHref = [...items]
    .sort((a, b) => b.href.length - a.href.length)
    .find(
      ({ href }) => pathname === href || pathname.startsWith(href + "/"),
    )?.href;

  return (
    <nav
      className="flex min-w-0 flex-1 flex-wrap items-center gap-2"
      aria-label="Main navigation"
    >
      {items.map(({ href, label }) => {
        const isActive = activeHref === href;
        const isDisabledByIntake =
          enabledHrefs !== null && !enabledHrefs.has(href);
        const isDisabledByApproval = disabledAssessmentHref === href;
        const isDisabled = isDisabledByIntake || isDisabledByApproval;
        const disabledTitle = isDisabledByApproval
          ? "Assessment unlocks after your advisor reviews and approves your intake."
          : "Complete your intake interview to unlock. Assessment and other areas become available after your advisor reviews and assigns your assessment.";
        return isDisabled ? (
          <span
            key={href}
            aria-disabled="true"
            title={disabledTitle}
            className={cn(
              "inline-flex h-9 shrink-0 cursor-not-allowed items-center rounded-md px-3 text-sm font-medium",
              "text-muted-foreground/60 opacity-70",
            )}
          >
            {label}
          </span>
        ) : (
          <Button
            asChild
            variant="ghost"
            size="sm"
            className={cn(
              "h-9 shrink-0 px-3",
              isActive &&
                "bg-secondary text-foreground font-semibold hover:bg-secondary hover:text-foreground",
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
