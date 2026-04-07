import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDocumentRequirementForSessionUser } from "@/lib/documents/requirement-access";
import { validateFileUpload } from "@/lib/documents/validation";
import { generateUploadUrl } from "@/lib/documents/s3";
import { z } from "zod";

const uploadUrlSchema = z.object({
  requirementId: z.string().min(1).max(64),
  fileName: z.string().min(1).max(255),
  fileType: z.string().optional().default(""),
  fileSize: z.coerce.number().positive(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedFields = uploadUrlSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validatedFields.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { requirementId, fileName, fileType, fileSize } = validatedFields.data;

    const validation = validateFileUpload(fileName, fileType, fileSize);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { mimeType } = validation;

    const requirement = await getDocumentRequirementForSessionUser(
      session.user.id,
      session.user.role,
      requirementId,
    );

    if (!requirement) {
      return NextResponse.json(
        { error: "Document requirement not found or not assigned to you" },
        { status: 404 }
      );
    }

    // Verify requirement is not already fulfilled
    if (requirement.fulfilled) {
      return NextResponse.json(
        { error: "Document requirement already fulfilled" },
        { status: 400 }
      );
    }

    // Generate presigned URL
    const { signedUrl, key } = await generateUploadUrl(
      requirement.clientId,
      requirementId,
      fileName,
      mimeType,
    );

    return NextResponse.json({ signedUrl, key, contentType: mimeType });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}