"use client";

import { sessionAtom } from "@/atoms/session";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandListItem,
} from "@/components/ui/command";
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
import { genresData } from "@/lib/data/genresData";
import { createClient } from "@/lib/supabase/client";
import { Tables } from "@/lib/types/supabase";
import { cn } from "@/lib/utils";
import { profileKeys } from "@/queries/profile";
import { storyKeys } from "@/queries/story";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { Check, ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  title: z
    .string()
    .transform((val) => val.trim())
    .and(z.string().min(1, { message: "Title is required" })),
  description: z.string().optional(),
  genre: z.array(z.string()).optional().nullable(),
});

export function UpsertStoryForm({
  story,
  onClose,
}: Readonly<{
  story?: Tables<"stories">;
  onClose?: () => void;
}>) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const router = useRouter();

  const session = useAtomValue(sessionAtom);
  const currentUser = session?.user;

  const { mutate } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!currentUser) throw new Error("current_user_not_found");
      const currentUserProfile = queryClient.getQueryData<Tables<"profiles">>(
        profileKeys.id(currentUser.id),
      );
      const { data, error } = await supabase
        .from("stories")
        .upsert({
          id: story?.id,
          title: values.title,
          description: values.description,
          owner_id: currentUser.id,
          genres: values.genre,
        })
        .select("id")
        .single();

      if (error) throw new Error(error.code);

      return {
        id: data?.id,
        username: currentUserProfile?.username,
        title: values.title,
      };
    },
    onSuccess: ({ id, username, title }) => {
      id && queryClient.invalidateQueries({ queryKey: storyKeys.id(id) });
      queryClient.invalidateQueries({ queryKey: storyKeys.lists() });
      if (username) {
        queryClient.invalidateQueries({
          queryKey: storyKeys.username(username),
        });
        queryClient.invalidateQueries({
          queryKey: profileKeys.username(username),
        });
      }

      onClose && onClose();
      router.push(`/story/${username}/${title}`);
    },
    onError: (e) => {
      if (e.message === "23505")
        return form.setError("title", {
          message: "One of your stories already has this title",
        });

      form.setError("root", {
        message: `Error occurred while ${story ? "editing" : "creating"} story. Please try again.`,
      });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: story?.title ?? "",
      description: story?.description ?? undefined,
      genre: story?.genres,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate(values);
  };

  const toggleGenreSelection = (
    prev: string[],
    genreName: string,
  ): string[] => {
    return prev.includes(genreName)
      ? prev.filter((v) => v !== genreName)
      : [...prev, genreName];
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormDescription className="inline"> *</FormDescription>
              <FormControl>
                <Input placeholder="Don Quixote" {...field} autoFocus />
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
              <FormDescription className="inline"> (optional)</FormDescription>
              <FormControl>
                <Textarea
                  placeholder="To surrender dreams — this may be madness."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`genre`}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <div>
                <FormLabel>Genre</FormLabel>
                <FormDescription className="inline">
                  {" "}
                  (optional)
                </FormDescription>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-fit justify-between",
                        !field?.value && "text-muted-foreground",
                      )}
                    >
                      {(field?.value || []).join(", ") || "Select genre"}

                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search genre..." />
                    <CommandEmpty>Loading...</CommandEmpty>

                    <CommandList>
                      <CommandGroup>
                        {genresData?.map((g) => (
                          <CommandListItem
                            value={g.name}
                            key={g.name}
                            onSelect={(v) => {
                              const prev = field?.value ?? [];

                              form.setValue(
                                "genre",
                                toggleGenreSelection(prev, v),
                              );
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field?.value?.find((v) => v === g.name)
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {g.name}
                          </CommandListItem>
                        ))}
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
        <div className="flex items-end">
          <Button type="submit" className="ml-auto">
            {story ? "Edit" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
