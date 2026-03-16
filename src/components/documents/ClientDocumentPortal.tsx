"use client";

import { useState } from "react";
import { DocumentList } from "./DocumentList";
import Image from "next/image";

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
  firmName: string;
  logoUrl?: string | null;
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

  const hasValidLogo = advisorInfo.logoUrl && advisorInfo.logoUrl.startsWith('https://');

  return (
    <div className="space-y-8">
      {/* Advisor Branding Header */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center gap-4">
          {hasValidLogo && (
            <div className="flex-shrink-0">
              <Image
                src={advisorInfo.logoUrl!}
                alt={`${advisorInfo.firmName} logo`}
                width={120}
                height={48}
                className="max-h-12 w-auto object-contain"
                unoptimized
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground mb-1">
              {advisorInfo.firmName}
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
        advisorFirmName={advisorInfo.firmName}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}