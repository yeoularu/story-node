"use client";

import { UpsertStoryForm } from "@/app/(app_shell)/_components/story/UpsertStoryForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { Tables } from "@/lib/types/supabase";
import { profileKeys } from "@/queries/profile";
import { storyKeys } from "@/queries/story";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Settings, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OwnerDropdownMenu({
  story,
}: Readonly<{
  story: Tables<"stories">;
}>) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(
    null,
  );
  const supabase = createClient();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate: deleteStory } = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("stories")
        .delete()
        .eq("id", story.id)
        .select("profiles(username)")
        .single();

      if (error) throw new Error(error.code);

      return data.profiles?.username;
    },

    onSuccess: (username) => {
      queryClient.invalidateQueries({ queryKey: storyKeys.id(story.id) });
      queryClient.invalidateQueries({ queryKey: storyKeys.lists() });
      if (username) {
        queryClient.invalidateQueries({
          queryKey: storyKeys.username(username),
        });
        queryClient.invalidateQueries({
          queryKey: profileKeys.username(username),
        });
      }
      setDeleteDialogOpen(false);
      router.push("/home");
    },

    onError: (error) => {
      console.error(error);
      setDeleteErrorMessage(
        "An error occurred while deleting the story. Please try again later.",
      );
    },
  });

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
            <Pencil className="mr-1 h-4 w-4 text-muted-foreground" />
            Edit story
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-1 h-4 w-4 text-destructive/75" />
            Delete story
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit story</DialogTitle>
            <DialogDescription>
              <UpsertStoryForm
                story={story}
                onClose={() => setEditDialogOpen(false)}
              />
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              story({story.title}) and all the data it contains.
            </AlertDialogDescription>

            {deleteErrorMessage && (
              <p className="text-sm text-destructive">{deleteErrorMessage}</p>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(event) => {
                event.preventDefault();
                deleteStory();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
