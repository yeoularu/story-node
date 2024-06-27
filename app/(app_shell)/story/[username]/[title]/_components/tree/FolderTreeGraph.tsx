"use client";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Tables } from "@/lib/types/supabase";
import { getDrafts, getPostsByStory, postKeys } from "@/queries/post";
import { getStory, storyKeys } from "@/queries/story";
import { useQuery } from "@tanstack/react-query";
import * as d3 from "d3";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { File, FilePen, Folder, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useWindowSize } from "usehooks-ts";

dayjs.extend(localizedFormat);

interface TreeNode extends d3.SimulationNodeDatum {
  id: string;
  type: "folder" | "post";
  name: string;
  children?: TreeNode[];
}

export default function FolderTreeGraph() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const supabase = createClient();

  const params = useParams<{ username: string; title: string }>();
  const username = decodeURIComponent(params.username);
  const title = decodeURIComponent(params.title);

  const { width = 0, height = 0 } = useWindowSize();

  const { data: story } = useQuery({
    queryKey: storyKeys.title(username, title),
    queryFn: () => getStory(supabase, username, title),
  });

  const { data: posts } = useQuery({
    queryKey: postKeys.story(username, title),
    queryFn: () => getPostsByStory(supabase, username, title),
  });

  const { data: drafts, isPending } = useQuery({
    queryKey: postKeys.drafts(),
    queryFn: () => getDrafts(supabase, story?.owner_id!),
  });

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  function transformData(
    folders: Tables<"folders">[],
    posts: Tables<"posts">[],
  ) {
    const folderMap = new Map<string, Tables<"folders">>();
    folders.forEach((folder) => folderMap.set(folder.id, folder));

    const buildTree = (folderId: string) => {
      const folder = folderMap.get(folderId)!;
      const node: TreeNode = {
        id: folder.id,
        type: "folder",
        name: folder.name,
      };

      const children = folders.filter((f) => f.parent_id === folderId);
      if (children.length > 0) {
        node.children = children.map((child) => buildTree(child.id));
      }

      const folderPosts = posts.filter((post) => post.folder_id === folderId);
      if (folderPosts.length > 0) {
        if (!node.children) node.children = [];
        node.children.push(
          ...folderPosts.map((post) => ({
            id: post.id,
            type: "post" as const,
            name: post.title ?? `${dayjs(post.inserted_at).format("ll")}`,
          })),
        );
      }

      return node;
    };

    const rootFolder = folders.find((folder) => folder.parent_id === null);
    if (!rootFolder) throw new Error("Root folder not found");

    return buildTree(rootFolder.id);
  }

  useEffect(() => {
    if (!story || !posts) return;
    if (!drafts) return;

    const data = drafts
      ? transformData(story.folders, [...posts, ...drafts])
      : transformData(story.folders, posts);

    const root = d3.hierarchy(data);
    const links = root.links();
    const nodes = root.descendants();

    const svgWidth = width > 1400 ? 1400 : width;
    const svgHeight = height - 250;

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink<
            d3.HierarchyNode<TreeNode>,
            d3.HierarchyLink<TreeNode>
          >(links)
          .id((d) => d.id!),
      )
      .force("charge", d3.forceManyBody().strength(-300))

      .force("x", d3.forceX())
      .force("y", d3.forceY());

    const svg = d3
      .select(svgRef.current)
      .attr("width", svgWidth)
      .attr("height", svgHeight)
      .attr("viewBox", [-svgWidth / 2, -svgHeight / 2, svgWidth, svgHeight])
      .attr("style", "max-width: 100%; height: auto;");

    const g = svg.append("g");

    const link = g
      .append("g")
      .attr("class", "stroke-muted-foreground")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line");

    const nodeGroup = g.append("g").selectAll("g").data(nodes).join("g");

    const node = nodeGroup
      .append("circle")
      .attr("stroke-width", (d) => (d.data.type === "folder" ? 2 : 0))
      .attr("r", (d) => (d.data.type === "folder" ? 8 : 7))
      .attr("class", (d) =>
        d.data.type === "folder"
          ? "fill-background stroke-foreground"
          : "fill-foreground stroke-none",
      )
      .attr("cursor", "pointer");

    nodeGroup
      .append("text")
      .attr("dy", 20)
      .attr("text-anchor", "middle")
      .text((d) => d.data.name)
      .attr("font-size", "11px")
      .attr("fill", "currentColor")
      .style("pointer-events", "none");

    node.append("title").text((d) => d.data.name);

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x!)
        .attr("y1", (d) => d.source.y!)
        .attr("x2", (d) => d.target.x!)
        .attr("y2", (d) => d.target.y!);

      nodeGroup.attr("transform", (d) => `translate(${d.x!},${d.y!})`);
    });

    function drag(
      simulation: d3.Simulation<d3.HierarchyNode<TreeNode>, undefined>,
    ) {
      function dragstarted(
        event: d3.D3DragEvent<SVGGElement, TreeNode, TreeNode>,
      ) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event: d3.D3DragEvent<SVGGElement, TreeNode, TreeNode>) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(
        event: d3.D3DragEvent<SVGGElement, TreeNode, TreeNode>,
      ) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    // @ts-ignore
    nodeGroup.call(drag(simulation)).on("click", (_, d) => {
      setSelectedNodeId(d.data.id);
    });

    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 4])
      .on("zoom", ({ transform }) => {
        g.attr("transform", transform);
      });
    // @ts-ignore
    svg.call(zoom);

    return () => {
      svg.selectAll("*").remove();
      simulation.stop();
    };

    // Exclude heights from dependency array due to frequent height changes on mobile browsers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, story, width, drafts]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const node = svg.selectAll("g").select("circle");
    const link = svg.selectAll("line");

    node.attr("class", (d: any) => {
      let classname: string;
      if (d.data.id === selectedNodeId) {
        classname =
          d.data.type === "folder"
            ? "fill-primary stroke-foreground/80"
            : "fill-primary stroke-background";
      } else {
        classname =
          d.data.type === "folder"
            ? "fill-background stroke-foreground"
            : "fill-foreground stroke-background";
      }
      return classname;
    });

    link.attr("class", (link: any) => {
      return link.source.data.id === selectedNodeId ||
        link.target.data.id === selectedNodeId
        ? "stroke-primary"
        : "stroke-muted-foreground";
    });
  }, [selectedNodeId]);

  if (isPending) return <Loader2 className="mx-auto h-8 w-8 animate-spin" />;
  if (!story || !posts) return null;

  const selectedFolder = story.folders.find(
    (folder) => folder.id === selectedNodeId,
  );
  let selectedPost: Tables<"posts"> | undefined;
  if (!selectedFolder) {
    selectedPost =
      posts.find((post) => post.id === selectedNodeId) ??
      drafts?.find((post) => post.id === selectedNodeId);
  }
  const getIcon = () => {
    if (selectedFolder) return <Folder className="h-4 w-4" />;
    if (selectedPost?.status === "published")
      return <File className="h-4 w-4" />;
    return <FilePen className="h-4 w-4" />;
  };

  const getTitle = () => {
    if (selectedFolder) return selectedFolder.name;
    if (selectedPost?.status === "published") return selectedPost.title;
    return `Untitled draft (Created at ${dayjs(selectedPost?.inserted_at).format("lll")})`;
  };

  const getButtonText = () => {
    if (selectedFolder) return "Go to folder";
    if (selectedPost?.status === "published") return "Read post";
    return "Edit draft";
  };

  const getLink = () => {
    if (selectedFolder) {
      return `${window.location.pathname}?tab=folders&folder_id=${selectedFolder.id}`;
    }
    if (selectedPost?.status === "published") {
      return `/post/${selectedPost.folder_id}?title=${selectedPost.title}`;
    }
    return `/compose/post/${selectedNodeId}`;
  };
  return (
    <div className="relative">
      {selectedNodeId && (
        <Alert className="relative z-30 ml-auto w-fit min-w-96 max-w-full pr-16">
          <Button
            className="absolute right-2 top-2 h-8 w-8"
            variant="ghost"
            size="icon"
            onClick={() => setSelectedNodeId(null)}
          >
            <X className="h-4 w-4" />
          </Button>

          {getIcon()}
          <AlertTitle className="mb-4 overflow-hidden">{getTitle()}</AlertTitle>

          <Button variant="outline" className="w-full" size="sm" asChild>
            <Link href={getLink()}>{getButtonText()}</Link>
          </Button>
        </Alert>
      )}

      <svg ref={svgRef} className="absolute bottom-0 left-0 right-0 top-10" />
    </div>
  );
}
