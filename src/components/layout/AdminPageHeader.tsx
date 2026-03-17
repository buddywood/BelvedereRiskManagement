"use client";

import { usePathname } from "next/navigation";
import {
  Shield,
  Users,
  UserCircle,
  FileText,
  ClipboardCheck,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface AdminPageHeaderConfig {
  icon: LucideIcon;
  kicker: string;
  title: string;
  subtitle?: string;
}

const ADMIN_HEADER_CONFIG: { path: string; config: AdminPageHeaderConfig }[] = [
  {
    path: "/admin",
    config: {
      icon: Shield,
      kicker: "Administration",
      title: "Admin",
      subtitle:
        "Manage advisors, clients, intake, and assessments. Use the links below to navigate.",
    },
  },
  {
    path: "/admin/advisors",
    config: {
      icon: Users,
      kicker: "User management",
      title: "Advisors",
      subtitle: "Users with the ADVISOR role and their profiles.",
    },
  },
  {
    path: "/admin/clients",
    config: {
      icon: UserCircle,
      kicker: "User management",
      title: "Clients",
      subtitle: "Users with the USER role. Assignments and activity counts are shown.",
    },
  },
  {
    path: "/admin/intake",
    config: {
      icon: FileText,
      kicker: "Intake",
      title: "Intake Management",
      subtitle: "All intake interviews and their status. Use for review and triage.",
    },
  },
  {
    path: "/admin/assessment",
    config: {
      icon: ClipboardCheck,
      kicker: "Assessments",
      title: "Assessment Management",
      subtitle: "All governance assessments. Status and progress are shown.",
    },
  },
  {
    path: "/admin/settings",
    config: {
      icon: Settings,
      kicker: "Administration",
      title: "Admin Settings",
      subtitle:
        "System and account settings. Extend with feature flags, defaults, or integrations.",
    },
  },
];

function getHeaderConfig(pathname: string): AdminPageHeaderConfig | null {
  // Try exact match first
  let match = ADMIN_HEADER_CONFIG.find(({ path }) => pathname === path);

  // Fall back to parent path if no exact match
  if (!match) {
    const parentPath = pathname.split('/').slice(0, -1).join('/');
    match = ADMIN_HEADER_CONFIG.find(({ path }) => path === parentPath);
  }

  return match?.config ?? null;
}

export function AdminPageHeader(props: AdminPageHeaderConfig) {
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
 * Renders the shared admin page header (icon + kicker + title + subtitle) based on current path.
 * Use in admin layout so every admin page gets the same header style.
 */
export function AdminPageHeaderFromPath() {
  const pathname = usePathname();
  const config = getHeaderConfig(pathname);
  if (!config) return null;
  return <AdminPageHeader {...config} />;
}
