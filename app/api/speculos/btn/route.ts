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
  if (!btnVal.includes(button)) {
    return Response.json({'status': 'error', 'msg': 'Invalid button value'});
  }
  const device = getMemorySpeculosDeviceInternal('speculosID-1');
  if (!device) {
    return Response.json({'status': 'error', 'msg': 'Device not found'});
  }
  const transport = device.transport;
  const btnRes = await transport.button(button);
  console.log('btnRes:', btnRes);
  return Response.json({'status': 'success', 'msg': btnRes});
}