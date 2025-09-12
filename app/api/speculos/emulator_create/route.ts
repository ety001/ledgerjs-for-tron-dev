import {
  createSpeculosDevice,
  DeviceModelId,
} from "@ledgerhq/speculos-transport";
import cleanSpeculos from '@/lib/cleanSpeculos';

const defaultSeed = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
const defaultModel = DeviceModelId.nanoSP;

export async function POST(request: Request) {
  const {
    model,
    appName,
    appVersion,
    seed,
    firmware,
    overridesAppPath,
  } = await request.json();
  const inss = cleanSpeculos();
  console.log("All speculos instances have been cleaned up.", inss);
  const device = await createSpeculosDevice({
    model: model ?? defaultModel,
    appName: appName ?? 'Tron',
    appVersion: appVersion ?? '0.7.0',
    coinapps: './bin',
    seed: seed ?? defaultSeed,
    firmware: firmware ?? '2.0',
    overridesAppPath: overridesAppPath ?? `${defaultModel}/app.elf`,
  });
  console.log(device.id, device.ports);
  return Response.json({
    'status': 'success',
    'device': {
      deviceId: device.id,
      ports: device.ports,
    }
  });
}