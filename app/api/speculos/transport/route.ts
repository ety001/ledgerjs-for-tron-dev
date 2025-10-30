import {
  getMemorySpeculosDeviceInternal,
  SpeculosDeviceInternal,
} from "@ledgerhq/speculos-transport";
import Trx from '@ledgerhq/hw-app-trx';

const opList = [
  'signPersonalMessage',
  'signTIP712Message',
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
    case 'signPersonalMessage': {
      const personalPath = opData.path || "44'/195'/0'/0/0"; // Default path if not provided
      if (opData.message === undefined) {
        return Response.json({'status': 'error', 'msg': 'Message is required for personal message signing'});
      }
      const personalMsg = opData.message;
      return await signPersonalMessage(device, personalPath, personalMsg);
    }
    case 'signTIP712Message': {
      const tip712Path = opData.path || "44'/195'/0'/0/0"; // Default path if not provided
      if (opData.message === undefined) {
        return Response.json({'status': 'error', 'msg': 'Message is required for TIP712 signing'});
      }
      const tip712Msg = opData.message;
      return await signTIP712Message(device, tip712Path, tip712Msg);
    }
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

async function signTIP712Message(device: SpeculosDeviceInternal, path: string, message: string) {
  const transport = device.transport;
  const app = new Trx(transport);
  app.setLoadConfig({
    cryptoassetsBaseURL: "http://localhost:8080/cryptoassets",
    calServiceURL: "http://localhost:8080",
  });
  const appConfig = await app.getAppConfiguration();
  console.log(appConfig);
  const address = await app.getAddress(path);
  console.log(address);
  const signedMsg = await app.signTIP712Message(path, message);
  return Response.json({'status': 'success', 'signedMsg': signedMsg, 'address': address});
}