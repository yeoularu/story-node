import PageTitle from "@/app/(app_shell)/_components/PageTitle";
import { createClient } from "@/lib/supabase/server";
import { getProfileByUsername, profileKeys } from "@/queries/profile";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { redirect } from "next/navigation";
import ProfileSettingsTab from "./_components/ProfileSettingsTab";

export const metadata = {
  title: "Settings | story-node",
};

export default async function SettingsPage({
  params,
}: Readonly<{ params: { username: string } }>) {
  const queryClient = new QueryClient();
  const supabase = createClient();
  const username = decodeURIComponent(params.username);

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    redirect("/login?next=/profile/" + username + "/settings");
  }

  const profilePromise = queryClient.prefetchQuery({
    queryKey: profileKeys.username(username),
    queryFn: () => getProfileByUsername(supabase, username),
  });
  await Promise.all([profilePromise]);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="container flex max-w-screen-xl flex-col">
        <PageTitle>Settings</PageTitle>
        <ProfileSettingsTab currentUser={currentUser} />
      </div>
    </HydrationBoundary>
  );
}
