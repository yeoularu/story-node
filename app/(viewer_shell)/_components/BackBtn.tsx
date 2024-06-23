"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { folderKeys, getFolder } from "@/queries/folder";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function BackBtn() {
  const router = useRouter();
  const supabase = createClient();
  const { folderId } = useParams<{ folderId: string }>();
  const { data: folder } = useQuery({
    queryKey: folderKeys.id(folderId),
    queryFn: () => getFolder(supabase, folderId),
    enabled: !!folderId,
  });
  const backPath = folder
    ? `/story/${folder?.profiles?.username}/${folder?.stories?.title}`
    : null;
  return (
    <div className="z-50 text-base">
      <Button
        variant="ghost"
        size="icon"
        className="group h-8 w-8 hover:bg-transparent/5 hover:text-inherit"
        onClick={() => {
          backPath ? router.push(backPath) : router.back();
        }}
      >
        <ArrowLeftIcon className="h-4 w-4 opacity-75 group-hover:opacity-100" />
      </Button>
    </div>
  );
}
