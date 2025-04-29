"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

export default function SpeculosSettings() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="bg-sky-500/100"
        >Settings</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Speculos Settings</h4>
            <p className="text-sm text-muted-foreground">
              Set the settings for the Speculos emulator.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                defaultValue="nanoS"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="appName">App Name</Label>
              <Input
                id="appName"
                defaultValue="Tron"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="appVersion">App Version</Label>
              <Input
                id="appVersion"
                defaultValue="0.7.0"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="coinAppsPath">Coin Apps Path</Label>
              <Input
                id="coinAppsPath"
                defaultValue="./bin"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="firmware">Firmware</Label>
              <Input
                id="firmware"
                defaultValue="2.0"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="overridesAppPath">Overrides App Path</Label>
              <Input
                id="overridesAppPath"
                defaultValue="nanoS/app.elf"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="seed">Seed</Label>
              <Textarea
                id="seed"
                defaultValue="abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
                className="col-span-2 h-48"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}