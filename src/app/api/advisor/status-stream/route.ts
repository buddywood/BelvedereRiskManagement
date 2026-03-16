import { NextRequest } from 'next/server';
import { requireAdvisorRole, getAdvisorProfileOrThrow } from '@/lib/advisor/auth';
import { getClientPipeline } from '@/lib/pipeline/queries';

export async function GET(request: NextRequest) {
  try {
    // Authenticate the advisor
    const { userId } = await requireAdvisorRole();
    const profile = await getAdvisorProfileOrThrow(userId);

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        // Send initial connected event
        const connectedEvent = `event: connected
data: {"timestamp": "${new Date().toISOString()}"}

`;
        controller.enqueue(encoder.encode(connectedEvent));

        // Set up polling interval (every 30 seconds)
        const intervalId = setInterval(async () => {
          try {
            const clients = await getClientPipeline(profile.id);
            const updateEvent = `event: pipeline_update
data: ${JSON.stringify({ clients, timestamp: new Date().toISOString() })}

`;
            controller.enqueue(encoder.encode(updateEvent));
          } catch (error) {
            console.error('Error fetching pipeline update:', error);
            // Send error event but don't close the stream
            const errorEvent = `event: error
data: {"message": "Failed to fetch pipeline update", "timestamp": "${new Date().toISOString()}"}

`;
            controller.enqueue(encoder.encode(errorEvent));
          }
        }, 30000); // 30 seconds

        // Store interval ID for cleanup
        (controller as any).intervalId = intervalId;
      },
      cancel(controller) {
        // Clean up interval on stream close
        if ((controller as any).intervalId) {
          clearInterval((controller as any).intervalId);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });
  } catch (error) {
    console.error('Status stream authentication failed:', error);
    return new Response('Unauthorized', { status: 401 });
  }
}