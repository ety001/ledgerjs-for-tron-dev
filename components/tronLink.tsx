"use client";

import {
  useState,
} from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { TronLinkAdapter, TronWeb } from "@tronweb3/tronwallet-adapter-tronlink";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Loading from "@/components/loading";
import { useEffect } from "react";
export default function TronLink() {
  const [status, setStatus] = useState<"connected" | "not_connected">("not_connected");
  const [address, setAddress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [loading, setLoading] = useState<boolean>(false);
  let tron;
  let tronWeb: TronWeb;
  useEffect(() => {
    tron = window.tron;
    if (!tron) {
      setError("Tron not found");
      return;
    }
    tronWeb = tron.tronWeb as TronWeb;
    if (!tronWeb) {
      setError("TronWeb not found");
      return;
    }
  }, []);

  const handleConnect = async () => {
    try {
      setLoading(true);
      const adapter = new TronLinkAdapter();
      await adapter.connect();
      if (!adapter.address) {
        throw new Error("No address found");
      }
      setAddress(adapter.address);
      tronWeb.trx.getBalance(adapter.address).then((balance) => {
        setBalance((balance / 1000000).toFixed(6));
      });
      setStatus("connected");
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex flex-row gap-2">
          TronLink
        </CardTitle>
        <CardDescription className="flex flex-row gap-2">
          Show TronLink Information
        </CardDescription>
      </CardHeader>
      {error && (
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      )}
      {status === "not_connected" && (
        <CardContent>
          <p>Not connected</p>
          <Button 
            className="bg-teal-500/100"
            onClick={handleConnect}
            disabled={loading}
          >Connect</Button>
        </CardContent>
      )}
      {loading && (
        <CardContent>
          <Loading />
        </CardContent>
      )}
      {status === "connected" && (
        <CardContent>
          <p>Address: {address}</p>
          <p>Balance: {balance} TRX</p>
        </CardContent>
      )}
    </Card>
  )
}