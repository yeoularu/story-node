import { Database } from "@/lib/types/supabase";
import { SupabaseClient } from "@supabase/supabase-js";

export const starKeys = {
  all: ["star"] as const,
  userIds: () => [...starKeys.all, "userId"] as const,
  userId: (userId: string) => [...starKeys.userIds(), userId] as const,
  storyIds: () => [...starKeys.all, "storyId"] as const,
  storyId: (storyId: string) => [...starKeys.storyIds(), storyId] as const,
};

export const getStarsByUserId = async (
  supabase: SupabaseClient<Database>,
  userId: string,
) =>
  await supabase
    .from("stars")
    .select("*, stories(*, profiles!stories_owner_id_fkey(*), stars(count))")
    .eq("user_id", userId)
    .then(({ data }) => data);
