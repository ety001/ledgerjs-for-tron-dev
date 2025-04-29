import LedgerHardware from "@/components/ledgerHardware";
import SignPersonalMessage from "@/components/signPersonalMessage";
import SignTIP712Message from "@/components/signTIP712Message";
import Speculos from "@/components/speculos";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SceneSelector from "@/components/sceneSelector";
import { useGlobal, DeviceType } from "@/app/context/GlobalContext";

export default function Home() {
  const { state, setDevice } = useGlobal();

  const handleTabChange = (value: string) => {
    if (value === "speculos") {
      setDevice(DeviceType.Speculos);
    } else if (value === "ledgerHardware") {
      setDevice(DeviceType.LedgerHQ);
    }
  };

  return (
    <main className="container mx-auto p-4">
      <div className="mb-4">
        <p className="text-2xl font-bold">LedgerJS for Tron Developer Tool</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-8 gap-4">
        <div className="col-span-3">
          <Tabs 
            defaultValue={state.device === DeviceType.Speculos ? "speculos" : "ledgerHardware"} 
            className="w-auto"
            onValueChange={handleTabChange}
          >
            <TabsList>
              <TabsTrigger value="speculos">Speculos</TabsTrigger>
              <TabsTrigger value="ledgerHardware">Ledger Hardware</TabsTrigger>
            </TabsList>
            <TabsContent value="speculos">
              <Speculos />
            </TabsContent>
            <TabsContent value="ledgerHardware">
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
