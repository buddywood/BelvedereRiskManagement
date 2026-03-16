import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from './types';

export function validateFileUpload(fileType: string, fileSize: number): { valid: true } | { valid: false; error: string } {
  // Check if file type is allowed
  if (!Object.keys(ALLOWED_FILE_TYPES).includes(fileType)) {
    const allowedTypes = Object.keys(ALLOWED_FILE_TYPES).join(', ');
    return { valid: false, error: `File type ${fileType} not allowed. Allowed types: ${allowedTypes}` };
  }

  // Check file size
  if (fileSize > MAX_FILE_SIZE) {
    const maxSizeMB = Math.round(MAX_FILE_SIZE / (1024 * 1024));
    return { valid: false, error: `File size ${fileSize} bytes exceeds maximum allowed size of ${maxSizeMB}MB` };
  }

  return { valid: true };
}