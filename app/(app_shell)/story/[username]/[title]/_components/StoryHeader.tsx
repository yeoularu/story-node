"use client";

import ToggleStarBtn from "@/app/(app_shell)/_components/story/ToggleStarBtn";
import { sessionAtom } from "@/atoms/session";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { genresMap } from "@/lib/data/genresData";
import { createClient } from "@/lib/supabase/client";
import { getStory, storyKeys } from "@/queries/story";
import { User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import Link from "next/link";
import { useParams } from "next/navigation";
import OwnerDropdownMenu from "./story/OwnerDropdownMenu";

export default function StoryHeader({
  currentUser,
}: Readonly<{ currentUser?: User }>) {
  const supabase = createClient();
  const params = useParams<{ username: string; title: string }>();

  const username = decodeURIComponent(params.username);
  const title = decodeURIComponent(params.title);

  const {
    data: story,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: storyKeys.title(username, title),
    queryFn: () => getStory(supabase, username, title),
  });

  const session = useAtomValue(sessionAtom);
  const isOwner = session?.user?.id === story?.profiles?.id;

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error?.message}</div>;
  }

  if (!story) {
    return <div>Story not found</div>;
  }

  return (
    <div className="rounded-none border-b border-border/40 bg-transparent py-4 shadow-none">
      <div className="mb-1 sm:flex sm:flex-row-reverse sm:justify-between">
        <div className="flex items-center justify-end gap-2">
          {isOwner && <OwnerDropdownMenu story={story} />}
          {story.profiles !== null && (
            <ToggleStarBtn userId={currentUser?.id} story={story} />
          )}
        </div>
        <h1 className="flex-grow scroll-m-20 break-words text-3xl font-semibold tracking-tight first:mt-0 sm:min-w-0 sm:flex-shrink">
          {story.title}
        </h1>
      </div>

      <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
        {story.description}
      </p>

      {story.profiles && (
        <div className="mt-2 flex justify-between">
          <Popover>
            <PopoverTrigger>
              <Button variant="ghost" size="sm" asChild>
                {story.genres && (
                  <div className="flex gap-1 text-xl">
                    {story.genres.map((genre) => (
                      <div key={genre}>{genresMap.get(genre)}</div>
                    ))}
                  </div>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit">
              {story.genres?.map((genre) => (
                <p key={genre}>{genresMap.get(genre) + " " + genre}</p>
              ))}
            </PopoverContent>
          </Popover>

          <Button variant="ghost" className="flex items-center gap-1" asChild>
            <Link href={`/profile/${story.profiles.username}`}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={story.profiles.avatar_url ?? undefined} />
                <AvatarFallback>
                  {story.profiles.name.toUpperCase().at(0)}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm">{story.profiles.name}</p>
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
