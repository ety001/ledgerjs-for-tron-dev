"use client";

import { SpeculosEmulator } from "@/app/context/GlobalContext";

export interface EmulatorCreateResponse {
  status: "success" | "error";
  message: string;
  device: {
    deviceId: string;
    ports: {
      http: number;
      ws: number;
    };
  };
};

export interface EmulatorDestroyResponse {
  status: "success" | "error";
  instances: string[];
};

export async function emulatorCreate(deviceSettings: SpeculosEmulator): Promise<EmulatorCreateResponse> {
  if (deviceSettings.status === "running") {
    return {
      status: "error",
      message: "Emulator is already running",
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
        message: "Failed to create emulator",
      };
    }

    return res.json();
  } catch (error) {
    console.error('Error:', error);
    return {
      status: "error",
      message: "Failed to create emulator",
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
      message: "Failed to destroy emulator",
    };
  }
}