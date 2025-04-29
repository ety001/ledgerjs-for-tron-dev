"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CircleChevronLeft,
  CircleChevronRight,
  CircleDot,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useEffect } from "react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { useGlobal } from "@/app/context/GlobalContext";
import SpeculosSettings from "@/components/speculosSettings";
import { toast } from "sonner";
import { emulatorCreate, emulatorDestroy } from "@/lib/client";

export default function Speculos() {
  const [status, setStatus] = useState<"running" | "stopped">("stopped");
  const [error, setError] = useState<string | null>(null);
  const { state } = useGlobal();

  const handleStart = async () => {
    const res = await emulatorCreate(state.speculos);
    if (res.status === "error") {
      setError(res.message);
      return;
    }
    setError(null);
    setStatus("running");
    toast.success("Emulator created successfully");
  };

  const handleStop = async () => {
    const res = await emulatorDestroy();
    if (res.status === "error") {
      setError(res.message);
      return;
    }
    setError(null);
    setStatus("stopped");
    toast.success("Emulator stopped successfully");
  };

  useEffect(() => {
  }, []);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex flex-row gap-2">
          <Button
            className="bg-teal-500/100"
            onClick={handleStart}
            disabled={status === "running"}
          >Start</Button>
          <Button
            className="bg-rose-500/100"
            onClick={handleStop}
            disabled={status === "stopped"}
          >Stop</Button>
          <SpeculosSettings />
        </CardTitle>
        <CardDescription className="flex flex-row gap-2">
          <span>Speculos Status:</span>
          {status === "running" ? (
            <Badge className="bg-teal-500/100">Running</Badge>
          ) : (
            <Badge className="bg-rose-500/100">Stopped</Badge>
          )}
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
      {status === "running" && (
        <CardContent>
          <div className="flex flex-col gap-4">
            <img
              src="/api/speculos/screenshot"
              alt="Speculos"
              className="w-full"
            />
            <div className="flex justify-center gap-2">
              <Button className="bg-teal-500/100 font-bold">
                <CircleChevronLeft /> Left
              </Button>
              <Button className="bg-amber-500/100 font-bold">
                <CircleDot /> Both
              </Button>
              <Button className="bg-sky-500/100 font-bold">
                Right <CircleChevronRight />
              </Button>
            </div>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="message-2">Event Log</Label>
              <Textarea
                className="h-48"
                placeholder="Waiting for event log..."
                disabled
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
