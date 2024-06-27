import { Database } from "@/lib/types/supabase";
import { SupabaseClient } from "@supabase/supabase-js";

export const postKeys = {
  all: ["post"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (filter: string) => [...postKeys.lists(), { filter }] as const,
  drafts: () => [...postKeys.all, "draft"] as const,
  ids: () => [...postKeys.all, "id"] as const,
  id: (id: string) => [...postKeys.ids(), id] as const,
  stories: () => [...postKeys.all, "story"] as const,
  story: (username: string, title: string) =>
    [...postKeys.stories(), username, title] as const,

  folders: () => [...postKeys.all, "folder"] as const,
  folder: (folderId: string) => [...postKeys.folders(), folderId] as const,
  titles: (folderId: string) =>
    [...postKeys.folder(folderId), "title"] as const,
  title: (folderId: string, title: string) =>
    [...postKeys.titles(folderId), title] as const,
  infiniteByFolder: (folderId: string) =>
    [...postKeys.folder(folderId), "infinite"] as const,
};

export const getPostById = async (
  supabase: SupabaseClient<Database>,
  id: string,
) =>
  await supabase
    .from("posts")
    .select(
      `
      *,
      post_links_from: post_links!post_links_from_post_fkey(to_post_id),
      post_links_to: post_links!post_links_to_post_fkey(from_post_id),
      profiles!inner(*), 
      stories!inner(*)
      `,
    )
    .eq("id", id)
    .single()
    .then(({ data }) => data);

export const getPostsByStory = async (
  supabase: SupabaseClient<Database>,
  username: string,
  title: string,
) =>
  await supabase
    .from("posts")
    .select(
      `
      id,
      title,
      folder_id,
      inserted_at,
      owner_id,
      status,
      story_id,
      updated_at,
      post_links_from: post_links!post_links_from_post_fkey(to_post_id),
      post_links_to: post_links!post_links_to_post_fkey(from_post_id),
      profiles!inner(*), 
      stories!inner(*)
      `,
    )
    .eq("status", "published")
    .eq("profiles.username", username)
    .eq("stories.title", title)
    .order("inserted_at", { ascending: false })
    .then(({ data }) => data);

export const getPostsByFolder = async (
  supabase: SupabaseClient<Database>,
  folderId: string,
) =>
  await supabase
    .from("posts")
    .select(
      `id,
      title,
      folder_id,
      inserted_at,
      owner_id,
      status,
      story_id,
      updated_at`,
    )
    .eq("status", "published")
    .eq("folder_id", folderId)
    .order("inserted_at", { ascending: false })
    .then(({ data }) => data);

export const getDrafts = async (
  supabase: SupabaseClient<Database>,
  ownerId: string,
) =>
  await supabase
    .from("posts")
    .select(
      `
      id,
      title,
      folder_id,
      inserted_at,
      owner_id,
      status,
      story_id,
      updated_at,
      post_links_from: post_links!post_links_from_post_fkey(to_post_id),
      post_links_to: post_links!post_links_to_post_fkey(from_post_id),
      profiles!inner(*), 
      stories!inner(*)
      `,
    )
    .eq("status", "draft")
    .eq("owner_id", ownerId)
    .order("inserted_at", { ascending: false })
    .then(({ data }) => data);

export const getPostByTitle = async (
  supabase: SupabaseClient<Database>,
  folderId: string,
  title: string,
) =>
  await supabase
    .from("posts")
    .select(
      `
      *,
      post_links_from: post_links!post_links_from_post_fkey(to_post_id),
      post_links_to: post_links!post_links_to_post_fkey(from_post_id),
      profiles!inner(*), 
      stories!inner(*)
      `,
    )
    .eq("status", "published")
    .eq("folder_id", folderId)
    .eq("title", title)
    .single()
    .then(({ data }) => data);

export const getPreviousPostInFolder = async (
  supabase: SupabaseClient<Database>,
  folderId: string,
  cursorInsertedAt: string,
) =>
  await supabase
    .from("posts")
    .select(
      `
      *,
      post_links_from: post_links!post_links_from_post_fkey(to_post_id),
      post_links_to: post_links!post_links_to_post_fkey(from_post_id),
      profiles!inner(*), 
      stories!inner(*)
      `,
    )
    .eq("status", "published")
    .eq("folder_id", folderId)
    .lt("inserted_at", cursorInsertedAt)
    .order("inserted_at", { ascending: false })
    .limit(1)
    .single()
    .then(({ data }) => data);

export const getNextPostInFolder = async (
  supabase: SupabaseClient<Database>,
  folderId: string,
  cursorInsertedAt: string,
) =>
  await supabase
    .from("posts")
    .select(
      `
      *,
      post_links_from: post_links!post_links_from_post_fkey(to_post_id),
      post_links_to: post_links!post_links_to_post_fkey(from_post_id),
      profiles!inner(*), 
      stories!inner(*)
      `,
    )
    .eq("status", "published")
    .eq("folder_id", folderId)
    .gt("inserted_at", cursorInsertedAt)
    .order("inserted_at", { ascending: true })
    .limit(1)
    .single()
    .then(({ data }) => data);
