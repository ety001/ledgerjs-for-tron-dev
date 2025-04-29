import LedgerHardware from "@/components/ledgerHardware";
import SignPersonalMessage from "@/components/signPersonalMessage";
import SignTIP712Message from "@/components/signTIP712Message";
import Speculos from "@/components/speculos";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SceneSelector from "@/components/sceneSelector";
import { useGlobal } from "@/app/context/GlobalContext";

export default function Home() {
  const { state, connectWallet, disconnectWallet, updateNetwork } = useGlobal();

  const handleConnect = () => {
    // 使用抽离的函数更新状态
    connectWallet("0x1234567890abcdef", "testnet");
  };

  const handleDisconnect = () => {
    // 使用抽离的函数更新状态
    disconnectWallet();
  };

  const handleNetworkChange = (network: string) => {
    // 使用抽离的函数更新状态
    updateNetwork(network);
  };

  return (
    <main className="container mx-auto p-4">
      <div className="mb-4">
        <p className="text-2xl font-bold">LedgerJS for Tron Developer Tool</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-8 gap-4">
        <div className="col-span-3">
          <Tabs defaultValue="speculos" className="w-auto">
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
