import { createClient } from "@/lib/supabase/server";
import { getRecentStoryList, storyKeys } from "@/queries/story";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import HomeGridFeed from "./_components/HomeGridFeed";
import HomeTab from "./_components/HomeTab";

export default async function HomePage() {
  const queryClient = new QueryClient();
  const supabase = createClient();

  await queryClient.prefetchQuery({
    queryKey: storyKeys.list("recent"),
    queryFn: () => getRecentStoryList(supabase),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeTab />
      <HomeGridFeed />
    </HydrationBoundary>
  );
}
