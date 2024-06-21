"use client";

import FolderTree from "@/app/(app_shell)/_components/folder/FolderTree";
import { buildFolderTree } from "@/app/(app_shell)/_components/folder/buildFolderTree";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { createClient } from "@/lib/supabase/client";
import { Tables } from "@/lib/types/supabase";
import { cn } from "@/lib/utils";
import { postKeys } from "@/queries/post";
import { getStoryByIdForOwner, storyKeys } from "@/queries/story";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  folder_id: z.string().min(1, {
    message: "You need to choose which folder the post will be created in.",
  }),
});

export default function MovePostForm({
  post,
  onClose,
}: Readonly<{
  post: Tables<"posts">;
  onClose: () => void;
}>) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const { data: story } = useQuery({
    queryKey: storyKeys.id(post.story_id),
    queryFn: () => getStoryByIdForOwner(supabase, post.story_id),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const { data, error } = await supabase
        .from("posts")
        .update({ ...values })
        .eq("id", post.id)
        .select("profiles(username), stories(title)")
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: ({ profiles, stories }) => {
      queryClient.invalidateQueries({ queryKey: postKeys.id(post.id) });
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      queryClient.invalidateQueries({ queryKey: postKeys.drafts() });

      queryClient.invalidateQueries({
        queryKey: postKeys.folder(post.folder_id),
      });
      if (post.title) {
        queryClient.invalidateQueries({
          queryKey: postKeys.title(post.folder_id, post.title),
        });
      }
      if (profiles && stories) {
        queryClient.invalidateQueries({
          queryKey: postKeys.story(profiles.username, stories.title),
        });
      }
      onClose();
    },
    onError: (e) => {
      console.error(e);
      form.setError("root", {
        message: `Error occurred while creating draft. Please try again.`,
      });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      folder_id: post.folder_id,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="folder_id"
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
                        "w-fit justify-between",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value
                        ? story?.folders.find((f) => f.id === field.value)?.name
                        : "Select a parent folder"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-fit max-w-sm p-0">
                  <Command>
                    <CommandInput placeholder="Search folder..." />
                    <CommandEmpty>No folder found.</CommandEmpty>
                    <CommandList>
                      <CommandGroup>
                        <FolderTree
                          folders={buildFolderTree(story?.folders ?? [], null)}
                          deps={0}
                          setValue={(value) =>
                            form.setValue("folder_id", value)
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
        {form.formState.errors.root && (
          <FormMessage>{form.formState.errors.root.message}</FormMessage>
        )}
        <div className="flex items-center justify-end">
          <Button type="submit" disabled={isPending}>
            Move
          </Button>
        </div>
      </form>
    </Form>
  );
}
