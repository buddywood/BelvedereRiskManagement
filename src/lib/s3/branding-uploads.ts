import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { prisma } from '@/lib/db';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BRANDING_BUCKET || 'akili-advisor-assets';
const CDN_BASE_URL = process.env.CLOUDFRONT_BASE_URL || `https://${BUCKET_NAME}.s3.amazonaws.com`;

interface UploadUrlRequest {
  advisorId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

interface UploadResponse {
  signedUrl: string;
  s3Key: string;
  uploadId: string;
  expiresIn: number;
}

interface ConfirmUploadRequest {
  uploadId: string;
  s3Key: string;
  originalFileName: string;
}

interface ConfirmUploadResponse {
  logoUrl: string;
  s3Key: string;
}

// Upload tracking storage (in production, use Redis or database)
const uploadTracking = new Map<string, {
  advisorId: string;
  s3Key: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
}>();

/**
 * Validates file upload parameters
 */
function validateUploadRequest(request: UploadUrlRequest): void {
  const { fileName, fileType, fileSize } = request;

  // Validate file type
  const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
  if (!allowedTypes.includes(fileType)) {
    throw new Error(`File type ${fileType} not allowed. Allowed types: PNG, JPEG, SVG`);
  }

  // Validate file size (2MB for starter, could be higher for other tiers)
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (fileSize > maxSize) {
    throw new Error(`File size ${fileSize} exceeds maximum of ${maxSize} bytes (2MB)`);
  }

  // Validate file name
  if (!fileName || fileName.trim().length === 0) {
    throw new Error('File name is required');
  }

  // Check for suspicious file extensions
  const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.com', '.pif'];
  const hasInvalidExtension = suspiciousExtensions.some(ext =>
    fileName.toLowerCase().includes(ext)
  );

  if (hasInvalidExtension) {
    throw new Error('File type not allowed');
  }
}

/**
 * Generates a unique S3 key for the upload
 */
function generateS3Key(advisorId: string, fileName: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const sanitizedFileName = fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();

  return `advisors/${advisorId}/logos/${timestamp}-${randomSuffix}-${sanitizedFileName}`;
}

/**
 * Generates a unique upload tracking ID
 */
function generateUploadId(): string {
  return `upload_${Date.now()}_${Math.random().toString(36).substring(2)}`;
}

/**
 * Stores upload tracking information
 */
function storeUploadInfo(uploadId: string, info: {
  advisorId: string;
  s3Key: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}): void {
  uploadTracking.set(uploadId, {
    ...info,
    createdAt: new Date(),
  });

  // Cleanup expired tracking info (1 hour TTL)
  setTimeout(() => {
    uploadTracking.delete(uploadId);
  }, 60 * 60 * 1000);
}

/**
 * Retrieves upload tracking information
 */
function getUploadInfo(uploadId: string): {
  advisorId: string;
  s3Key: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
} | null {
  return uploadTracking.get(uploadId) || null;
}

/**
 * Generates a presigned URL for logo upload
 */
export async function generateLogoUploadUrl(request: UploadUrlRequest): Promise<UploadResponse> {
  validateUploadRequest(request);

  const { advisorId, fileName, fileType, fileSize } = request;

  // Generate unique S3 key
  const s3Key = generateS3Key(advisorId, fileName);

  // Create presigned PUT URL
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
    ContentType: fileType,
    ContentLength: fileSize,
    Metadata: {
      'advisor-id': advisorId,
      'original-filename': fileName,
      'upload-timestamp': Date.now().toString(),
    },
  });

  const expiresIn = 3600; // 1 hour
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });

  // Generate tracking ID
  const uploadId = generateUploadId();

  // Store upload info for confirmation
  storeUploadInfo(uploadId, {
    advisorId,
    s3Key,
    fileName,
    fileType,
    fileSize,
  });

  return {
    signedUrl,
    s3Key,
    uploadId,
    expiresIn,
  };
}

/**
 * Confirms successful S3 upload and updates database
 */
export async function confirmLogoUpload(request: ConfirmUploadRequest): Promise<ConfirmUploadResponse> {
  const { uploadId, s3Key, originalFileName } = request;

  // Retrieve upload info
  const uploadInfo = getUploadInfo(uploadId);
  if (!uploadInfo || uploadInfo.s3Key !== s3Key) {
    throw new Error('Invalid upload confirmation - upload not found or key mismatch');
  }

  try {
    // Verify file exists in S3 and get metadata
    const headCommand = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    const s3Response = await s3Client.send(headCommand);
    const actualSize = s3Response.ContentLength || 0;
    const actualType = s3Response.ContentType || uploadInfo.fileType;

    // Validate file was uploaded correctly
    if (Math.abs(actualSize - uploadInfo.fileSize) > 1000) { // Allow 1KB difference for metadata
      throw new Error('Uploaded file size does not match expected size');
    }

    // Generate public URL (CDN or direct S3 URL)
    const logoUrl = `${CDN_BASE_URL}/${s3Key}`;

    // Get current advisor profile to clean up old logo
    const advisor = await prisma.advisorProfile.findUnique({
      where: { id: uploadInfo.advisorId },
      select: { logoS3Key: true, logoUrl: true },
    });

    if (!advisor) {
      throw new Error('Advisor profile not found');
    }

    // Update advisor profile with new logo
    await prisma.advisorProfile.update({
      where: { id: uploadInfo.advisorId },
      data: {
        logoS3Key: s3Key,
        logoContentType: actualType,
        logoFileSize: actualSize,
        logoUploadedAt: new Date(),
        // Update logoUrl for backward compatibility
        logoUrl: logoUrl,
      },
    });

    // Clean up old logo if it exists and is different
    if (advisor.logoS3Key && advisor.logoS3Key !== s3Key) {
      try {
        await deleteS3Object(advisor.logoS3Key);
      } catch (error) {
        console.error('Failed to delete old logo:', error);
        // Don't fail the upload for cleanup issues
      }
    }

    // Clean up upload tracking
    uploadTracking.delete(uploadId);

    return {
      logoUrl,
      s3Key,
    };
  } catch (error) {
    // Clean up failed upload
    try {
      await deleteS3Object(s3Key);
    } catch (cleanupError) {
      console.error('Failed to cleanup failed upload:', cleanupError);
    }

    uploadTracking.delete(uploadId);

    throw new Error(`Upload confirmation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Deletes a logo from S3 and updates database
 */
export async function deleteLogo(advisorId: string): Promise<void> {
  const advisor = await prisma.advisorProfile.findUnique({
    where: { id: advisorId },
    select: { logoS3Key: true },
  });

  if (!advisor || !advisor.logoS3Key) {
    throw new Error('No logo found to delete');
  }

  // Delete from S3
  await deleteS3Object(advisor.logoS3Key);

  // Update database
  await prisma.advisorProfile.update({
    where: { id: advisorId },
    data: {
      logoS3Key: null,
      logoContentType: null,
      logoFileSize: null,
      logoUploadedAt: null,
      logoUrl: null, // Also clear legacy field
    },
  });
}

/**
 * Deletes an S3 object
 */
async function deleteS3Object(s3Key: string): Promise<void> {
  try {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    await s3Client.send(deleteCommand);
  } catch (error) {
    console.error('Failed to delete S3 object:', s3Key, error);
    throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generates a public URL for an S3 object
 */
export function generateAssetUrl(s3Key: string): string {
  return `${CDN_BASE_URL}/${s3Key}`;
}

/**
 * Validates image content for security (basic checks)
 */
export async function validateImageContent(file: ArrayBuffer, mimeType: string): Promise<void> {
  // Convert to Uint8Array for easier processing
  const bytes = new Uint8Array(file);

  // Check file headers for common image formats
  const signatures = {
    'image/png': [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/svg+xml': [0x3C], // '<' character for XML/SVG
  };

  const signature = signatures[mimeType as keyof typeof signatures];
  if (signature) {
    const fileHeader = Array.from(bytes.slice(0, signature.length));
    const isValid = signature.every((byte, index) => fileHeader[index] === byte);

    if (!isValid) {
      throw new Error('File header does not match declared MIME type');
    }
  }

  // For SVG files, perform additional security checks
  if (mimeType === 'image/svg+xml') {
    const content = new TextDecoder().decode(bytes);

    // Check for potentially dangerous SVG content
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i, // Event handlers like onclick, onload, etc.
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /<link/i,
      /<meta/i,
      /<style[^>]*>[\s\S]*<\/style>/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(content)) {
        throw new Error('SVG contains potentially malicious content');
      }
    }

    // Ensure it's actually an SVG
    if (!content.includes('<svg')) {
      throw new Error('File does not appear to be a valid SVG');
    }
  }
}

/**
 * Get upload statistics for an advisor
 */
export async function getUploadStatistics(advisorId: string): Promise<{
  totalUploads: number;
  totalSize: number;
  currentLogo: {
    fileName: string;
    fileSize: number;
    contentType: string;
    uploadedAt: Date;
  } | null;
}> {
  // Get current logo info
  const advisor = await prisma.advisorProfile.findUnique({
    where: { id: advisorId },
    select: {
      logoS3Key: true,
      logoContentType: true,
      logoFileSize: true,
      logoUploadedAt: true,
    },
  });

  // Get upload history from audit logs
  const uploadLogs = await prisma.advisorBrandingAuditLog.findMany({
    where: {
      advisorId,
      action: 'UPLOAD_LOGO',
    },
    select: {
      newValues: true,
    },
  });

  const totalUploads = uploadLogs.length;
  const totalSize = uploadLogs.reduce((sum, log) => {
    const fileSize = (log.newValues as any)?.fileSize || 0;
    return sum + fileSize;
  }, 0);

  const currentLogo = advisor?.logoS3Key ? {
    fileName: advisor.logoS3Key.split('/').pop() || 'unknown',
    fileSize: advisor.logoFileSize || 0,
    contentType: advisor.logoContentType || 'unknown',
    uploadedAt: advisor.logoUploadedAt || new Date(),
  } : null;

  return {
    totalUploads,
    totalSize,
    currentLogo,
  };
}