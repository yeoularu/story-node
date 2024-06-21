import { Tables } from "./supabase";

export type FolderTree = Tables<"folders"> & { children?: FolderTree[] };
