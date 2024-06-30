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
import { File, FilePen, LoaderCircle, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useWindowSize } from "usehooks-ts";

dayjs.extend(localizedFormat);

type FDGNode = d3.SimulationNodeDatum & Omit<Tables<"posts">, "content">;
type FDGLink = d3.SimulationLinkDatum<FDGNode>;

export default function PostsGraph() {
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

  useEffect(() => {
    if (!story || !posts) return;
    if (!drafts) return;
    const data = [...posts, ...drafts];
    const dataSet = new Set(data.map((d) => d.id));
    const links = story.post_links
      .filter((l) => dataSet.has(l.from_post_id) && dataSet.has(l.to_post_id))
      .map((d) => ({
        source: d.from_post_id,
        target: d.to_post_id,
      }));
    const nodes = data as FDGNode[];

    const svgWidth = width > 1400 ? 1400 : width;
    const svgHeight = height - 275;

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3.forceLink<FDGNode, FDGLink>(links).id((d) => {
          return d.id;
        }),
      )
      .force("charge", d3.forceManyBody().strength(-500))
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
      .attr("stroke-width", 0)
      .attr("r", 7)
      .attr("class", "fill-foreground stroke-none")
      .attr("cursor", "pointer");

    const nodeText = nodeGroup
      .append("text")
      .attr("dy", 20)
      .attr("text-anchor", "middle")
      .text((d) => d.title ?? ``)
      .attr("font-size", "11px")
      .attr("fill", "currentColor")
      .attr("opacity", 0.8)
      .style("pointer-events", "none");

    node.append("title").text((d) => d.title);

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as unknown as FDGNode).x!)
        .attr("y1", (d) => (d.source as unknown as FDGNode).y!)
        .attr("x2", (d) => (d.target as unknown as FDGNode).x!)
        .attr("y2", (d) => (d.target as unknown as FDGNode).y!);

      nodeGroup.attr("transform", (d) => `translate(${d.x!},${d.y!})`);
    });

    function drag(
      simulation: d3.Simulation<d3.HierarchyNode<FDGNode>, undefined>,
    ) {
      function dragstarted(
        event: d3.D3DragEvent<SVGGElement, FDGNode, FDGNode>,
      ) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event: d3.D3DragEvent<SVGGElement, FDGNode, FDGNode>) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event: d3.D3DragEvent<SVGGElement, FDGNode, FDGNode>) {
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
      setSelectedNodeId(d.id);
    });

    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 4])
      .on("zoom", ({ transform }) => {
        g.attr("transform", transform);
        nodeText
          .attr("opacity", Math.min(0.8, transform.k - 0.5))
          .attr("transform", `scale(${(1 + transform.k) / (2 * transform.k)})`)
          .attr("dy", 20 * Math.pow(transform.k, 0.25));
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
      if (d.id === selectedNodeId) {
        classname = "fill-primary stroke-background";
      } else {
        classname = "fill-foreground stroke-background";
      }
      return classname;
    });

    link.attr("class", (link: any) => {
      return link.source.id === selectedNodeId ||
        link.target.id === selectedNodeId
        ? "stroke-primary"
        : "stroke-muted-foreground";
    });
  }, [selectedNodeId]);

  if (isPending)
    return (
      <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-primary" />
    );
  if (!story || !posts) return null;

  const getIcon = () => {
    if (selectedPost?.status === "published")
      return <File className="h-4 w-4" />;
    return <FilePen className="h-4 w-4" />;
  };
  const selectedPost =
    posts.find((post) => post.id === selectedNodeId) ??
    drafts?.find((post) => post.id === selectedNodeId);
  const getTitle = () => {
    if (selectedPost?.status === "published") return selectedPost.title;
    return `Untitled draft (Created at ${dayjs(selectedPost?.inserted_at).format("lll")})`;
  };

  const getButtonText = () => {
    if (selectedPost?.status === "published") return "Read post";
    return "Edit draft";
  };

  const getLink = () => {
    if (selectedPost?.status === "published" && selectedPost.title) {
      return `/post/${selectedPost.folder_id}?title=${encodeURIComponent(selectedPost.title)}`;
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
