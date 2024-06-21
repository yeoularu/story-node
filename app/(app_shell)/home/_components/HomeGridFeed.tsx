"use client";

import { createClient } from "@/lib/supabase/client";
import { getRecentStoryList, storyKeys } from "@/queries/story";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useQueryState } from "nuqs";
import StoryCard from "../../_components/story/StoryCard";

export default function HomeGridFeed() {
  const [tab] = useQueryState("tab", { history: "push" });

  const supabase = createClient();

  const { data: stories } = useQuery({
    queryKey: storyKeys.list("recent"),
    queryFn: () => getRecentStoryList(supabase),
  });

  const filteredStories =
    tab === "all" || !tab
      ? stories
      : stories?.filter((story) => story.genres?.some((g) => g === tab));

  return (
    <div className="mx-auto max-w-screen-2xl columns-1 gap-6 px-4 sm:columns-2 lg:columns-3 2xl:columns-4">
      {filteredStories?.map((story) => (
        <Link
          href={`/story/${story.profiles?.username}/${story.title}`}
          key={story.id}
        >
          <StoryCard story={story} />
        </Link>
      ))}
    </div>
  );
}
