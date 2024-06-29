import { CommandListItem } from "@/components/ui/command";
import type { FolderTree } from "@/lib/types/folderTree";
import { Fragment } from "react";

export default function FolderTree({
  folders,
  deps,
  setValue,
  closePopover,
  path = "",
  excludeFolderId,
}: Readonly<{
  folders: FolderTree[];
  deps: number;
  setValue: (value: string) => void;
  closePopover: () => void;
  path?: string;
  excludeFolderId?: string;
}>) {
  if (!folders.length) return null;

  return (
    <>
      {folders.map((folder) => {
        const currentPath = path ? `${path}/${folder.name}` : folder.name;
        const isExcluded = !!excludeFolderId && folder.id === excludeFolderId;
        return (
          <Fragment key={folder.id}>
            <CommandListItem
              value={path + "/" + folder.name}
              key={folder.id}
              onSelect={() => {
                setValue(folder.id);
                closePopover();
              }}
              disabled={isExcluded}
              className={isExcluded ? "pointer-events-none opacity-50" : ""}
            >
              <span className="max-w-full whitespace-pre-wrap break-words">
                {path !== "" && (
                  <span className="text-muted-foreground">{path}/</span>
                )}
                <span className="font-medium">{folder.name}</span>
              </span>
            </CommandListItem>
            {folder.children && (
              <FolderTree
                folders={folder.children}
                deps={deps + 1}
                setValue={setValue}
                closePopover={closePopover}
                path={currentPath}
                excludeFolderId={excludeFolderId}
              />
            )}
          </Fragment>
        );
      })}
    </>
  );
}
