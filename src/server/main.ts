import express from 'express';
import ViteExpress from 'vite-express';
import Trx from '@ledgerhq/hw-app-trx';
import { setEnv } from "@ledgerhq/live-env";
import {
  releaseSpeculosDevice,
  createSpeculosDevice,
  getMemorySpeculosDeviceInternal,
  modelMap,
  DeviceModelId,
} from "@ledgerhq/speculos-transport";
import cleanSpeculos from './cleanSpeculos.js';

const app = express();

app.get('/btn', async (_, res) => {
  const device = getMemorySpeculosDeviceInternal('speculosID-1');
  if (!device) {
    return res.send({'status': 'error', 'msg': 'Device not found'});
  }
  const transport = device.transport;
  const btnRes = await transport.button('right');
  console.log('btnRes:', btnRes);
  res.send({'status': 'success', 'msg': btnRes});
});

app.get('/event_stream', async (req, res) => {
  const device = getMemorySpeculosDeviceInternal('speculosID-1');
  if (!device) {
    return res.send({'status': 'error', 'msg': 'Device not found'});
  }
  const transport = device.transport;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const subscription = transport.automationEvents.subscribe({
    next: (event) => {
      // console.log('Got Event:', event);
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    },
    error: (err) => {
      console.error('event_err:', err);
      res.write(`data: error: ${JSON.stringify(err)}\n\n`);
      res.end();
    },
    complete: () => {
      console.log('event_complete');
      res.write(`data: complete\n\n`);
      res.end();
    },
  });

  req.on('close', () => {
    console.log('Client closed connection');
    subscription.unsubscribe();
    res.end();
  });
});

app.get('/transport', async (_, res) => {
  const device = getMemorySpeculosDeviceInternal('speculosID-1');
  if (!device) {
    return res.send({'status': 'error', 'msg': 'Device not found'});
  }
  const transport = device.transport;
  const btnRes = await transport.button('right'); 
  console.log('btnRes:', btnRes);
  const app = new Trx.default(transport);
  const path = `44'/195'/${0}'/0/0`;
  const appConfig = await app.getAppConfiguration();
  console.log(appConfig);
  const address = await app.getAddress(path);
  console.log(address);
  const signedMsg = await app.signPersonalMessage(path, 'hello world');
  transport.tracer
  res.send({'status': 'success', 'signedMsg': signedMsg, 'address': address});
});

app.get('/create_emulator', async (_, res) => {
  // setEnv('SPECULOS_USE_WEBSOCKET', true);
  // setEnv('DEBUG_HTTP_RESPONSE', true);
  const inss = cleanSpeculos();
  console.log("All speculos instances have been cleaned up.", inss);
  // DeviceModelId.nanoSP
  const device = await createSpeculosDevice({
    model: DeviceModelId.nanoS,
    appName: 'Tron',
    appVersion: '0.7.0',
    coinapps: './bin',
    seed: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
    firmware: '2.0',
    overridesAppPath: 'nanos/bin/app.elf',
  });
  console.log(device.appPath, device.id, device.ports);
  // setTimeout(() => {
  //   getMemorySpeculosDeviceInternal(device.id)?.destroy();
  //   console.log('device closed');
  // }, 6000);
  res.send({'status': 'success'});
});


ViteExpress.listen(app, 3000, () =>
  console.log('Server is listening on port 3000...'),
);
