"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import { getProfileById, profileKeys } from "@/queries/profile";
import { User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import {
  FilePenLine,
  Library,
  Settings,
  Star,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";

export default function AvatarNav({
  user,
}: Readonly<{
  user: User;
}>) {
  const supabase = createClient();

  const { data: profile } = useQuery({
    queryKey: profileKeys.id(user.id),
    queryFn: () => getProfileById(supabase, user.id),
  });

  const signOut = () => {
    supabase.auth.signOut();
    window.location.href = "/login";
  };

  const { name, username, avatar_url } = profile ?? user.user_metadata;

  return (
    <Sheet>
      <SheetTrigger>
        <Avatar>
          <AvatarImage src={avatar_url ?? undefined} />
          <AvatarFallback>{name.toUpperCase().at(0)}</AvatarFallback>
        </Avatar>
      </SheetTrigger>
      <SheetContent>
        <ScrollArea className="h-[calc(100dvh-3rem)]">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={avatar_url ?? undefined} />
              <AvatarFallback>{name.toUpperCase().at(0)}</AvatarFallback>
            </Avatar>
            <SheetHeader>
              <SheetTitle>{name}</SheetTitle>
              <SheetDescription>@{username}</SheetDescription>
            </SheetHeader>
          </div>
          <nav className="mt-2 flex flex-col gap-2">
            <SheetTrigger asChild>
              <Button variant="menu" asChild>
                <Link href={`/profile/${username}`}>
                  <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  Your profile
                </Link>
              </Button>
            </SheetTrigger>

            <Separator />

            <SheetTrigger asChild>
              <Button variant="menu" asChild>
                <Link href={`/profile/${username}?tab=stories`}>
                  <Library className="mr-2 h-4 w-4 text-muted-foreground" />
                  Your stories
                </Link>
              </Button>
            </SheetTrigger>

            <SheetTrigger asChild>
              <Button variant="menu" asChild>
                <Link href={`/profile/${username}/drafts`}>
                  <FilePenLine className="mr-2 h-4 w-4 text-muted-foreground" />
                  Your drafts
                </Link>
              </Button>
            </SheetTrigger>

            <SheetTrigger asChild>
              <Button variant="menu" asChild>
                <Link href={`/profile/${username}?tab=stars`}>
                  <Star className="mr-2 h-4 w-4 text-muted-foreground" />
                  Your stars
                </Link>
              </Button>
            </SheetTrigger>

            <Separator />
            <SheetTrigger asChild>
              <Button variant="menu" asChild>
                <Link href={`/profile/${username}/settings`}>
                  <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                  Settings
                </Link>
              </Button>
            </SheetTrigger>
            <Separator />

            <Button variant="menu" onClick={signOut}>
              Sign out
            </Button>
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
