import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getIntakeInterview, saveIntakeResponse } from '@/lib/data/intake';
import { readFile } from 'fs/promises';
import { join } from 'path';

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

    // Parse request body
    const body = await request.json();
    const { questionId } = body;

    if (!questionId) {
      return NextResponse.json(
        { success: false, error: 'Missing questionId' },
        { status: 400 }
      );
    }

    // Find the response to get audio URL
    const existingResponse = interview.responses.find(r => r.questionId === questionId);
    if (!existingResponse?.audioUrl) {
      return NextResponse.json(
        { success: false, error: 'No audio file found for this question' },
        { status: 400 }
      );
    }

    // Update status to PROCESSING
    await saveIntakeResponse(interviewId, questionId, {
      audioUrl: existingResponse.audioUrl,
      audioDuration: existingResponse.audioDuration ?? undefined,
      transcriptionStatus: 'PROCESSING',
    });

    // Read audio file from disk
    const audioPath = join(process.cwd(), 'public', existingResponse.audioUrl);
    console.log('Attempting to read audio file from:', audioPath);

    try {
      const audioBuffer = await readFile(audioPath);

      // Check if OpenAI API key is configured
      if (!process.env.OPENAI_API_KEY) {
        // For development: mark as completed with placeholder transcription
        const placeholderTranscription = "[Transcription unavailable - OpenAI API key not configured]";

        await saveIntakeResponse(interviewId, questionId, {
          audioUrl: existingResponse.audioUrl,
          audioDuration: existingResponse.audioDuration ?? undefined,
          transcription: placeholderTranscription,
          transcriptionStatus: 'COMPLETED',
        });

        return NextResponse.json({
          success: true,
          transcription: placeholderTranscription,
        });
      }

      // Send to OpenAI Whisper API
      const formData = new FormData();
      const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });
      formData.append('file', audioBlob, `${questionId}.webm`);
      formData.append('model', 'whisper-1');

      const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: formData,
      });

      if (!whisperResponse.ok) {
        const errorText = await whisperResponse.text();
        console.error('Whisper API error:', whisperResponse.status, errorText);

        await saveIntakeResponse(interviewId, questionId, {
          audioUrl: existingResponse.audioUrl,
          audioDuration: existingResponse.audioDuration ?? undefined,
          transcriptionStatus: 'FAILED',
        });

        return NextResponse.json(
          { success: false, error: 'Transcription service unavailable' },
          { status: 500 }
        );
      }

      const transcriptionData = await whisperResponse.json();
      const transcription = transcriptionData.text;

      // Update response with transcription
      await saveIntakeResponse(interviewId, questionId, {
        audioUrl: existingResponse.audioUrl,
        audioDuration: existingResponse.audioDuration ?? undefined,
        transcription,
        transcriptionStatus: 'COMPLETED',
      });

      return NextResponse.json({
        success: true,
        transcription,
      });

    } catch (fileError) {
      console.error('Error reading audio file:', fileError);

      await saveIntakeResponse(interviewId, questionId, {
        transcriptionStatus: 'FAILED',
      });

      return NextResponse.json(
        { success: false, error: 'Audio file not found or corrupted' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process transcription' },
      { status: 500 }
    );
  }
}