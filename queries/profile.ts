import { Database } from "@/lib/types/supabase";
import { SupabaseClient } from "@supabase/supabase-js";

export const profileKeys = {
  all: ["profile"] as const,
  ids: () => [...profileKeys.all, "id"] as const,
  id: (id: string) => [...profileKeys.ids(), id] as const,
  usernames: () => [...profileKeys.all, "username"] as const,
  username: (username: string) =>
    [...profileKeys.usernames(), username] as const,
};

export const getProfileById = async (
  supabase: SupabaseClient<Database>,
  userId: string,
) =>
  await supabase
    .from("profiles")
    .select()
    .eq("id", userId)
    .single()
    .then(({ data }) => data);

export const getProfileByUsername = async (
  supabase: SupabaseClient<Database>,
  username: string,
) =>
  await supabase
    .from("profiles")
    .select("*, stories!stories_owner_id_fkey(count), stars(count)")
    .eq("username", username)
    .single()
    .then(({ data }) => data);
