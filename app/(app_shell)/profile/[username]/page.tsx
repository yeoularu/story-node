import { createClient } from "@/lib/supabase/server";
import { followKeys, getFolloweeList } from "@/queries/follow";
import { getProfileByUsername, profileKeys } from "@/queries/profile";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import Profile from "./_components/Profile";
import ProfileTab from "./_components/ProfileTab";

type Props = {
  params: { username: string };
};

export async function generateMetadata({ params }: Props) {
  const username = params.username;

  return {
    title: `@${username} | story-node`,
    openGraph: {
      title: `@${username} | story-node`,
    },
  };
}

export default async function ProfilePage({
  params,
}: Readonly<{ params: { username: string } }>) {
  const queryClient = new QueryClient();
  const supabase = createClient();
  const username = decodeURIComponent(params.username);

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  let followPromise;
  if (currentUser) {
    followPromise = queryClient.prefetchQuery({
      queryKey: followKeys.fromUserId(currentUser.id),
      queryFn: async () => getFolloweeList(supabase, currentUser.id),
    });
  }

  const profilePromise = queryClient.prefetchQuery({
    queryKey: profileKeys.username(username),
    queryFn: () => getProfileByUsername(supabase, username),
  });

  await Promise.all([profilePromise, followPromise]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="container flex max-w-screen-xl flex-col gap-2 p-2">
        <Profile currentUser={currentUser ?? undefined} />
        <ProfileTab />
      </div>
    </HydrationBoundary>
  );
}
