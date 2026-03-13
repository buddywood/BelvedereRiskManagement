"use client";

/**
 * DownloadSection Component
 *
 * Provides PDF report download functionality with loading states and error handling.
 * Uses blob download pattern for client-side file downloads.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface DownloadSectionProps {
  assessmentId: string;
}

export function DownloadSection({ assessmentId }: DownloadSectionProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadPDFReport = async () => {
    try {
      setIsGenerating(true);

      const response = await fetch(`/api/reports/${assessmentId}/pdf`);

      if (!response.ok) {
        throw new Error(`Failed to generate report: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `family-governance-report-${assessmentId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Error downloading PDF report:", error);
      toast.error(error instanceof Error ? error.message : "Failed to download report");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="editorial-kicker">Download Your Report</p>

      <div className="space-y-3">
        <Button
          onClick={downloadPDFReport}
          disabled={isGenerating}
          size="lg"
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4 mr-2" />
              Download PDF Report
            </>
          )}
        </Button>

        <p className="text-sm text-muted-foreground">
          Professional PDF report with executive summary, score breakdown, and recommendations
        </p>
      </div>
    </div>
  );
}