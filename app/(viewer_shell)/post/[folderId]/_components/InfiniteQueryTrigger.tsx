"use client";

import { useIntersectionObserver } from "usehooks-ts";

export default function InfiniteQueryTrigger({
  fetchPage,
}: Readonly<{ fetchPage: () => void }>) {
  const { ref } = useIntersectionObserver({
    threshold: 0.2,
    onChange: fetchPage,
  });

  return <div ref={ref} className="h-24 w-full" />;
}
