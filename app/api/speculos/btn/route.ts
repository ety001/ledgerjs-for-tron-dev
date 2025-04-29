import {
  getMemorySpeculosDeviceInternal,
} from "@ledgerhq/speculos-transport";

const btnVal = [
  'left',
  'right',
  'both',
]

export async function POST(request: Request) {
  const data = await request.json();
  const button = data.btn;
  const deviceId = data.deviceId;
  if (!btnVal.includes(button)) {
    return Response.json({'status': 'error', 'message': 'Invalid button value'});
  }
  const device = getMemorySpeculosDeviceInternal(deviceId);
  if (!device) {
    return Response.json({'status': 'error', 'message': 'Device not found'});
  }
  const transport = device.transport;
  const btnRes = await transport.button(button);
  console.log('btnRes:', btnRes);
  return Response.json({'status': 'success', 'message': btnRes});
}