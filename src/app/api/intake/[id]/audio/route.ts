import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getIntakeInterview, saveIntakeResponse } from '@/lib/data/intake';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { id: interviewId } = await params;

    // Verify interview ownership
    const interview = await getIntakeInterview(userId, interviewId);
    if (!interview) {
      return NextResponse.json(
        { success: false, error: 'Interview not found' },
        { status: 404 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const audioBlob = formData.get('audio') as Blob;
    const questionId = formData.get('questionId') as string;

    if (!audioBlob || !questionId) {
      return NextResponse.json(
        { success: false, error: 'Missing audio file or questionId' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'intake', interviewId);
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Save audio file to disk
    const fileName = `${questionId}.webm`;
    const filePath = join(uploadsDir, fileName);
    const audioUrl = `/uploads/intake/${interviewId}/${fileName}`;

    const arrayBuffer = await audioBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filePath, buffer);

    // Save response record with audio URL
    const response = await saveIntakeResponse(interviewId, questionId, {
      audioUrl,
      audioDuration: undefined, // Can be calculated client-side if needed
      transcriptionStatus: 'PENDING',
    });

    return NextResponse.json({
      success: true,
      audioUrl,
      responseId: response.id,
    });

  } catch (error) {
    console.error('Audio upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload audio file' },
      { status: 500 }
    );
  }
}