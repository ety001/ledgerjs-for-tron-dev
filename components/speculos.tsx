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
import SpeculosSettings from "./speculosSettings";

export default function Speculos() {
  const [status, setStatus] = useState<"running" | "stopped">("stopped");
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus("running");
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex flex-row gap-2">
          <Button
            className="bg-teal-500/100"
          >Start</Button>
          <Button
            disabled
            className="bg-rose-500/100"
          >Stop</Button>
          <SpeculosSettings />
        </CardTitle>
        <CardDescription className="flex flex-row gap-2">
          <span>Speculos Status:</span>
          <Badge className="bg-teal-500/100">Running</Badge>
          <Badge className="bg-rose-500/100">Stopped</Badge>
        </CardDescription>
      </CardHeader>
      {true && (
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Your session has expired. Please log in again.
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
              <Label htmlFor="message-2">Seeds</Label>
              <Textarea
                className="h-18"
                placeholder="abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
                disabled
              />
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
