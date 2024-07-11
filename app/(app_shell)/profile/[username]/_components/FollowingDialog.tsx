"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { followKeys, getFolloweeList } from "@/queries/follow";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { useIsClient } from "usehooks-ts";

export default function FollowingDialog({
  currentUserId,
}: Readonly<{ currentUserId: string }>) {
  const supabase = createClient();
  const { data: followeeList } = useQuery({
    queryKey: followKeys.fromUserId(currentUserId),
    queryFn: async () => {
      return getFolloweeList(supabase, currentUserId);
    },
  });
  const isClient = useIsClient();

  const [open, setOpen] = useQueryState("following", { history: "push" });
  if (!isClient) return null;

  return (
    <Dialog
      open={open === "open"}
      onOpenChange={() => setOpen((v) => (v === "open" ? "closed" : "open"))}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="m-2">
          Following {followeeList?.length ?? 0}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle> Your following</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-start gap-2 p-4">
          {followeeList
            ? followeeList.map(({ profiles }) => {
                if (!profiles) return null;
                return (
                  <Button
                    key={profiles.id}
                    variant="ghost"
                    className="flex items-center gap-1"
                    asChild
                  >
                    <Link href={`/profile/${profiles.username}`}>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profiles.avatar_url ?? undefined} />
                        <AvatarFallback>
                          {profiles.name.toUpperCase().at(0)}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm">{profiles.name}</p>
                    </Link>
                  </Button>
                );
              })
            : "Not following anyone yet"}
        </div>
      </DialogContent>
    </Dialog>
  );
}
