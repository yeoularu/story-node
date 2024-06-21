"use client";

import { createClient } from "@/lib/supabase/client";
import { getPostsByStory, postKeys } from "@/queries/post";
import { getStory, storyKeys } from "@/queries/story";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import PostCardList from "../../../../../_components/post/PostCardList";

export default function Posts() {
  const params = useParams<{ username: string; title: string }>();
  const username = decodeURIComponent(params.username);
  const title = decodeURIComponent(params.title);
  const supabase = createClient();
  const { data: story } = useQuery({
    queryKey: storyKeys.title(username, title),
    queryFn: () => getStory(supabase, username, title),
  });

  const { data: posts } = useQuery({
    queryKey: postKeys.story(username, title),
    queryFn: () => getPostsByStory(supabase, username, title),
  });

  if (!story || !posts) return null;

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 scroll-smooth sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {story && posts && <PostCardList story={story} posts={posts} />}
    </div>
  );
}
