"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/lib/documents/types";
import { confirmDocumentUpload } from "@/lib/actions/document-actions";

interface DocumentUploadProps {
  requirementId: string;
  requirementName: string;
  onUploadComplete: () => void;
}

type UploadState =
  | { status: 'idle' }
  | { status: 'requesting-url' }
  | { status: 'uploading'; progress?: number }
  | { status: 'confirming' }
  | { status: 'success' }
  | { status: 'error'; message: string };

async function parseS3ErrorBody(response: Response): Promise<string> {
  try {
    const text = await response.text();
    const m = text.match(/<Message>([^<]*)<\/Message>/);
    if (m?.[1]) return m[1].trim();
    if (text.trim()) return text.trim().slice(0, 280);
  } catch {
    /* ignore */
  }
  return "";
}

export function DocumentUpload({
  requirementId,
  requirementName,
  onUploadComplete
}: DocumentUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({ status: 'idle' });

  const onDropAccepted = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      // Step 1: Request upload URL
      setUploadState({ status: 'requesting-url' });

      const urlResponse = await fetch('/api/documents/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirementId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      });

      if (!urlResponse.ok) {
        const errorData = await urlResponse.text();
        throw new Error(errorData || 'Failed to get upload URL');
      }

      const payload = await urlResponse.json();
      const signedUrl = typeof payload.signedUrl === "string" ? payload.signedUrl : "";
      const key = typeof payload.key === "string" ? payload.key : "";
      const contentType = payload.contentType;
      if (!signedUrl || !key) {
        throw new Error("Invalid response from upload URL service");
      }

      const putContentType =
        typeof contentType === "string" && contentType.length > 0
          ? contentType
          : file.type || "application/octet-stream";

      // Step 2: Upload file to S3
      setUploadState({ status: 'uploading' });

      const s3Response = await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          "Content-Type": putContentType,
        },
      });

      if (!s3Response.ok) {
        const detail = await parseS3ErrorBody(s3Response);
        const suffix = detail ? `: ${detail}` : "";
        throw new Error(
          `Storage upload failed (${s3Response.status || "network"})${suffix}`,
        );
      }

      // Step 3: Confirm upload with server
      setUploadState({ status: 'confirming' });

      const result = await confirmDocumentUpload({
        requirementId,
        fileMetadata: {
          key,
          fileName: file.name,
          fileSize: file.size,
          fileMimeType: putContentType,
        },
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to confirm upload');
      }

      setUploadState({ status: 'success' });
      onUploadComplete();

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      setUploadState({ status: 'error', message });
    }
  }, [onUploadComplete, requirementId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDropAccepted,
    accept: ALLOWED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    disabled: uploadState.status !== 'idle',
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0];
      if (rejection?.errors[0]?.code === 'file-too-large') {
        setUploadState({
          status: 'error',
          message: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`
        });
      } else if (rejection?.errors[0]?.code === 'file-invalid-type') {
        setUploadState({
          status: 'error',
          message: 'Invalid file type. Please upload PDF, PNG, or JPG files only.'
        });
      } else {
        setUploadState({
          status: 'error',
          message: 'File rejected. Please check file type and size.'
        });
      }
    },
  });

  const getStateContent = () => {
    switch (uploadState.status) {
      case 'idle':
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <Upload className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-sm text-center mb-2">
              <span className="font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, PNG, JPG up to 10MB
            </p>
          </div>
        );

      case 'requesting-url':
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
            <p className="text-sm text-center">Requesting upload URL...</p>
          </div>
        );

      case 'uploading':
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
            <p className="text-sm text-center">Uploading...</p>
          </div>
        );

      case 'confirming':
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
            <p className="text-sm text-center">Confirming...</p>
          </div>
        );

      case 'success':
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="h-10 w-10 text-green-600 mb-4" />
            <p className="text-sm text-center font-medium text-green-700">
              Upload successful!
            </p>
          </div>
        );

      case 'error':
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-10 w-10 text-red-600 mb-4" />
            <p className="text-sm text-center text-red-700 mb-4">
              {uploadState.message}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUploadState({ status: 'idle' })}
            >
              Try Again
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <p className="text-sm font-medium mb-3">Upload {requirementName}</p>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg cursor-pointer transition-colors",
          "hover:border-primary/50 hover:bg-primary/5",
          isDragActive && "border-blue-500 bg-blue-50",
          uploadState.status === 'success' && "border-green-500 bg-green-50",
          uploadState.status === 'error' && "border-red-500 bg-red-50",
          uploadState.status !== 'idle' && "cursor-not-allowed",
        )}
      >
        <input {...getInputProps()} />
        {getStateContent()}
      </div>
    </div>
  );
}