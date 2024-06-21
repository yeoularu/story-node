import { Button } from "@/components/ui/button";
import { Tables } from "@/lib/types/supabase";

const FolderDetailTree = ({
  folders,
  selectedFolderId,
  handleFolderClick,
  parentId = null,
}: Readonly<{
  folders: Tables<"folders">[];
  selectedFolderId: string | null;
  handleFolderClick: (folderId: string) => void;
  parentId?: string | null;
}>) => {
  const folderItems = folders.filter((folder) => folder.parent_id === parentId);

  if (folderItems.length === 0) {
    return null;
  }

  return (
    <ul className="list-none pl-0">
      {folderItems.map((folder) => {
        const hasChildren = folders.some((f) => f.parent_id === folder.id);
        return (
          <li key={folder.id}>
            {hasChildren ? (
              <details
                open
                className="relative ml-4 [&>summary>svg]:open:rotate-0"
              >
                <summary className="my-0.5 mr-4 flex items-center">
                  <svg
                    className="shrink-0 -rotate-90 transform cursor-pointer transition-all duration-300"
                    fill="none"
                    height="20"
                    width="20"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFolderClick(folder.id)}
                    className={`h-fit min-h-9 w-fit max-w-full ${selectedFolderId === folder.id ? "bg-accent/85 text-accent-foreground" : ""}`}
                  >
                    <span className="w-full whitespace-pre-wrap break-words">
                      {folder.name}
                    </span>
                  </Button>
                </summary>
                <div className="relative ml-1 before:absolute before:bottom-1 before:left-0 before:top-0 before:w-px before:bg-muted-foreground">
                  <FolderDetailTree
                    folders={folders}
                    selectedFolderId={selectedFolderId}
                    handleFolderClick={handleFolderClick}
                    parentId={folder.id}
                  />
                </div>
              </details>
            ) : (
              <div className="my-0.5 ml-8">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFolderClick(folder.id)}
                  className={`h-fit min-h-9 w-fit max-w-full ${selectedFolderId === folder.id ? "bg-accent/85 text-accent-foreground" : ""}`}
                >
                  <span className="max-w-full whitespace-pre-wrap break-words">
                    {folder.name}
                  </span>
                </Button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default FolderDetailTree;
