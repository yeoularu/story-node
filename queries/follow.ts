import { Database } from "@/lib/types/supabase";
import { SupabaseClient } from "@supabase/supabase-js";

export const followKeys = {
  all: ["follow"] as const,
  fromUserIds: () => [...followKeys.all, "fromUserId"] as const,
  fromUserId: (fromUserId: string) =>
    [...followKeys.fromUserIds(), fromUserId] as const,
  toUserIds: () => [...followKeys.all, "toUserId"] as const,
  toUserId: (toUserId: string) =>
    [...followKeys.toUserIds(), toUserId] as const,
};

export const getFolloweeList = async (
  supabase: SupabaseClient<Database>,
  fromUserId: string,
) =>
  await supabase
    .from("follows")
    .select("followee_id, profiles!followee_id_fkey(*)")
    .eq("follower_id", fromUserId)
    .then(({ data }) => data);
