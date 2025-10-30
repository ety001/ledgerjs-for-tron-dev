"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useGlobal, DeviceModel } from "@/app/context/GlobalContext";

// 预配置模板
const presetConfigs = {
  nanosp: {
    model: DeviceModel.nanoSP,
    appName: 'Tron',
    appVersion: '0.7.0',
    coinapps: './bin',
    firmware: '2.0',
    overridesAppPath: `${DeviceModel.nanoSP}/app.elf`,
    seed: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
  },
  stax: {
    model: DeviceModel.stax,
    appName: 'Tron',
    appVersion: '0.7.0',
    coinapps: './bin',
    firmware: '2.0',
    overridesAppPath: `${DeviceModel.stax}/app.elf`,
    seed: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
  },
};



export default function SpeculosSettings() {
  const { state, setSpeculos } = useGlobal();
  const [settings, setSettings] = useState(state.speculos);
  const [open, setOpen] = useState(false);

  const handleInputChange = (field: keyof typeof settings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreset = (presetKey: keyof typeof presetConfigs) => {
    const preset = presetConfigs[presetKey as keyof typeof presetConfigs];
    setSettings(prev => ({
      ...prev,
      ...preset,
      status: prev.status,
      deviceId: prev.deviceId,
    }));
    toast.success(`Loaded ${presetKey} preset`);
  };

  const handleSave = () => {
    setSpeculos(settings);
    setOpen(false);
    toast.success('Settings saved successfully!');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
              <Label htmlFor="model">Preset</Label>
              <Select value={settings.model || undefined} onValueChange={(value) => handlePreset(value as keyof typeof presetConfigs)}>
                <SelectTrigger className="col-span-2 h-8">
                  <SelectValue placeholder="Select a preset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nanosp">Nano S Plus</SelectItem>
                  <SelectItem value="stax">Stax</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={settings.model || ''}
                onChange={(e) => handleInputChange('model', e.target.value)}
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="appName">App Name</Label>
              <Input
                id="appName"
                value={settings.appName}
                onChange={(e) => handleInputChange('appName', e.target.value)}
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="appVersion">App Version</Label>
              <Input
                id="appVersion"
                value={settings.appVersion}
                onChange={(e) => handleInputChange('appVersion', e.target.value)}
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="coinapps">Coin Apps</Label>
              <Input
                id="coinapps"
                value={settings.coinapps}
                onChange={(e) => handleInputChange('coinapps', e.target.value)}
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="firmware">Firmware</Label>
              <Input
                id="firmware"
                value={settings.firmware}
                onChange={(e) => handleInputChange('firmware', e.target.value)}
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="overridesAppPath">Overrides App Path</Label>
              <Input
                id="overridesAppPath"
                value={settings.overridesAppPath}
                onChange={(e) => handleInputChange('overridesAppPath', e.target.value)}
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="seed">Seed</Label>
              <Textarea
                id="seed"
                value={settings.seed}
                onChange={(e) => handleInputChange('seed', e.target.value)}
                className="col-span-2 h-48"
              />
            </div>
            <div className="grid items-center gap-4">
              <Button
                className="bg-teal-500/100"
                onClick={handleSave}
              >Save</Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}