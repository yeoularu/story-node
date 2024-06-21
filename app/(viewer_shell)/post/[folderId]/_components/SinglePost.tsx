"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
    onChange: (isIntersecting) => {
      if (isIntersecting) setTitle(post.title);
    },
  });

  return (
    <div id={post.id} ref={ref} className="mb-24">
      <div className="sticky inset-x-0 top-1 z-40 mx-auto flex w-[calc(100%-3rem)] items-center justify-center text-center text-sm opacity-90">
        <Popover>
          <PopoverTrigger asChild>
            <div className="mx-auto w-fit max-w-full rounded-md p-1.5 transition-colors hover:cursor-pointer hover:bg-transparent/5 hover:text-inherit">
              <p
                className={`line-clamp-1 whitespace-pre-wrap break-words text-center`}
              >
                {post.title}
              </p>
            </div>
          </PopoverTrigger>
          <PopoverContent>
            <p className="whitespace-pre-wrap break-words text-center">
              {post.title}
            </p>
          </PopoverContent>
        </Popover>
      </div>
      <article className="whitespace-pre-wrap break-words bg-inherit px-0 sm:px-6">
        {post.content}
      </article>
    </div>
  );
}
