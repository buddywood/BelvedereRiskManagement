"use client";

import { useState } from "react";
import { useBrandingOptional } from "@/components/providers/BrandingProvider";
import {
  clientPortalBrandingDisplayTitle,
  clientPortalLogoImgSrc,
} from "@/lib/client/client-portal-branding";
import { DocumentList } from "./DocumentList";

interface DocumentRequirement {
  id: string;
  name: string;
  description?: string | null;
  fulfilled: boolean;
  fileName?: string | null;
  fileSize?: number | null;
  fulfilledAt?: Date | null;
  required: boolean;
}

interface AdvisorInfo {
  /** Fallback when the client shell has no `BrandingProvider` (branding off). From document requirement advisor row. */
  firmName: string;
  /** Fallback logo when branding context is absent (HTTPS or same-origin path). */
  logoSrc?: string | null;
}

interface ClientDocumentPortalProps {
  requirements: DocumentRequirement[];
  advisorInfo: AdvisorInfo;
}

export function ClientDocumentPortal({
  requirements,
  advisorInfo,
}: ClientDocumentPortalProps) {
  const [currentRequirements, setCurrentRequirements] = useState(requirements);

  // Handle refresh after upload by updating local state
  // In a real implementation, you might want to refetch from server
  const handleUploadComplete = () => {
    // For now, we'll trigger a page refresh to get updated data
    // This could be optimized with local state updates or server revalidation
    window.location.reload();
  };

  const brandingCtx = useBrandingOptional();
  const assignedBranding = brandingCtx?.branding ?? null;

  const portalTitle = assignedBranding
    ? clientPortalBrandingDisplayTitle(assignedBranding)
    : advisorInfo.firmName;

  const logoSrc =
    (assignedBranding
      ? clientPortalLogoImgSrc(assignedBranding)
      : advisorInfo.logoSrc?.trim()) || null;

  return (
    <div className="space-y-8">
      {/* Advisor Branding Header */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center gap-4">
          {logoSrc ? (
            <div className="flex-shrink-0">
              <img
                src={logoSrc}
                alt=""
                className="h-12 w-auto max-w-[200px] object-contain object-left"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          ) : null}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground mb-1">
              {portalTitle}
            </h1>
            <p className="text-lg text-muted-foreground">
              Document Collection Portal
            </p>
          </div>
        </div>
      </div>

      {/* Document List */}
      <DocumentList
        requirements={currentRequirements}
        advisorFirmName={portalTitle}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}