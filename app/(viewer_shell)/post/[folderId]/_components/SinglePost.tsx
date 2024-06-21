"use client";

import { Tables } from "@/lib/types/supabase";
import { useQueryState } from "nuqs";
import { useIntersectionObserver } from "usehooks-ts";

export default function SinglePost({
  post,
}: Readonly<{
  post: Tables<"posts"> & {
    post_links_from: {
      to_post_id: string;
    }[];
    post_links_to: {
      from_post_id: string;
    }[];
  };
}>) {
  const [_, setTitle] = useQueryState("title");

  const { ref } = useIntersectionObserver({
    threshold: 0.8,
    onChange: (isIntersecting) => {
      if (isIntersecting) setTitle(post.title);
    },
  });

  return (
    <div id={post.title ?? undefined} ref={ref} className="min-h-dvh">
      <h1>{post.title}</h1>
    </div>
  );
}
