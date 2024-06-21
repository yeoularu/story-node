"use client";

import FolderTree from "@/app/(app_shell)/_components/folder/FolderTree";
import { buildFolderTree } from "@/app/(app_shell)/_components/folder/buildFolderTree";
import { sessionAtom } from "@/atoms/session";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import type { FolderTree as FolderTreeType } from "@/lib/types/folderTree";
import { Tables } from "@/lib/types/supabase";
import { cn } from "@/lib/utils";
import { profileKeys } from "@/queries/profile";
import { storyKeys } from "@/queries/story";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { ChevronsUpDown, FolderPlus } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Name is required" })
    .refine((name) => !name.includes("/"), {
      message: "Name should not contain '/' character",
    }),
  description: z.string().optional(),
  parent_id: z.string(),
});

export function UpsertFolderDialog({
  folder,
  story,
}: Readonly<{
  folder?: FolderTreeType;
  story: Tables<"stories"> & { folders: Tables<"folders">[] };
}>) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const session = useAtomValue(sessionAtom);
  const currentUser = session?.user;

  const [isOpen, setIsOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const { mutate } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!currentUser) throw new Error("current_user_not_found");

      const currentUserProfile = queryClient.getQueryData<Tables<"profiles">>(
        profileKeys.id(currentUser.id),
      );
      const { error } = await supabase.from("folders").upsert({
        id: folder?.id,
        name: values.name,
        description: values.description,
        parent_id: values.parent_id,
        owner_id: currentUser.id,
        story_id: story.id,
      });

      if (error) throw new Error(error.code);

      return {
        username: currentUserProfile?.username,
      };
    },
    onSuccess: ({ username }) => {
      queryClient.invalidateQueries({ queryKey: storyKeys.id(story.id) });
      if (username) {
        queryClient.invalidateQueries({
          queryKey: storyKeys.title(username, story.title),
        });
      }
      setIsOpen(false);
      form.reset({
        name: "",
        description: "",
        parent_id: story.folders.find((f) => f.parent_id === null)?.id,
      });
    },
    onError: (e) => {
      if (e.message === "23505")
        return form.setError("name", {
          message:
            "One of the folders in this location already uses this name.",
        });

      form.setError("root", {
        message: `Error occurred while ${folder ? "editing" : "creating"} folder. Please try again.`,
      });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: folder?.name,
      description: folder?.description ?? undefined,
      parent_id:
        folder?.parent_id ??
        story.folders.find((f) => f.parent_id === null)?.id,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => {
            setIsOpen(true);
          }}
          variant="ghost"
          size="sm"
        >
          <FolderPlus className="mr-2 h-5 w-5" />
          {folder ? "Edit" : "New"} folder
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{folder ? "Edit" : "Create"} folder</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormDescription className="inline"> *</FormDescription>
                  <FormControl>
                    <Input {...field} autoFocus />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormDescription className="inline">
                    {" "}
                    (optional)
                  </FormDescription>
                  <FormControl>
                    <Textarea className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {story.folders.length > 1 && (
              <FormField
                control={form.control}
                name="parent_id"
                render={({ field }) => (
                  <FormItem className="mt-2 flex flex-col">
                    <FormLabel>Folder Path</FormLabel>
                    <Popover
                      open={isPopoverOpen}
                      onOpenChange={setIsPopoverOpen}
                      modal={true}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-[200px] justify-between",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value
                              ? story.folders.find((f) => f.id === field.value)
                                  ?.name
                              : "Select a parent folder"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-fit max-w-sm p-0">
                        <Command>
                          <CommandInput placeholder="Search folder..." />
                          <CommandList>
                            <CommandEmpty>No folder found.</CommandEmpty>
                            <CommandGroup>
                              <FolderTree
                                folders={buildFolderTree(story.folders, null)}
                                deps={0}
                                setValue={(value) =>
                                  form.setValue("parent_id", value)
                                }
                                closePopover={() => setIsPopoverOpen(false)}
                              />
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <div className="flex items-center justify-end">
              <Button type="submit">{folder ? "Edit" : "Create"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
