import { createClient } from "@/lib/supabase/server";
import { getStoriesByOwner, storyKeys } from "@/queries/story";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { redirect } from "next/navigation";
import PageTitle from "../../_components/PageTitle";
import CreatePostDraft from "../_components/CreatePostDraft";

export const metadata = {
  title: "Create post draft | story-node",
};

export default async function ComposePostPage() {
  const supabase = createClient();
  const queryClient = new QueryClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/compose/post");
  }

  await queryClient.prefetchQuery({
    queryKey: storyKeys.listByOwner(user.id),
    queryFn: () => getStoriesByOwner(supabase, user.id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="container flex max-w-screen-xl flex-col">
        <PageTitle>Create post draft</PageTitle>
        <CreatePostDraft currentUser={user} />
      </div>
    </HydrationBoundary>
  );
}
