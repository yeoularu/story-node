import type { FolderTree } from "@/lib/types/folderTree";

export const buildFolderTree = (
  folders: FolderTree[],
  parentId: FolderTree["parent_id"],
): FolderTree[] => {
  return folders
    .filter((folder) => folder.parent_id === parentId)
    .map((folder) => ({
      ...folder,
      children: buildFolderTree(folders, folder.id),
    }));
};
