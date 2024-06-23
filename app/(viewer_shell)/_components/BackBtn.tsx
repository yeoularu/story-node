"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackBtn() {
  const router = useRouter();

  return (
    <div className="z-50 text-base">
      <Button
        variant="ghost"
        size="icon"
        className="group h-8 w-8 hover:bg-transparent/5 hover:text-inherit"
        onClick={() => {
          router.back();
        }}
      >
        <ArrowLeftIcon className="h-4 w-4 opacity-75 group-hover:opacity-100" />
      </Button>
    </div>
  );
}
