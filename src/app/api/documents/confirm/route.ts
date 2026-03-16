import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const confirmUploadSchema = z.object({
  requirementId: z.string().cuid(),
  key: z.string().min(1),
  fileName: z.string().min(1).max(255),
  fileSize: z.number().positive(),
  fileMimeType: z.string().min(1),
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
    const validatedFields = confirmUploadSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validatedFields.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { requirementId, key, fileName, fileSize, fileMimeType } = validatedFields.data;

    // Verify the requirement exists and belongs to the authenticated user
    const requirement = await prisma.documentRequirement.findFirst({
      where: {
        id: requirementId,
        clientId: session.user.id,
      },
    });

    if (!requirement) {
      return NextResponse.json(
        { error: "Document requirement not found or not assigned to you" },
        { status: 404 }
      );
    }

    // Update the requirement with file metadata
    const updatedRequirement = await prisma.documentRequirement.update({
      where: { id: requirementId },
      data: {
        fulfilled: true,
        fulfilledAt: new Date(),
        fileKey: key,
        fileName,
        fileSize,
        fileMimeType,
      },
    });

    return NextResponse.json(updatedRequirement);
  } catch (error) {
    console.error("Error confirming upload:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}