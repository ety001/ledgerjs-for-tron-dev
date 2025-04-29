import {
  getMemorySpeculosDeviceInternal,
} from "@ledgerhq/speculos-transport";
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const force = searchParams.get('force');
  const deviceId = searchParams.get('deviceId');
  const timestamp = force || Date.now().toString();

  console.log('Force value:', force);
  console.log('Using timestamp:', timestamp);
  console.log('Device ID:', deviceId);

  if (!deviceId) {
    return Response.json({'status': 'error', 'msg': 'Device ID is required'});
  }

  const device = getMemorySpeculosDeviceInternal(deviceId);
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