import { createClient } from "@/lib/supabase/server";
import { getPostById, postKeys } from "@/queries/post";
import { getProfileById, profileKeys } from "@/queries/profile";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { redirect } from "next/navigation";
import UpdatePost from "./_components/UpdatePost";

export default async function ComposePostPage({
  params,
}: Readonly<{
  params: { id: string };
}>) {
  const supabase = createClient();
  const queryClient = new QueryClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/compose/post/" + params.id);
  }

  const promises = [
    await queryClient.prefetchQuery({
      queryKey: postKeys.id(params.id),
      queryFn: () => getPostById(supabase, params.id),
    }),
    await queryClient.prefetchQuery({
      queryKey: profileKeys.id(user.id),
      queryFn: () => getProfileById(supabase, user.id),
    }),
  ];

  await Promise.all(promises);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="container flex max-w-screen-xl flex-col">
        <UpdatePost currentUser={user} postId={params.id} />
      </div>
    </HydrationBoundary>
  );
}
