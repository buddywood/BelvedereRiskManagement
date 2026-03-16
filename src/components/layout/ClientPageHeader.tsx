"use client";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  Users,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface ClientPageHeaderConfig {
  icon: LucideIcon;
  kicker: string;
  title: string;
  subtitle?: string;
}

const CLIENT_HEADER_CONFIG: { path: string; config: ClientPageHeaderConfig }[] = [
  {
    path: "/dashboard",
    config: {
      icon: LayoutDashboard,
      kicker: "Client Dashboard",
      title: "Dashboard",
      subtitle:
        "Review assessment progress, access results, and manage account security from a workspace designed for discretion and clarity.",
    },
  },
  {
    path: "/intake",
    config: {
      icon: FileText,
      kicker: "Intake",
      title: "Family Governance Intake Interview",
      subtitle:
        "Before your assessment, we'd like to learn about your family through a brief audio interview. An advisor will review your responses.",
    },
  },
  {
    path: "/assessment",
    config: {
      icon: ClipboardCheck,
      kicker: "Assessment Workspace",
      title: "Family Governance Assessment",
      subtitle:
        "A guided evaluation of governance structure, succession planning, communication, and decision-making practices designed for families operating with institutional rigor.",
    },
  },
  {
    path: "/profiles",
    config: {
      icon: Users,
      kicker: "Profiles & Roles",
      title: "Household Profiles",
      subtitle:
        "Capture the people in your household, clarify how they participate in governance, and keep an up-to-date operating picture for the rest of the assessment workflow.",
    },
  },
  {
    path: "/settings",
    config: {
      icon: Settings,
      kicker: "Account Settings",
      title: "Security & access",
      subtitle:
        "Review account identity, secure your workspace with multi-factor authentication, and keep recovery access in good standing.",
    },
  },
];

function getHeaderConfig(pathname: string): ClientPageHeaderConfig | null {
  const match = CLIENT_HEADER_CONFIG.find(({ path }) => pathname === path);
  return match?.config ?? null;
}

export function ClientPageHeader(props: ClientPageHeaderConfig) {
  const { icon: Icon, kicker, title, subtitle } = props;
  return (
    <section className="space-y-2 sm:space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" aria-hidden />
        <p className="editorial-kicker">{kicker}</p>
      </div>
      <h1 className="text-3xl font-semibold text-balance sm:text-4xl tracking-[-0.03em]">
        {title}
      </h1>
      {subtitle && (
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
          {subtitle}
        </p>
      )}
    </section>
  );
}

/**
 * Renders the shared client page header (icon + kicker + title + subtitle) based on current path.
 * Returns null for non-client routes (e.g. /advisor/*). Use in protected layout so client pages get the same header style.
 */
export function ClientPageHeaderFromPath() {
  const pathname = usePathname();
  const config = getHeaderConfig(pathname);
  if (!config) return null;
  return <ClientPageHeader {...config} />;
}
