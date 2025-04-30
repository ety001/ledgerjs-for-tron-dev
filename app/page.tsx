"use client";

import LedgerHardware from "@/components/ledgerHardware";
import Speculos from "@/components/speculos";
import TronLink from "@/components/tronLink";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SceneSelector from "@/components/sceneSelector";
import { useGlobal, DeviceType } from "@/app/context/GlobalContext";

export default function Home() {
  const { state, setDevice } = useGlobal();

  const handleTabChange = (device: DeviceType) => {
    setDevice(device);
  };

  return (
    <main className="container mx-auto p-4">
      <div className="mb-4">
        <p className="text-2xl font-bold">LedgerJS Developer Tool for Tron</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-8 gap-4">
        <div className="col-span-3">
          <Tabs 
            defaultValue={state.device} 
            className="w-auto"
            onValueChange={(value) => handleTabChange(value as DeviceType)}
          >
            <TabsList>
              <TabsTrigger value={DeviceType.Speculos}>Speculos</TabsTrigger>
              <TabsTrigger value={DeviceType.TronLink}>TronLink</TabsTrigger>
              <TabsTrigger value={DeviceType.LedgerHQ}>Ledger Hardware</TabsTrigger>
            </TabsList>
            <TabsContent value={DeviceType.Speculos}>
              <Speculos />
            </TabsContent>
            <TabsContent value={DeviceType.TronLink}>
              <TronLink />
            </TabsContent>
            <TabsContent value={DeviceType.LedgerHQ}>
              <LedgerHardware />
            </TabsContent>
          </Tabs>
        </div>
        <div className="col-span-5">
          <div>
            <SceneSelector />
          </div>
        </div>
      </div>
    </main>
  );
}
