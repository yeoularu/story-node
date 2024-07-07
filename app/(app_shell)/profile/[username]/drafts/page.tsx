import PageTitle from "@/app/(app_shell)/_components/PageTitle";
import { createClient } from "@/lib/supabase/server";
import { getDrafts, postKeys } from "@/queries/post";
import { getStoriesByOwner, storyKeys } from "@/queries/story";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { redirect } from "next/navigation";
import Drafts from "./_components/Drafts";

export const metadata = {
  title: "Drafts | story-node",
};

export default async function ProfileDraftsPage({
  params,
}: Readonly<{ params: { username: string } }>) {
  const queryClient = new QueryClient();

  const supabase = createClient();
  const username = decodeURIComponent(params.username);
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    redirect("/login?next=/profile/" + username + "/drafts");
  }

  const promises = [
    await queryClient.prefetchQuery({
      queryKey: postKeys.drafts(),
      queryFn: () => getDrafts(supabase, currentUser.id),
    }),
    await queryClient.prefetchQuery({
      queryKey: storyKeys.listByOwner(currentUser.id),
      queryFn: () => getStoriesByOwner(supabase, currentUser.id),
    }),
  ];

  await Promise.all(promises);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="container my-2 flex max-w-screen-2xl flex-col gap-4">
        <PageTitle>Drafts</PageTitle>
        <Drafts currentUser={currentUser} />
      </div>
    </HydrationBoundary>
  );
}
