"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Files, FoldersIcon, TreePine, Waypoints } from "lucide-react";
import { useQueryState } from "nuqs";
import { useMediaQuery } from "usehooks-ts";
import Folders from "./folder/Folders";
import Posts from "./post/Posts";
import FolderTreeGraph from "./tree/FolderTreeGraph";

export default function StoryTab() {
  const [tab, setTab] = useQueryState("tab", { history: "push" });
  const isDesktop = useMediaQuery("(min-width: 768px)", {
    initializeWithValue: false,
  });
  return (
    <Tabs
      value={tab ?? "posts"}
      onValueChange={setTab}
      className="flex w-full flex-1 flex-col"
    >
      <div className={`flex ${isDesktop ? "justify-start" : "justify-center"}`}>
        <TabsList>
          <TabsTrigger value="posts">
            <Files className="mr-1 h-4 w-4 text-muted-foreground" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="folders">
            <FoldersIcon className="mr-1 h-4 w-4 text-muted-foreground" />
            Folders
          </TabsTrigger>
          <TabsTrigger value="tree">
            <TreePine className="mr-1 h-4 w-4 text-muted-foreground" />
            Tree
          </TabsTrigger>
          <TabsTrigger value="graph">
            <Waypoints className="mr-1 h-4 w-4 text-muted-foreground" />
            Graph
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="posts">
        <Posts />
      </TabsContent>
      <TabsContent
        value="folders"
        className={`flex flex-1 flex-col ${tab !== "folders" && "hidden"}`}
      >
        <Folders />
      </TabsContent>
      <TabsContent
        value="tree"
        className={`flex flex-1 flex-col ${tab !== "tree" && "hidden"}`}
      >
        <FolderTreeGraph />
      </TabsContent>
      <TabsContent value="graph">graph</TabsContent>
    </Tabs>
  );
}
