"use client";

import { Button } from "@/components/ui/button";
import { useIntersectionObserver } from "usehooks-ts";

export default function InfiniteQueryTrigger({
  fetchPage,
}: Readonly<{ fetchPage: () => void }>) {
  const { ref } = useIntersectionObserver({
    onChange: fetchPage,
  });

  return (
    <div ref={ref} className="flex h-24 flex-col items-end justify-end">
      <Button onClick={fetchPage} className="mb-4">
        Load next post
      </Button>
    </div>
  );
}
