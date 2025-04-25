import {
  getMemorySpeculosDeviceInternal,
} from "@ledgerhq/speculos-transport";

export async function GET() {
  const timestamp = Date.now();
  const device = getMemorySpeculosDeviceInternal('speculosID-1');
  if (!device) {
    return Response.json({'status': 'error', 'msg': 'Device not found'});
  }
  if (!('apiPort' in device)) {
    return Response.json({'status': 'error', 'msg': 'This device type does not support API port'});
  }
  const port = device?.apiPort;
  try {
    const url = `http://localhost:${port}/screenshot?force=${timestamp}`;
    const imageResponse = await fetch(url);
    return new Response(imageResponse.body, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Get Image Error:', error);
    return Response.json(
      {'status': 'error', 'msg': 'Failed to fetch screenshot'},
      {status: 500}
    );
  }
}