"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { genresMap } from "@/lib/data/genresData";
import { Tables } from "@/lib/types/supabase";
import { Star } from "lucide-react";

export default function StoryCard({
  story,
}: Readonly<{
  story: Tables<"stories"> & {
    profiles: Tables<"profiles"> | null;
    stars: { count: number }[];
  };
}>) {
  return (
    <div className="break-inside-avoid border-b border-border/40 bg-transparent py-4 shadow-none">
      <h1 className="scroll-m-20 whitespace-pre-wrap break-words text-2xl font-semibold tracking-tight">
        {story.title}
      </h1>

      <p className="mb-4 mt-2 whitespace-pre-wrap break-words text-sm text-muted-foreground">
        {story.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="text-xl tracking-widest">
          {story.genres?.map((genre) => genresMap.get(genre))}
        </div>
        <div className="flex items-center">
          <Avatar className="mr-1 h-5 w-5">
            <AvatarImage src={story.profiles?.avatar_url ?? undefined} />
            <AvatarFallback>
              {story.profiles?.name.toUpperCase().at(0)}
            </AvatarFallback>
          </Avatar>

          <span className="mr-1 text-sm font-light text-muted-foreground">
            by
          </span>
          <span className="mr-2 text-sm font-normal text-secondary-foreground">
            {story.profiles?.name}
          </span>

          <div className="flex items-center text-muted-foreground">
            <Star className="mr-0.5 h-4 w-4 text-muted-foreground" />
            <span className="min-w-2 text-center text-sm">
              {story.stars[0].count}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
