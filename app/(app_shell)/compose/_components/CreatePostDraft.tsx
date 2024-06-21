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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { postKeys } from "@/queries/post";
import { getStoriesByOwner, storyKeys } from "@/queries/story";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@supabase/supabase-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  story_id: z
    .string()
    .min(1, { message: "You need to choose which story's post it is." }),
  folder_id: z.string().min(1, {
    message: "You need to choose which folder the post will be created in.",
  }),
});

export default function CreatePostDraft({
  currentUser,
}: Readonly<{
  currentUser: User;
}>) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const router = useRouter();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const { data: storyList } = useQuery({
    queryKey: storyKeys.listByOwner(currentUser.id),
    queryFn: () => getStoriesByOwner(supabase, currentUser.id),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!currentUser) throw new Error("current_user_not_found");

      const { data, error } = await supabase
        .from("posts")
        .insert({
          story_id: values.story_id,
          folder_id: values.folder_id,
          owner_id: currentUser.id,
        })
        .select("id, stories(title), profiles(username)")
        .single();

      if (error) throw new Error(error.message);

      return data;
    },

    onSuccess: ({ id, stories, profiles }) => {
      if (stories && profiles) {
        queryClient.invalidateQueries({
          queryKey: postKeys.story(profiles.username, stories.title),
        });
      }
      router.replace(`/compose/post/${id}`);
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
      story_id: "",
      folder_id: "",
    },
  });

  const getStoryById = (storyId: string) =>
    storyList?.find((story) => story.id === storyId);
  const getSelectedStory = () => getStoryById(form.getValues().story_id);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate(values);
  };

  if (storyList?.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">No stories found</h1>
        <p className="mt-2 text-muted-foreground">
          You need to create a story before creating a post.
        </p>
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => router.push("/compose/story")}
        >
          Create a story
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="story_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Story</FormLabel>
              <Select
                onValueChange={(v) => {
                  const selectedStory = storyList?.find(
                    (story) => story.id === v,
                  );
                  const rootFolder = selectedStory?.folders.find(
                    (f) => f.parent_id === null,
                  );

                  if (rootFolder) form.setValue("folder_id", rootFolder.id);

                  return field.onChange(v);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a story" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {storyList?.map((story) => (
                    <SelectItem key={story.id} value={story.id}>
                      {story.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

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
                        ? getStoryById(form.getValues().story_id)?.folders.find(
                            (f) => f.id === field.value,
                          )?.name
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
                          folders={buildFolderTree(
                            getSelectedStory()?.folders ?? [],
                            null,
                          )}
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
            Create
          </Button>
        </div>
      </form>
    </Form>
  );
}
