import { createClient } from "@/lib/supabase/server";
import { getPostsByStory, postKeys } from "@/queries/post";
import { getStarsByUserId, starKeys } from "@/queries/star";
import { getStory, storyKeys } from "@/queries/story";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import StoryHeader from "./_components/StoryHeader";
import StoryTab from "./_components/StoryTab";

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ searchParams }: Props) {
  const username = searchParams.username;
  const title = searchParams.title;

  return {
    title: `${title} by @${username} | story-node`,
    openGraph: {
      title: `${title} by @${username} | story-node`,
    },
  };
}

export default async function StoryPage({
  params,
}: Readonly<{
  params: { username: string; title: string };
}>) {
  const queryClient = new QueryClient();
  const supabase = createClient();

  const username = decodeURIComponent(params.username);
  const title = decodeURIComponent(params.title);

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const promises = [
    await queryClient.prefetchQuery({
      queryKey: storyKeys.title(username, title),
      queryFn: () => getStory(supabase, username, title),
    }),
    await queryClient.prefetchQuery({
      queryKey: postKeys.story(username, title),
      queryFn: () => getPostsByStory(supabase, username, title),
    }),
  ];

  if (currentUser) {
    promises.push(
      await queryClient.prefetchQuery({
        queryKey: starKeys.userId(currentUser.id),
        queryFn: () => getStarsByUserId(supabase, currentUser.id),
      }),
    );
  }

  await Promise.all(promises);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="container flex min-h-[calc(100dvh-4rem)] max-w-screen-2xl flex-col gap-2">
        <StoryHeader currentUser={currentUser ?? undefined} />
        <StoryTab />
      </div>
    </HydrationBoundary>
  );
}
