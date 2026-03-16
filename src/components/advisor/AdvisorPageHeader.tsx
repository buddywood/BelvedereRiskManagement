"use client";

import { usePathname } from "next/navigation";
import {
  Users,
  GitBranch,
  Send,
  LayoutDashboard,
  Shield,
  Bell,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface AdvisorPageHeaderConfig {
  icon: LucideIcon;
  kicker: string;
  title: string;
  subtitle?: string;
}

const ADVISOR_HEADER_CONFIG: { path: string; config: AdvisorPageHeaderConfig }[] = [
  { path: "/advisor", config: { icon: Users, kicker: "Client management", title: "Clients", subtitle: "Manage your clients and track their progress through the advisory workflow." } },
  { path: "/advisor/pipeline", config: { icon: GitBranch, kicker: "Client workflow", title: "Client Pipeline", subtitle: "Track client workflow progression and manage document requirements across all stages of the advisory process." } },
  { path: "/advisor/invitations", config: { icon: Send, kicker: "Client management", title: "Client Invitations", subtitle: "Send and manage invitations for client family governance assessments." } },
  { path: "/advisor/dashboard", config: { icon: LayoutDashboard, kicker: "Governance Intelligence", title: "Family Governance Dashboard", subtitle: "Monitor governance scores, assess risk levels, and track assessment progress across your assigned client families from a unified intelligence dashboard." } },
  { path: "/advisor/intelligence", config: { icon: Shield, kicker: "Governance Intelligence", title: "Risk Intelligence", subtitle: "Identify and prioritize governance risks across your portfolio. Monitor critical issues, track family risk exposure, and focus attention where it's needed most." } },
  { path: "/advisor/notifications", config: { icon: Bell, kicker: "Notifications", title: "All Notifications", subtitle: "Stay updated on client activity and advisor alerts." } },
  { path: "/advisor/settings", config: { icon: Settings, kicker: "Account management", title: "Settings", subtitle: "Manage branding and view your profile used in invitations." } },
];

function getHeaderConfig(pathname: string): AdvisorPageHeaderConfig | null {
  // Only match exact path so nested routes (e.g. /advisor/pipeline/[clientId]) keep their own title
  const match = ADVISOR_HEADER_CONFIG.find(({ path }) => pathname === path);
  return match?.config ?? null;
}

export function AdvisorPageHeader(props: AdvisorPageHeaderConfig) {
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
 * Renders the shared advisor page header (icon + kicker + title + subtitle) based on current path.
 * Use in advisor layout so every advisor page gets the same header style.
 */
export function AdvisorPageHeaderFromPath() {
  const pathname = usePathname();
  const config = getHeaderConfig(pathname);
  if (!config) return null;
  return <AdvisorPageHeader {...config} />;
}
