"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DocumentUpload } from "./DocumentUpload";
import { CalendarDays, FileText, HardDrive } from "lucide-react";

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

interface DocumentListProps {
  requirements: DocumentRequirement[];
  advisorFirmName: string;
  onUploadComplete: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function DocumentList({
  requirements,
  advisorFirmName,
  onUploadComplete,
}: DocumentListProps) {
  // Calculate progress
  const requiredDocs = requirements.filter(req => req.required);
  const uploadedRequired = requiredDocs.filter(req => req.fulfilled);
  const totalRequired = requiredDocs.length;
  const uploadedCount = uploadedRequired.length;
  const progressPercent = totalRequired > 0 ? (uploadedCount / totalRequired) * 100 : 0;

  // Sort: unfulfilled requirements first, then fulfilled
  const sortedRequirements = [...requirements].sort((a, b) => {
    if (a.fulfilled !== b.fulfilled) {
      return a.fulfilled ? 1 : -1;
    }
    return a.name.localeCompare(b.name);
  });

  if (requirements.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          No document requirements yet
        </h3>
        <p className="text-sm text-muted-foreground">
          Your advisor will request documents when needed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Document Progress</h3>
          <span className="text-sm text-muted-foreground">
            {uploadedCount} of {totalRequired} required documents uploaded
          </span>
        </div>
        <Progress value={progressPercent} className="w-full" />
        <p className="text-xs text-muted-foreground mt-2">
          {totalRequired > uploadedCount && (
            <>You still need to upload {totalRequired - uploadedCount} required document{totalRequired - uploadedCount !== 1 ? 's' : ''}.</>
          )}
          {totalRequired === uploadedCount && totalRequired > 0 && (
            <>All required documents have been uploaded!</>
          )}
        </p>
      </div>

      {/* Document Requirements */}
      <div className="space-y-4">
        {sortedRequirements.map((requirement) => (
          <div
            key={requirement.id}
            className="bg-card border rounded-lg p-6 space-y-4"
          >
            {/* Requirement Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold mb-1">
                  {requirement.name}
                </h4>
                {requirement.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {requirement.description}
                  </p>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <Badge
                  variant={
                    requirement.fulfilled
                      ? "success"
                      : requirement.required
                        ? "warning"
                        : "secondary"
                  }
                >
                  {requirement.fulfilled
                    ? "Uploaded"
                    : requirement.required
                      ? "Required"
                      : "Optional"}
                </Badge>
              </div>
            </div>

            {/* Fulfilled State - Show File Info */}
            {requirement.fulfilled && requirement.fileName && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3 text-sm">
                  <FileText className="h-5 w-5 text-green-600" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-green-900 truncate">
                      {requirement.fileName}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-green-700">
                      {requirement.fileSize && (
                        <div className="flex items-center gap-1">
                          <HardDrive className="h-3 w-3" />
                          <span>{formatFileSize(requirement.fileSize)}</span>
                        </div>
                      )}
                      {requirement.fulfilledAt && (
                        <div className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          <span>Uploaded {formatDate(requirement.fulfilledAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Unfulfilled State - Show Upload Component */}
            {!requirement.fulfilled && (
              <DocumentUpload
                requirementId={requirement.id}
                requirementName={requirement.name}
                onUploadComplete={onUploadComplete}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}