"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { User } from "@supabase/supabase-js";
import { Minus, Plus, Settings2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useLocalStorage, useMediaQuery } from "usehooks-ts";
import {
  fontSizeVariants,
  fontVariants,
  themeVariants,
} from "../_data/settingsData";

export default function ViewerSettingsPanel({
  currentUser,
}: Readonly<{
  currentUser?: User;
}>) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)", {
    initializeWithValue: false,
  });
  const handleClose = () => setOpen(false);
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="z-50 text-base">
            <Button
              variant="ghost"
              size="icon"
              className="group h-8 w-8 hover:bg-transparent/5 hover:text-inherit"
            >
              <Settings2 className="h-4 w-4 opacity-75 group-hover:opacity-100" />
            </Button>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Display preferences</DialogTitle>
            <DialogDescription>
              Customize your reading preferences to enhance readability and
              comfort.
            </DialogDescription>
          </DialogHeader>
          <SettingPanel currentUser={currentUser} close={handleClose} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <div className="z-50 text-base">
          <Button
            variant="ghost"
            size="icon"
            className="group h-8 w-8 hover:bg-transparent/5 hover:text-inherit"
          >
            <Settings2 className="h-4 w-4 opacity-75 group-hover:opacity-100" />
          </Button>
        </div>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Display preferences</DrawerTitle>
          <DrawerDescription>
            Customize your reading preferences to enhance readability and
            comfort.
          </DrawerDescription>
        </DrawerHeader>
        <SettingPanel
          className="px-4"
          currentUser={currentUser}
          close={handleClose}
        />
        <DrawerFooter className="pt-2"></DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function SettingPanel({
  className,
  currentUser,
  close,
}: React.ComponentProps<"div"> & {
  currentUser?: User;
  close: () => void;
}) {
  const { theme } = useTheme();

  const [value, setValue, removeValue] = useLocalStorage(
    "viewer-settings:" + currentUser?.id,
    { font: "default", fontSize: "16", viewerTheme: theme ?? "system" },
  );

  const fontSizeArray = Object.keys(fontSizeVariants);
  const fontSizeIndex = fontSizeArray.indexOf(value.fontSize);
  const isMax = fontSizeIndex === fontSizeArray.length - 1;
  const isMin = fontSizeIndex === 0;

  return (
    <div className={cn("grid items-start gap-6", className)}>
      <div
        className={cn(
          "m-auto rounded p-8",
          fontVariants[value.font],
          fontSizeVariants[value.fontSize],
          themeVariants[value.viewerTheme],
        )}
      >
        story-node.
      </div>
      <div className="grid gap-2">
        <Label>Font</Label>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(fontVariants).map(([k, v]) => (
            <Button
              key={k}
              variant="outline"
              className={v}
              onClick={() => setValue({ ...value, font: k })}
            >
              {k}
            </Button>
          ))}
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Font Size</Label>
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-full"
            onClick={() =>
              setValue({ ...value, fontSize: fontSizeArray[fontSizeIndex - 1] })
            }
            disabled={isMin}
          >
            <Minus className="h-4 w-4" />
            <span className="sr-only">Decrease</span>
          </Button>
          <div className="flex-1 text-center">
            <div className="text-2xl font-bold tracking-tighter">
              {value.fontSize}
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-full"
            onClick={() =>
              setValue({ ...value, fontSize: fontSizeArray[fontSizeIndex + 1] })
            }
            disabled={isMax}
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Increase</span>
          </Button>
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Theme</Label>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(themeVariants).map(([k, v]) => (
            <Button
              key={k}
              variant="outline"
              className={v}
              onClick={() => setValue({ ...value, viewerTheme: k })}
            >
              {k}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <Button variant="outline" onClick={removeValue}>
          Reset
        </Button>

        <p className="text-sm text-muted-foreground">
          Auto-saved. Feel free to{" "}
          <button onClick={close} className="underline underline-offset-2">
            Close
          </button>
          {"."}
        </p>
      </div>
    </div>
  );
}
