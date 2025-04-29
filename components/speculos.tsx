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
import { useState, useRef } from "react";
import { useEffect } from "react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { useGlobal } from "@/app/context/GlobalContext";
import SpeculosSettings from "@/components/speculosSettings";
import { toast } from "sonner";
import { emulatorCreate, emulatorDestroy, sendBtn, BtnKey } from "@/lib/client";

export default function Speculos() {
  const [status, setStatus] = useState<"running" | "stopped">("stopped");
  const [timestamp, setTimestamp] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [eventLog, setEventLog] = useState<string>("");
  const {state, setSpeculos} = useGlobal();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleStart = async () => {
    if (status === "running") {
      toast.error("Emulator is already running");
      return;
    }
    setError(null);
    const res = await emulatorCreate(state.speculos);
    if (res.status === "error") {
      setError(res.msg ?? "Failed to create emulator");
      return;
    }
    if (!res.device) {
      setError("Failed to create emulator");
      return;
    }
    setStatus("running");
    setSpeculos({
      ...state.speculos,
      status: true,
      deviceId: res.device.deviceId,
    });
    setTimestamp(Date.now().toString());
    toast.success("Emulator created successfully");
  };

  const handleStop = async () => {
    if (status === "stopped") {
      toast.error("Emulator is already stopped");
      return;
    }
    setError(null);
    const res = await emulatorDestroy();
    if (res.status === "error") {
      setError(res.msg ?? "Failed to stop emulator");
      return;
    }
    setStatus("stopped");
    setSpeculos({
      ...state.speculos,
      status: false,
      deviceId: '',
    });
    toast.success("Emulator stopped successfully");
  };

  const handleBtn = async (btnKey: string) => {
    const res = await sendBtn(state.speculos.deviceId, btnKey);
    if (res.status === "error") {
      setError(res.msg ?? "Failed to press button");
      return;
    }
    setTimestamp(Date.now().toString());
  };

  useEffect(() => {
    setStatus(state.speculos.status ? "running" : "stopped");
  }, []);

  useEffect(() => {
    if (status === "running") {
      const eventStream = new EventSource(`/api/speculos/event_stream/${state.speculos.deviceId}`);
      
      eventStream.onmessage = (event) => {
        const logEntry = `${event.data}\n`;
        setEventLog(prev => prev + logEntry);
        setTimestamp(Date.now().toString());
        
        if (textareaRef.current) {
          textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
        }
      };

      return () => {
        eventStream.close();
      };
    }
  }, [status, state.speculos.deviceId, timestamp]);

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
              src={`/api/speculos/screenshot?force=${timestamp}&deviceId=${state.speculos.deviceId}`}
              alt="Speculos"
              className="w-full"
            />
            <div className="flex justify-center gap-2">
              <Button
                className="bg-teal-500/100 font-bold"
                onClick={() => handleBtn(BtnKey.LEFT)}
              >
                <CircleChevronLeft /> Left
              </Button>
              <Button
                className="bg-amber-500/100 font-bold"
                onClick={() => handleBtn(BtnKey.BOTH)}
              >
                <CircleDot /> Both
              </Button>
              <Button
                className="bg-sky-500/100 font-bold"
                onClick={() => handleBtn(BtnKey.RIGHT)}
              >
                Right <CircleChevronRight />
              </Button>
            </div>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="eventlog">Event Log</Label>
              <Textarea
                ref={textareaRef}
                id="eventlog"
                value={eventLog}
                className="h-48 font-mono text-sm"
                readOnly
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
