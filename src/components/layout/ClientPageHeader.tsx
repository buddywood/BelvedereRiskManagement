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
      kicker: "Client Portal",
      title: "Dashboard",
      subtitle:
        "Assessment progress, results, and secure account management",
    },
  },
  {
    path: "/intake",
    config: {
      icon: FileText,
      kicker: "Family Assessment",
      title: "Family Governance Intake",
      subtitle:
        "Confidential family governance intake interview",
    },
  },
  {
    path: "/assessment",
    config: {
      icon: ClipboardCheck,
      kicker: "Family Assessment",
      title: "Governance Assessment",
      subtitle:
        "Comprehensive evaluation of governance structure and family decision-making practices",
    },
  },
  {
    path: "/profiles",
    config: {
      icon: Users,
      kicker: "Family Structure",
      title: "Household Profiles",
      subtitle:
        "Family member profiles and governance participation roles",
    },
  },
  {
    path: "/settings",
    config: {
      icon: Settings,
      kicker: "Account Security",
      title: "Security & Access",
      subtitle:
        "Account identity verification and multi-factor authentication",
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
    <header role="banner" className="client-header professional-header space-y-3 sm:space-y-4">
      <div className="flex items-center gap-3 header-section-spacing">
        <div className="professional-icon" role="img" aria-label={`${title} section icon`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="professional-kicker" id="client-section-context" role="doc-subtitle">
          {kicker}
        </p>
      </div>
      <div className="header-section-spacing">
        <h1
          className="professional-title text-balance"
          aria-describedby="client-section-context client-subtitle"
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="professional-subtitle"
            id="client-subtitle"
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
 * Enhanced client page header with professional accessibility features.
 * Returns null for non-client routes (e.g. /advisor/*). Use in protected layout so client pages get the same header style.
 */
export function ClientPageHeaderFromPath() {
  const pathname = usePathname();
  const config = getHeaderConfig(pathname);
  if (!config) return null;

  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <ClientPageHeader {...config} />
    </>
  );
}
