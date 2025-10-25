import {
  getMemorySpeculosDeviceInternal,
} from "@ledgerhq/speculos-transport";

const actionList = [
  'press-and-release',
];

export async function POST(request: Request) {
  const data = await request.json();
  const { deviceId, action, x, y } = data;
  console.log('data:', data);
  if (!actionList.includes(action)) {
    return Response.json({'status': 'error', 'message': 'Invalid action value'});
  }
  const device = getMemorySpeculosDeviceInternal(deviceId);
  console.log('device:', device);
  if (!device) {
    return Response.json({'status': 'error', 'message': 'Device not found'});
  }
  const transport = device.transport;
  if (!('apiPort' in device)) {
    return Response.json({'status': 'error', 'message': 'This device type does not support API port'});
  }
  const port = device?.apiPort;
  const fingerRes = await fetch(`http://localhost:${port}/finger`, {
    method: 'POST',
    body: JSON.stringify({ x, y, action }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!fingerRes.ok) {
    return Response.json({'status': 'error', 'message': 'Failed to press finger'});
  }
  const fingerData = await fingerRes.json();
  console.log('fingerData:', fingerData);
  return Response.json({'status': 'success', 'message': fingerData});
}