"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { followKeys, getFolloweeList } from "@/queries/follow";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ToggleFollowBtn({
  fromUserId,
  toUserId,
}: Readonly<{ fromUserId?: string; toUserId: string }>) {
  const pathname = usePathname();

  if (!fromUserId) {
    return (
      <Button asChild>
        <Link href={"/login?next=" + pathname}>Follow</Link>
      </Button>
    );
  }

  return <FollowBtn fromUserId={fromUserId} toUserId={toUserId} />;
}

const FollowBtn = ({
  fromUserId,
  toUserId,
}: {
  fromUserId: string;
  toUserId: string;
}) => {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: followeeList, isPending } = useQuery({
    queryKey: followKeys.fromUserId(fromUserId),
    queryFn: async () => {
      return getFolloweeList(supabase, fromUserId);
    },
  });

  const isFollowing = followeeList?.some(
    ({ followee_id }) => followee_id === toUserId,
  );

  const { mutate: follow } = useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        await supabase
          .from("follows")
          .delete()
          .eq("followee_id", toUserId)
          .eq("follower_id", fromUserId);
      } else {
        await supabase
          .from("follows")
          .insert([{ followee_id: toUserId, follower_id: fromUserId }]);
      }
    },
    onMutate: async () => {
      const previousData = queryClient.getQueryData(
        followKeys.fromUserId(fromUserId),
      );

      queryClient.setQueryData(
        followKeys.fromUserId(fromUserId),
        (oldData: { followee_id: string }[]) => {
          if (isFollowing) {
            return oldData.filter(
              ({ followee_id }) => followee_id !== toUserId,
            );
          } else {
            return [...oldData, { followee_id: toUserId }];
          }
        },
      );
      return { previousData };
    },
    onError: (error, _, context) => {
      console.error(error);
      queryClient.setQueryData(
        followKeys.fromUserId(fromUserId),
        context?.previousData,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: followKeys.fromUserId(fromUserId),
      });
    },
  });

  if (isPending || isFollowing === undefined) {
    return (
      <Button variant="secondary" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Follow
      </Button>
    );
  }

  const handleFollow = () => {
    follow();
  };

  return isFollowing ? (
    <Button variant="secondary" onClick={handleFollow}>
      Unfollow
    </Button>
  ) : (
    <Button onClick={handleFollow}>Follow</Button>
  );
};
