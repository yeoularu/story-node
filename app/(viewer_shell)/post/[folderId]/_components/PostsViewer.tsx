"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { folderKeys, getFolder } from "@/queries/folder";
import {
  getNextPostInFolder,
  getPostByTitle,
  getPreviousPostInFolder,
  postKeys,
} from "@/queries/post";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Link from "next/link";
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

  const { data: folder } = useQuery({
    queryKey: folderKeys.id(folderId),
    queryFn: () => getFolder(supabase, folderId),
  });
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
    <div className="flex max-w-screen-xl flex-col transition-transform">
      <div className="mb-8 flex flex-col items-center justify-between gap-2 sm:flex-row">
        <Button
          className="w-full sm:w-fit"
          size="sm"
          variant="secondary"
          asChild
        >
          <Link
            href={`/story/${folder?.profiles?.username}/${folder?.stories?.title}`}
          >
            Go to story page
          </Link>
        </Button>
        {hasPreviousPage && (
          <Button
            className="w-full sm:w-fit"
            size="sm"
            onClick={() => fetchPreviousPage()}
          >
            Load previous post
          </Button>
        )}
      </div>

      {data?.pages.map((post) => {
        if (post) return <SinglePost key={post.id} post={post} />;
      })}
      {hasNextPage ? (
        <InfiniteQueryTrigger fetchPage={fetchNextPage} />
      ) : (
        <>
          <p className="mt-4 text-center">
            You&apos;ve reached the end of this folder.
          </p>
          <div className="my-4 flex flex-wrap items-center justify-center gap-2 text-center text-muted-foreground">
            <Badge variant="outline" className="text-inherit">
              Tip
            </Badge>
            Click on the title above to visit the linked posts.
          </div>
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
