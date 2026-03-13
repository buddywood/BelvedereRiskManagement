"use client";

/**
 * TemplateList Component
 *
 * Displays grid of governance policy templates with individual and bulk download options.
 * Uses blob download pattern with per-template loading states.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, Download } from "lucide-react";
import { TEMPLATE_REGISTRY, TemplateId } from "@/lib/templates/types";
import toast from "react-hot-toast";

interface TemplateListProps {
  assessmentId: string;
}

export function TemplateList({ assessmentId }: TemplateListProps) {
  const [downloadingTemplate, setDownloadingTemplate] = useState<TemplateId | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  const downloadTemplate = async (templateId: TemplateId) => {
    try {
      setDownloadingTemplate(templateId);

      const response = await fetch(`/api/templates/${assessmentId}?template=${templateId}`);

      if (!response.ok) {
        throw new Error(`Failed to generate template: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const template = TEMPLATE_REGISTRY.find(t => t.id === templateId);
      a.download = `${template?.name.replace(/\s+/g, '-').toLowerCase()}-${assessmentId}.docx`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`${template?.name} downloaded successfully`);
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error(error instanceof Error ? error.message : "Failed to download template");
    } finally {
      setDownloadingTemplate(null);
    }
  };

  const downloadAllTemplates = async () => {
    try {
      setDownloadingAll(true);

      for (let i = 0; i < TEMPLATE_REGISTRY.length; i++) {
        const template = TEMPLATE_REGISTRY[i];
        await downloadTemplate(template.id);

        // Small delay between downloads to avoid overwhelming browser
        if (i < TEMPLATE_REGISTRY.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      toast.success("All templates downloaded successfully");
    } catch (error) {
      console.error("Error downloading all templates:", error);
      toast.error("Failed to download all templates");
    } finally {
      setDownloadingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="editorial-kicker">Governance Policy Templates</p>
        <Button
          onClick={downloadAllTemplates}
          disabled={downloadingAll || downloadingTemplate !== null}
          variant="outline"
          size="sm"
        >
          {downloadingAll ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download All Templates
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {TEMPLATE_REGISTRY.map((template) => (
          <Card key={template.id} className="bg-background/55">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-lg leading-tight">
                    {template.name}
                  </CardTitle>
                  <Badge variant="secondary" className="w-fit text-xs">
                    {template.category.replace(/-/g, ' ')}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {template.description}
              </p>

              <Button
                onClick={() => downloadTemplate(template.id)}
                disabled={downloadingTemplate === template.id || downloadingAll}
                variant="outline"
                size="sm"
                className="w-full"
              >
                {downloadingTemplate === template.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Download .docx
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}