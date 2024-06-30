import { Database } from "@/lib/types/supabase";
import { SupabaseClient } from "@supabase/supabase-js";

export const storyKeys = {
  all: ["story"] as const,
  lists: () => [...storyKeys.all, "list"] as const,
  list: (filter: string) => [...storyKeys.lists(), filter] as const,
  listByOwner: (owner_id: string) =>
    [...storyKeys.list("owner"), owner_id] as const,
  ids: () => [...storyKeys.all, "id"] as const,
  id: (id: string) => [...storyKeys.ids(), id] as const,
  usernames: () => [...storyKeys.all, "username"] as const,
  username: (username: string) => [...storyKeys.usernames(), username] as const,
  title: (username: string, title: string) =>
    [...storyKeys.username(username), title] as const,
};

export const getStory = async (
  supabase: SupabaseClient<Database>,
  username: string,
  title: string,
) =>
  await supabase
    .from("stories")
    .select(
      "*, profiles!stories_owner_id_fkey(*), stars(count), folders(*), post_links(*)",
    )
    .eq("profiles.username", username)
    .eq("title", title)
    .single()
    .then(({ data }) => data);

export const getStoryByIdForOwner = async (
  supabase: SupabaseClient<Database>,
  id: string,
) =>
  await supabase
    .from("stories")
    .select(
      "*, profiles!stories_owner_id_fkey(*), stars(count), folders(*), posts(id, folder_id, title, inserted_at), post_links(*)",
    )
    .eq("id", id)
    .single()
    .then(({ data }) => data);

export const getRecentStoryList = async (supabase: SupabaseClient<Database>) =>
  await supabase
    .from("stories")
    .select("*, profiles!stories_owner_id_fkey(*), stars(count)")
    .order("inserted_at", { ascending: false })
    .then(({ data }) => data);

export const getStoriesByOwner = async (
  supabase: SupabaseClient<Database>,
  owner_id: string,
) =>
  await supabase
    .from("stories")
    .select("*, profiles!stories_owner_id_fkey(*), stars(count), folders(*)")
    .eq("owner_id", owner_id)
    .then(({ data }) => data);
