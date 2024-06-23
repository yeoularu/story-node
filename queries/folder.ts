import { Database } from "@/lib/types/supabase";
import { SupabaseClient } from "@supabase/supabase-js";

export const folderKeys = {
  all: ["folder"] as const,
  ids: () => [...folderKeys.all, "id"] as const,
  id: (id: string) => [...folderKeys.ids(), id] as const,
};

export const getFolder = async (
  supabase: SupabaseClient<Database>,
  id: string,
) =>
  await supabase
    .from("folders")
    .select("*, profiles(*), stories(*)")
    .eq("id", id)
    .single()
    .then(({ data }) => data);
