import { Users } from "lucide-react";

import type { FacilitatedSessionBranding } from "@/components/advisor/facilitate/FacilitatedSessionContext";

interface FacilitatedSessionBannerProps {
  clientName: string | null;
  stepLabel: string;
  branding?: FacilitatedSessionBranding | null;
}

export function FacilitatedSessionBanner({
  clientName,
  stepLabel,
  branding,
}: FacilitatedSessionBannerProps) {
  const displayName = clientName?.trim() || "Client";
  const isBranded = branding?.primaryColor || branding?.brandName;
  const brandName = branding?.brandName;

  return (
    <div
      className="sticky top-0 z-40 border-b backdrop-blur-sm"
      style={
        isBranded
          ? {
              borderColor: `${branding.primaryColor}33`,
              backgroundColor: `${branding.primaryColor}0a`,
            }
          : undefined
      }
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <Users
            className="size-4 shrink-0"
            style={isBranded ? { color: branding.primaryColor ?? undefined } : undefined}
            aria-hidden
          />
          <p className="text-sm text-foreground">
            <span className="font-medium">{stepLabel}</span>
            <span className="text-muted-foreground"> for </span>
            <span className="font-semibold">{displayName}</span>
          </p>
        </div>
        {brandName && (
          <div
            className="text-sm font-semibold"
            style={isBranded ? { color: branding.primaryColor ?? undefined } : undefined}
          >
            {brandName}
          </div>
        )}
      </div>
    </div>
  );
}
