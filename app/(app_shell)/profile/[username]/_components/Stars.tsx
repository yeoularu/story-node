"use client";

import StoryCard from "@/app/(app_shell)/_components/story/StoryCard";
import { createClient } from "@/lib/supabase/client";
import { getStarsByUserId, starKeys } from "@/queries/star";
import { useQuery } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import Link from "next/link";

export default function Stars({ userId }: Readonly<{ userId: string }>) {
  const supabase = createClient();
  const { data: stars, isPending } = useQuery({
    queryKey: starKeys.userId(userId),
    queryFn: () => getStarsByUserId(supabase, userId),
  });

  if (isPending)
    return (
      <div className="flex w-full justify-center text-primary">
        <LoaderCircle className="animate-spin" />
      </div>
    );

  return (
    <div className="mx-auto max-w-screen-2xl columns-1 gap-6 px-4 sm:columns-2 2xl:columns-3">
      {stars?.map(({ stories: story }) => {
        if (!story) return null;
        return (
          <Link
            href={`/story/${story.profiles?.username}/${story?.title}`}
            key={story.id}
          >
            <StoryCard story={story} />
          </Link>
        );
      })}
    </div>
  );
}
