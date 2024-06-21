"use client";

import { sessionAtom } from "@/atoms/session";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { createClient } from "@/lib/supabase/client";
import { Tables } from "@/lib/types/supabase";
import { getPostsByStory, postKeys } from "@/queries/post";
import { getStory, storyKeys } from "@/queries/story";
import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { useParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { Fragment } from "react";
import { useMediaQuery } from "usehooks-ts";
import PostCardList from "../../../../../_components/post/PostCardList";
import FolderDetailTree from "./FolderDetailTree";
import { UpsertFolderDialog } from "./UpsertFolderDialog";

export default function Folders() {
  const supabase = createClient();

  const params = useParams<{ username: string; title: string }>();

  const username = decodeURIComponent(params.username);
  const title = decodeURIComponent(params.title);

  const isWideDesktop = useMediaQuery("(min-width: 1440px)", {
    initializeWithValue: false,
  });

  const session = useAtomValue(sessionAtom);

  const {
    data: story,
    isError,
    error,
  } = useQuery({
    queryKey: storyKeys.title(username, title),
    queryFn: () => getStory(supabase, username, title),
  });

  const { data: posts } = useQuery({
    queryKey: postKeys.story(username, title),
    queryFn: () => getPostsByStory(supabase, username, title),
  });

  const rootFolderId = story?.folders.find((f) => f.parent_id === null)?.id;

  const [selectedFolderId, setSelectedFolderId] = useQueryState("folder_id", {
    history: "push",
    defaultValue: rootFolderId ?? "",
  });

  if (isError) return <>{error.message}</>;

  if (!story || !posts) return null;

  const selectedFolderPosts = posts.filter(
    (post) => post.folder_id === selectedFolderId,
  );

  const folderHierarchyMap = new Map<string, Tables<"folders">[]>();
  story.folders.forEach((f) => {
    const reversedPath = [];
    let parentId: string | null = f.id;
    while (parentId) {
      const parent = story.folders.find((f) => f.id === parentId);
      if (parent) {
        reversedPath.push(parent);
        parentId = parent.parent_id;
      }
    }
    folderHierarchyMap.set(f.id, reversedPath.toReversed());
  });

  const content = (
    <div className="flex h-full flex-col">
      <Breadcrumb>
        <BreadcrumbList className="my-2 justify-center">
          {folderHierarchyMap.get(selectedFolderId)?.map((f, index, array) => {
            if (index === array.length - 1)
              return f.parent_id ? (
                <Popover key={f.id}>
                  <PopoverTrigger asChild>
                    <Button variant="link" className="h-5 px-0">
                      <BreadcrumbPage>{f.name}</BreadcrumbPage>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="flex flex-col items-center justify-center gap-2">
                      {f.description}
                      {session?.user?.id === story.owner_id && (
                        <UpsertFolderDialog story={story} folder={f} />
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <BreadcrumbPage>{f.name}</BreadcrumbPage>
              );
            return (
              <Fragment key={f.id}>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    onClick={() => setSelectedFolderId(f.id)}
                    className="cursor-pointer"
                  >
                    {f.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
      {selectedFolderPosts.length > 0 ? (
        <div className="m-4 grid grid-cols-1 gap-4 pb-4 @lg:grid-cols-2 @2xl:grid-cols-3 @4xl:grid-cols-4">
          <PostCardList story={story} posts={selectedFolderPosts} />
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          No posts in this folder.
        </div>
      )}
    </div>
  );

  if (isWideDesktop)
    return (
      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1 rounded-lg border"
      >
        <ResizablePanel defaultSize={33} minSize={15.5} className="relative">
          <div className="absolute right-0 top-0 z-30 m-1 bg-background">
            <UpsertFolderDialog story={story} />
          </div>
          <div className="absolute bottom-0 left-0 right-0 top-1 overflow-auto overflow-x-hidden">
            <FolderDetailTree
              folders={story.folders}
              selectedFolderId={selectedFolderId}
              handleFolderClick={setSelectedFolderId}
            />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          defaultSize={67}
          minSize={16}
          className="relative @container"
        >
          <div className="absolute bottom-0 left-0 right-0 top-0 overflow-auto">
            {content}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    );

  return (
    <>
      <div className="relative pt-1">
        <div className="absolute right-0 top-0 z-30 m-1">
          <UpsertFolderDialog story={story} />
        </div>
        <div className="pr-2">
          <FolderDetailTree
            folders={story.folders}
            selectedFolderId={selectedFolderId}
            handleFolderClick={setSelectedFolderId}
          />
        </div>
      </div>
      <div className="mt-2 w-full @container">{content}</div>
    </>
  );
}
