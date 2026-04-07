"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getDocumentDownloadUrl } from "@/lib/actions/document-actions";

interface DocumentDownloadButtonProps {
  requirementId: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "secondary" | "ghost";
}

export function DocumentDownloadButton({
  requirementId,
  className,
  size = "sm",
  variant = "outline",
}: DocumentDownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const result = await getDocumentDownloadUrl(requirementId);
      if (result.success && result.data) {
        window.open(result.data.downloadUrl, "_blank", "noopener,noreferrer");
      } else {
        toast.error(result.error ?? "Could not start download");
      }
    } catch {
      toast.error("Could not start download");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={handleDownload}
      disabled={loading}
      aria-busy={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        <Download className="h-4 w-4" aria-hidden />
      )}
      <span className="ml-2">Download</span>
    </Button>
  );
}
