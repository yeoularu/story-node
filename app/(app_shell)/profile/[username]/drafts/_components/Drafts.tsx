"use client";

import PostCardList from "@/app/(app_shell)/_components/post/PostCardList";
import { createClient } from "@/lib/supabase/client";
import { getDrafts, postKeys } from "@/queries/post";
import { getStoriesByOwner, storyKeys } from "@/queries/story";
import { User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";

export default function Drafts({
  currentUser,
}: Readonly<{ currentUser: User }>) {
  const supabase = createClient();
  const { data: stories } = useQuery({
    queryKey: storyKeys.listByOwner(currentUser.id),
    queryFn: () => getStoriesByOwner(supabase, currentUser.id),
  });

  const { data: drafts } = useQuery({
    queryKey: postKeys.drafts(),
    queryFn: () => getDrafts(supabase, currentUser.id),
  });

  if (!stories || !drafts) return null;

  if (drafts.length === 0) {
    return (
      <p className="text-lg text-muted-foreground">There are no drafts.</p>
    );
  }

  return (
    <>
      {stories.map((story) => {
        const draftsInStory = drafts.filter(
          (post) => post.story_id === story.id,
        );
        if (draftsInStory.length === 0) return null;
        return (
          <div
            key={story.id}
            className="flex flex-col gap-4 border-b border-border/40 p-6 py-4 text-card-foreground shadow-none"
          >
            <h2 className="flex-grow scroll-m-20 break-words text-3xl font-semibold tracking-tight first:mt-0 sm:min-w-0 sm:flex-shrink">
              {story.title}
            </h2>
            <div className="grid grid-cols-1 gap-4 scroll-smooth sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <PostCardList story={story} posts={draftsInStory} />
            </div>
          </div>
        );
      })}
    </>
  );
}
