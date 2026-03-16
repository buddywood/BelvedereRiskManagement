export const ALLOWED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg']
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export type DocumentUploadRequest = {
  requirementId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
};

export type DocumentUploadResponse = {
  signedUrl: string;
  key: string;
};