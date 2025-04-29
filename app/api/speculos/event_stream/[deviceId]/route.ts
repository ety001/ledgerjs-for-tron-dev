import {
  getMemorySpeculosDeviceInternal,
} from "@ledgerhq/speculos-transport";

export async function GET({
  params,
}: {
  params: Promise<{ deviceId: string }>
}, request: Request) {
  const deviceId = (await params).deviceId;
  const device = getMemorySpeculosDeviceInternal(deviceId);
  if (!device) {
    return Response.json({'status': 'error', 'msg': 'Device not found'});
  }
  const transport = device.transport;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      const subscription = transport.automationEvents.subscribe({
        next: (event) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        },
        error: (err) => {
          console.error('event_err:', err);
          controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify(err)}\n\n`));
          controller.close();
        },
        complete: () => {
          console.log('event_complete');
          controller.close();
        },
      });

      request.signal.addEventListener('abort', () => {
        console.log('Client closed connection');
        subscription.unsubscribe();
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}