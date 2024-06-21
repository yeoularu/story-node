"use client";

import { PostLinks } from "@/app/(app_shell)/_components/post/PostLinks";
import { sessionAtom } from "@/atoms/session";
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
import { postKeys } from "@/queries/post";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { EllipsisVertical, FolderSymlink, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import MovePostForm from "./MovePostForm";

export default function PostDropdownMenu({
  post,
}: Readonly<{
  post: Tables<"posts"> & {
    profiles: Tables<"profiles">;
    stories: Tables<"stories">;
    post_links_from: {
      to_post_id: string;
    }[];
    post_links_to: {
      from_post_id: string;
    }[];
  };
}>) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(
    null,
  );
  const supabase = createClient();
  const queryClient = useQueryClient();

  const session = useAtomValue(sessionAtom);
  const isOwner = session?.user?.id === post.owner_id;

  const { mutate: deletePost } = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .delete()
        .eq("id", post.id)
        .select("stories(title), profiles(username)")
        .single();

      if (error) throw new Error(error.code);

      return data;
    },

    onSuccess: ({ stories, profiles }) => {
      queryClient.invalidateQueries({ queryKey: postKeys.id(post.id) });
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: postKeys.infiniteByFolder(post.folder_id),
      });
      if (profiles && stories) {
        queryClient.invalidateQueries({
          queryKey: postKeys.story(profiles.username, stories.title),
        });
      }
      if (post.title) {
        queryClient.invalidateQueries({
          queryKey: postKeys.title(post.folder_id, post.title),
        });
      }

      setDeleteDialogOpen(false);
    },

    onError: (error) => {
      console.error(error);
      setDeleteErrorMessage(
        "An error occurred while deleting the post. Please try again later.",
      );
    },
  });

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="max-w-96">
          <PostLinks post={post} />
          {isOwner && (
            <>
              <DropdownMenuItem asChild>
                <Link href={`/compose/post/${post.id}`}>
                  <Pencil className="mr-1 h-4 w-4 text-muted-foreground" />
                  Edit post
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                <FolderSymlink className="mr-1 h-4 w-4 text-muted-foreground" />
                Move post
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-1 h-4 w-4 text-destructive/75" />
                Delete post
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move post</DialogTitle>
            <DialogDescription>
              <MovePostForm
                post={post}
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
              post({post.title}).
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
                deletePost();
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
