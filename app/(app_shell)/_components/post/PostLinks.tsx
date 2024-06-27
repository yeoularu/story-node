"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandListItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { createClient } from "@/lib/supabase/client";
import { Tables } from "@/lib/types/supabase";
import { postKeys } from "@/queries/post";
import { getStoryByIdForOwner, storyKeys } from "@/queries/story";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { X } from "lucide-react";
import { useState } from "react";

dayjs.extend(localizedFormat);

export function PostLinks({
  post,
  isOwner = false,
}: Readonly<{
  post: Omit<Tables<"posts">, "content"> & {
    profiles: Tables<"profiles">;
    stories: Tables<"stories">;
    post_links_from: {
      to_post_id: string;
    }[];
    post_links_to: {
      from_post_id: string;
    }[];
  };
  isOwner?: boolean;
}>) {
  const [open, setOpen] = useState(false);
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { data: story, isPending } = useQuery({
    queryKey: storyKeys.id(post.story_id),
    queryFn: () => getStoryByIdForOwner(supabase, post.story_id),
  });

  const { mutate: createLink } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("post_links").insert({
        from_post_id: post.id,
        to_post_id: id,
        story_id: post.story_id,
      });

      if (error) throw new Error(error.code);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: postKeys.id(post.id) });
      queryClient.invalidateQueries({ queryKey: postKeys.id(id) });
      queryClient.invalidateQueries({
        queryKey: postKeys.folder(post.folder_id),
      });

      const toPostFolderId = story?.posts.find((p) => p.id === id)?.folder_id;
      if (toPostFolderId)
        queryClient.invalidateQueries({
          queryKey: postKeys.folder(toPostFolderId),
        });
      queryClient.invalidateQueries({
        queryKey: postKeys.story(post.profiles.username, post.stories.title),
      });
    },
  });

  const { mutate: deleteLink } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("post_links")
        .delete()
        .in("from_post_id", [post.id, id])
        .in("to_post_id", [post.id, id]);

      if (error) throw new Error(error.code);

      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: postKeys.id(post.id) });
      queryClient.invalidateQueries({ queryKey: postKeys.id(id) });
      queryClient.invalidateQueries({
        queryKey: postKeys.folder(post.folder_id),
      });

      const toPostFolderId = story?.posts.find((p) => p.id === id)?.folder_id;
      if (toPostFolderId)
        queryClient.invalidateQueries({
          queryKey: postKeys.folder(toPostFolderId),
        });
      queryClient.invalidateQueries({
        queryKey: postKeys.story(post.profiles.username, post.stories.title),
      });
    },
  });

  if (isPending)
    return (
      <div className="my-2 flex">
        <span className="w-full text-center text-sm text-muted-foreground">
          Loading...
        </span>
      </div>
    );
  if (!story) return null;

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

  const postPathsMap = new Map<string, string[]>();
  story.posts.forEach((p) => {
    const folderPath = folderPathsMap.get(p.folder_id) ?? [];
    const pathArr = [
      ...folderPath,
      p.title ??
        `Untitled draft (Created at ${dayjs(p.inserted_at).format("lll")})`,
    ];
    postPathsMap.set(p.id, pathArr);
  });

  const postLinks = [
    ...post.post_links_from.map(({ to_post_id }) => to_post_id),
    ...post.post_links_to.map(({ from_post_id }) => from_post_id),
  ].filter((id) => postPathsMap.has(id));

  return (
    <>
      <div className="my-2 flex flex-wrap gap-2 px-2">
        {postLinks.length === 0 ? (
          <span className="w-full text-center text-sm text-muted-foreground">
            No links
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Links:</span>
        )}
        {postLinks.map((postId) => {
          if (!postPathsMap.has(postId)) return null;
          return (
            <div className="flex items-center" key={postId}>
              <Badge variant="secondary">
                <span>
                  {postPathsMap.get(postId)?.map((v, i, array) => {
                    if (i === array.length - 1)
                      return (
                        <span key={v} className="font-medium text-foreground">
                          {v}
                        </span>
                      );
                    else return v + "/";
                  })}
                </span>
              </Badge>

              {isOwner && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-3 w-3"
                  onClick={(e) => {
                    e.preventDefault();
                    deleteLink(postId);
                  }}
                >
                  <X className="text-muted-foreground" />
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {isOwner && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="w-fit">
              + Add link
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" avoidCollisions={false} align="start">
            <Command>
              <CommandInput placeholder="Select post to link..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {story.posts.map((p) => (
                    <CommandListItem
                      key={p.id}
                      value={
                        postPathsMap.get(p.id)?.join("/") ??
                        p.title ??
                        `Untitled draft (Created at ${dayjs(p.inserted_at).format("lll")})`
                      }
                      onSelect={() => {
                        createLink(p.id);
                      }}
                    >
                      <p className="text-muted-foreground">
                        {postPathsMap.get(p.id)?.map((v, i, array) => {
                          if (i === array.length - 1)
                            return (
                              <span
                                key={v}
                                className="font-medium text-foreground"
                              >
                                {v}
                              </span>
                            );
                          else return v + "/";
                        })}
                      </p>
                    </CommandListItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </>
  );
}
