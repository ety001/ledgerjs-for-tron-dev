"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useState } from "react";

export default function SignTIP712Message() {
  const [status, setStatus] = useState<"running" | "stopped">("stopped");

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex flex-row gap-2">
          Sign TIP712 Message
        </CardTitle>
        <CardDescription className="flex flex-row gap-2">
          Sign TIP712 Message
        </CardDescription>
      </CardHeader>
      {status === "stopped" && (
        <CardContent>
          hi
        </CardContent>
      )}
    </Card>
  );
}