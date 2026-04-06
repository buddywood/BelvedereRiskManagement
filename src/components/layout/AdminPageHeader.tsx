"use client";

import { usePathname } from "next/navigation";
import {
  Shield,
  Users,
  UserCircle,
  Inbox,
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
      title: "System Administration",
      subtitle:
        "Platform oversight and user management",
    },
  },
  {
    path: "/admin/advisors",
    config: {
      icon: Users,
      kicker: "User management",
      title: "Advisors",
      subtitle: "Advisor accounts and professional profiles",
    },
  },
  {
    path: "/admin/clients",
    config: {
      icon: UserCircle,
      kicker: "User management",
      title: "Clients",
      subtitle: "Client accounts and advisor assignments",
    },
  },
  {
    path: "/admin/leads",
    config: {
      icon: Inbox,
      kicker: "Lead routing",
      title: "Assessment requests",
      subtitle:
        "Review submissions from the public request form and assign them to an advisor",
    },
  },
  {
    path: "/admin/intake",
    config: {
      icon: FileText,
      kicker: "Content management",
      title: "Intake Management",
      subtitle: "Client intake interviews and status oversight",
    },
  },
  {
    path: "/admin/assessment",
    config: {
      icon: ClipboardCheck,
      kicker: "Content management",
      title: "Assessment Management",
      subtitle: "Governance assessment oversight and progress tracking",
    },
  },
  {
    path: "/admin/settings",
    config: {
      icon: Settings,
      kicker: "System configuration",
      title: "Admin Settings",
      subtitle:
        "Platform configuration and integration management",
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
    <header role="banner" className="admin-header professional-header space-y-3 sm:space-y-4">
      <div className="flex items-center gap-3 header-section-spacing">
        <div className="professional-icon" role="img" aria-label={`${title} section icon`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="professional-kicker" id="admin-section-context" role="doc-subtitle">
          {kicker}
        </p>
      </div>
      <div className="header-section-spacing">
        <h1
          className="professional-title text-balance"
          aria-describedby="admin-section-context admin-subtitle"
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="professional-subtitle"
            id="admin-subtitle"
            role="doc-subtitle"
            aria-label={`Page description: ${subtitle}`}
          >
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
}

/**
 * Enhanced admin page header with professional accessibility features.
 * Renders the shared admin page header with skip-to-content functionality.
 */
export function AdminPageHeaderFromPath() {
  const pathname = usePathname();
  const config = getHeaderConfig(pathname);
  if (!config) return null;

  return (
    <>
      <AdminPageHeader {...config} />
    </>
  );
}
