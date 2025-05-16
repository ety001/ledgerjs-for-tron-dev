"use client";

import { SpeculosEmulator } from "@/app/context/GlobalContext";

export interface EmulatorCreateResponse {
  status: "success" | "error";
  msg: string | undefined;
  device: {
    deviceId: string;
    ports: {
      http: number;
      ws: number;
    };
  } | undefined;
};

export interface EmulatorDestroyResponse {
  status: "success" | "error";
  msg: string | undefined;
  instances: string[] | undefined;
};

export enum BtnKey {
  LEFT = 'left',
  RIGHT = 'right',
  BOTH = 'both',
};

export async function emulatorCreate(deviceSettings: SpeculosEmulator): Promise<EmulatorCreateResponse> {
  if (deviceSettings.status) {
    return {
      status: "error",
      msg: "Emulator is already running",
      device: undefined,
    };
  }

  try {
    const res = await fetch('/api/speculos/emulator_create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...deviceSettings,
      }),
    });

    if (!res.ok) {
      return {
        status: "error",
        msg: "Failed to create emulator",
        device: undefined,
      };
    }

    return res.json();
  } catch (error) {
    console.error('Error:', error);
    return {
      status: "error",
      msg: "Failed to create emulator",
      device: undefined,
    };
  }
}

export async function emulatorDestroy(): Promise<EmulatorDestroyResponse> {
  try {
    const res = await fetch('/api/speculos/emulator_destroy');
    return res.json();
  } catch (error) {
    console.error('Error:', error);
    return {
      status: "error",
      msg: "Failed to destroy emulator",
      instances: undefined,
    };
  }
}

export interface BtnResponse {
  status: "success" | "error";
  msg: string | undefined;
};

export async function sendBtn(deviceId: string, btnKey: string): Promise<BtnResponse> {
  if (!Object.values(BtnKey).includes(btnKey as BtnKey)) {
    return {
      status: "error",
      msg: "Invalid button key",
    };
  }
  try {
    const res = await fetch(`/api/speculos/btn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deviceId, btn: btnKey }),
    });
    return res.json();
  } catch (error) {
    console.error('Error:', error);
    return {
      status: "error",
      msg: "Failed to press button",
    };
  }
}

export interface TransportResponse {
  status: "success" | "error";
  msg: string | undefined;
  signedMsg: string | undefined;
  address: string | undefined;
};

export async function transport(deviceId: string, opType: string, opData: any): Promise<TransportResponse> {
  try {
    const res = await fetch(`/api/speculos/transport`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deviceId, opType, opData }),
    });
    return res.json();
  } catch (error) {
    console.error('Error:', error);
    return {
      status: "error",
      msg: "Failed to create transport",
    };
  }
}