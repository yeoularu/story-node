"use client";

import { Tables } from "@/lib/types/supabase";
import PostCard from "./PostCard";
import PostDropdownMenu from "./PostDropdownMenu";

type PostWithLinks = Omit<Tables<"posts">, "content"> & {
  profiles: Tables<"profiles">;
  stories: Tables<"stories">;
  post_links_from: {
    to_post_id: string;
  }[];
  post_links_to: {
    from_post_id: string;
  }[];
};

export default function PostCardList({
  story,
  posts,
}: Readonly<{
  story: Tables<"stories"> & { folders: Tables<"folders">[] };
  posts: PostWithLinks[];
}>) {
  const folderPathsMap = new Map<string, string[]>();
  story.folders.forEach((f) => {
    const reversedPath: string[] = [];
    let parentId: string | null = f.id;
    while (parentId) {
      const parent = story.folders.find((f) => f.id === parentId);
      if (parent) {
        reversedPath.push(parent.parent_id ? parent.name : "");
        parentId = parent.parent_id;
      }
    }
    folderPathsMap.set(f.id, reversedPath.toReversed());
  });
  return (
    <>
      {posts.map((post) => (
        <div className="relative" key={post.id}>
          <div className="absolute right-1 top-1">
            <PostDropdownMenu post={post} />
          </div>
          <PostCard
            post={post}
            content={
              <span className="line-clamp-2 min-h-12 whitespace-pre-wrap break-words text-muted-foreground">
                {folderPathsMap.get(post.folder_id)?.map((v, i, array) => {
                  if (i === array.length - 1)
                    return (
                      <span key={v} className="font-medium text-foreground">
                        {v}
                      </span>
                    );
                  else return v + "/";
                })}
              </span>
            }
          />
        </div>
      ))}
    </>
  );
}
