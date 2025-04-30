"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useGlobal } from "@/app/context/GlobalContext";

export default function SignPersonalMessage() {
  const [status, setStatus] = useState<"running" | "stopped">("stopped");
  const { state } = useGlobal();

  const handleStart = () => {
    console.log("Current device:", state.device);
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex flex-row gap-2">
          Sign Personal Message
        </CardTitle>
        <CardDescription className="flex flex-row gap-2">
          Sign Personal Message
        </CardDescription>
      </CardHeader>
      {status === "stopped" && (
        <CardContent>
          <Button
            onClick={handleStart}
          >Start</Button>
        </CardContent>
      )}
    </Card>
  );
}
