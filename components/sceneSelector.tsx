"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import SignPersonalMessage from "@/components/signPersonalMessage";
import SignTIP712Message from "@/components/signTIP712Message";

const testScenes = [
  {
    value: "signPersonalMessage",
    label: "Sign Personal Message",
  },
  {
    value: "signTIP712Message",
    label: "Sign TIP712 Message",
  },
]

export default function SceneSelector() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")

  return (
    <div className="flex flex-col gap-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            {value
              ? testScenes.find((scene) => scene.value === value)?.label
              : "Select What to Test"}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search ..." className="h-9" />
            <CommandList>
              <CommandEmpty>No scene found.</CommandEmpty>
              <CommandGroup>
                {testScenes.map((scene) => (
                  <CommandItem
                    key={scene.value}
                    value={scene.value}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue)
                      setOpen(false)
                    }}
                  >
                    {scene.label}
                    <Check
                      className={cn(
                        "ml-auto",
                        value === scene.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {value === "signPersonalMessage" && <SignPersonalMessage />}
      {value === "signTIP712Message" && <SignTIP712Message />}
    </div>
  )
}
