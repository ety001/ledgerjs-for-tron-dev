"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

export enum DeviceType {
  Speculos = 'speculos',
  LedgerHQ = 'ledgerhq',
  TronLink = 'tronlink',
}

export enum DeviceModel {
  nanoS = 'nanoS',
  nanoX = 'nanoX',
  nanoSP = 'nanoSP',
  stax = 'stax',
}

export interface SpeculosEmulator {
  status: boolean;
  deviceId: string;
  model: DeviceModel | null;
  appName: string;
  appVersion: string;
  coinapps: string;
  firmware: string;
  overridesAppPath: string;
  seed: string;
}

export interface LedgerHQEmulator {
  status: boolean;
  model: DeviceModel | null;
  appName: string;
  appVersion: string;
}

interface GlobalState {
  device: DeviceType;
  speculos: SpeculosEmulator;
  ledgerHQ: LedgerHQEmulator;
}

interface GlobalContextType {
  state: GlobalState;
  setDevice: (device: DeviceType) => void;
  setSpeculos: (speculos: SpeculosEmulator) => void;
  setLedgerHQ: (ledgerHQ: LedgerHQEmulator) => void;
}

const defaultState: GlobalState = {
  device: DeviceType.Speculos,
  speculos: {
    status: false,
    deviceId: '',
    model: DeviceModel.nanoS,
    appName: 'Tron',
    appVersion: '0.7.0',
    coinapps: './bin',
    firmware: '2.0',
    overridesAppPath: 'nanoS/app.elf',
    seed: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
  },
  ledgerHQ: {
    status: false,
    model: null,
    appName: '',
    appVersion: '',
  },
};

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GlobalState>(defaultState);

  const setDevice = (device: DeviceType) => {
    setState(prevState => ({
      ...prevState,
      device
    }));
  };

  const setSpeculos = (speculos: SpeculosEmulator) => {
    setState(prevState => ({
      ...prevState,
      speculos,
    }));
  };

  const setLedgerHQ = (ledgerHQ: LedgerHQEmulator) => {
    setState(prevState => ({
      ...prevState,
      ledgerHQ,
    }));
  };

  return (
    <GlobalContext.Provider 
      value={{ 
        state, 
        setDevice,
        setSpeculos,
        setLedgerHQ,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobal() {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return context;
} 