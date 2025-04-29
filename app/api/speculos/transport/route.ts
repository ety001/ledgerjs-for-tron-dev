import {
  getMemorySpeculosDeviceInternal,
  SpeculosDeviceInternal,
} from "@ledgerhq/speculos-transport";
import Trx from '@ledgerhq/hw-app-trx';

const opList = [
  'signPersonalMessage',
];

export async function POST(request: Request) {
  const data = await request.json();
  const deviceId = data.deviceId;
  const opType = data.opType;
  if (!opList.includes(opType)) {
    return Response.json({'status': 'error', 'msg': 'Invalid operation type'});
  }
  const device = getMemorySpeculosDeviceInternal(deviceId);
  if (!device) {
    return Response.json({'status': 'error', 'msg': 'Device not found'});
  }
  const opData = data.opData;
  switch (opType) {
    case 'signPersonalMessage':
      const path = opData.path || "44'/195'/0'/0/0"; // Default path if not provided
      const msg = opData.message || 'hello world'; // Default message if not provided
      return await signPersonalMessage(device, path, msg);
    default:
      return Response.json({'status': 'error', 'msg': 'Operation not supported'});
  }
}

async function signPersonalMessage(device: SpeculosDeviceInternal, path: string, message: string) {
  const transport = device.transport;
  const app = new Trx(transport);
  const appConfig = await app.getAppConfiguration();
  console.log(appConfig);
  const address = await app.getAddress(path);
  console.log(address);
  const signedMsg = await app.signPersonalMessage(path, message);
  return Response.json({'status': 'success', 'signedMsg': signedMsg, 'address': address});
}