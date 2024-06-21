"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  getNextPostInFolder,
  getPostByTitle,
  getPreviousPostInFolder,
  postKeys,
} from "@/queries/post";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import InfiniteQueryTrigger from "./InfiniteQueryTrigger";
import SinglePost from "./SinglePost";

export default function PostViewer({
  folderId,
  initialTitle,
}: Readonly<{
  folderId: string;
  initialTitle: string;
}>) {
  const supabase = createClient();

  const {
    data,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
  } = useInfiniteQuery({
    queryKey: postKeys.infiniteByFolder(folderId),
    queryFn: ({ pageParam }) => {
      const [type, value] = pageParam;
      if (type === "initialTitle")
        return getPostByTitle(supabase, folderId, value);
      if (type === "next")
        return getNextPostInFolder(supabase, folderId, value);
      if (type === "previous")
        return getPreviousPostInFolder(supabase, folderId, value);
    },
    initialPageParam: ["initialTitle", initialTitle],
    getNextPageParam: (lastPage) => {
      if (!lastPage) return null;
      return ["next", lastPage.inserted_at];
    },
    getPreviousPageParam: (firstPage) => {
      if (!firstPage) return null;
      return ["previous", firstPage.inserted_at];
    },
  });

  useEffect(() => {
    const el = document.getElementById(initialTitle);
    if (el) el.scrollIntoView();
  }, [initialTitle]);

  return (
    <div className="container flex max-w-screen-xl flex-col transition-transform ">
      {hasPreviousPage && (
        <Button
          className="mb-8 ml-auto w-fit"
          size="sm"
          onClick={() => fetchPreviousPage()}
        >
          Load previous post
        </Button>
      )}

      {data?.pages.map((post) => {
        if (post) return <SinglePost key={post.id} post={post} />;
      })}
      {hasNextPage ? (
        <InfiniteQueryTrigger fetchPage={fetchNextPage} />
      ) : (
        <>
          <p className="my-4 text-center">
            You&apos;ve reached the end of this folder.
          </p>
          <Button
            className="mb-8 ml-auto w-full sm:w-fit"
            size="sm"
            onClick={() => window.history.back()}
          >
            Go back
          </Button>
        </>
      )}
    </div>
  );
}
