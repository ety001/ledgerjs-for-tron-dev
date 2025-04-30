"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CircleChevronLeft, CircleChevronRight, CircleDot } from "lucide-react";
import { useState } from "react";

export default function SignPersonalMessage() {
  const [status, setStatus] = useState<"running" | "stopped">("stopped");

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
          hi
        </CardContent>
      )}
    </Card>
  );
}
