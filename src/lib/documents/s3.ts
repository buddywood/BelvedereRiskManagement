import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { DocumentUploadResponse } from './types';

// Initialize S3 client lazily at runtime to avoid build errors when env vars missing
function createS3Client(): S3Client | null {
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!region || !accessKeyId || !secretAccessKey) {
    console.warn("AWS credentials not configured - S3 operations will fail");
    return null;
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export async function generateUploadUrl(
  userId: string,
  requirementId: string,
  fileName: string,
  fileType: string
): Promise<DocumentUploadResponse> {
  const client = createS3Client();
  if (!client) {
    throw new Error("S3 client not configured - check AWS environment variables");
  }

  const bucketName = process.env.S3_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("S3_BUCKET_NAME environment variable not configured");
  }

  const key = `documents/${userId}/${requirementId}/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: fileType,
  });

  const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 }); // 1 hour expiry

  return { signedUrl, key };
}

export async function generateDownloadUrl(key: string): Promise<string> {
  const client = createS3Client();
  if (!client) {
    throw new Error("S3 client not configured - check AWS environment variables");
  }

  const bucketName = process.env.S3_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("S3_BUCKET_NAME environment variable not configured");
  }

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  return getSignedUrl(client, command, { expiresIn: 3600 }); // 1 hour expiry
}