"use client";

import { EditProfileDialog } from "@/app/(app_shell)/_components/user/EditProfileDialog";
import ToggleFollowBtn from "@/app/(app_shell)/_components/user/ToggleFollowBtn";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { getProfileByUsername, profileKeys } from "@/queries/profile";
import { User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import FollowingDialog from "./FollowingDialog";

export default function Profile({
  currentUser,
}: Readonly<{ currentUser?: User }>) {
  const params = useParams<{ username: string }>();
  const username = decodeURIComponent(params.username);
  const supabase = createClient();

  const {
    data: profile,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: profileKeys.username(username),
    queryFn: () => getProfileByUsername(supabase, username),
  });

  const isCurrentUserProfile = currentUser && currentUser.id === profile?.id;

  if (isPending)
    return (
      <Card>
        <CardHeader>
          <div className="mb-2 flex items-end justify-between">
            <Skeleton className="h-24 w-24 rounded-full" />

            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
          <Skeleton className="h-8 w-48 rounded-md" />
          <Skeleton className="h-6 w-36 rounded-md" />
          <Skeleton className="h-12 w-48 rounded-md" />
        </CardHeader>
      </Card>
    );
  if (isError) return <div>{error.message}</div>;
  if (!profile) return <div>Profile not found</div>;

  const { id, name, avatar_url, bio } = profile;

  return (
    <Card>
      <CardHeader>
        <div className="mb-2 flex items-end justify-between">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatar_url ?? undefined} />
            <AvatarFallback>{name.toUpperCase().at(0)}</AvatarFallback>
          </Avatar>
          {isCurrentUserProfile ? (
            <EditProfileDialog profile={profile} />
          ) : (
            <ToggleFollowBtn fromUserId={currentUser?.id} toUserId={id} />
          )}
        </div>
        <CardTitle>{name}</CardTitle>
        <CardDescription>@{username}</CardDescription>
        {bio && (
          <CardDescription className="whitespace-pre-wrap break-words text-foreground">
            {bio}
          </CardDescription>
        )}
      </CardHeader>
      {isCurrentUserProfile && <FollowingDialog currentUserId={id} />}
    </Card>
  );
}
