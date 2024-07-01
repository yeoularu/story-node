"use client";

import { PostLinks } from "@/app/(app_shell)/_components/post/PostLinks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { getPostById, postKeys } from "@/queries/post";
import { getProfileById, profileKeys } from "@/queries/profile";
import { storyKeys } from "@/queries/story";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@supabase/supabase-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GeistSans } from "geist/font/sans";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import { useDebounceCallback } from "usehooks-ts";
import { z } from "zod";

const formSchema = z.object({
  title: z.string().trim().min(1, { message: "Title is required" }),
  content: z.string().trim().min(1, {
    message:
      "Content is required. Click in the blank space below to write your content.",
  }),
});

export default function UpdatePost({
  postId,
  currentUser,
}: Readonly<{ postId: string; currentUser: User }>) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const router = useRouter();

  const [autoSaveStateText, setAutoSaveStateText] = useState<
    null | "Saving..." | "Saved"
  >(null);

  const { data: post } = useQuery({
    queryKey: postKeys.id(postId),
    queryFn: () => getPostById(supabase, postId),
  });

  const titleDuplicateError = () =>
    form.setError("title", {
      message: "Posts in the same folder must have different titles.",
    });

  const { data: profile } = useQuery({
    queryKey: profileKeys.id(currentUser.id),
    queryFn: () => getProfileById(supabase, currentUser.id),
  });

  const { mutate: updatePost } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!post) throw new Error("post_not_found");
      if (!currentUser) throw new Error("current_user_not_found");

      setAutoSaveStateText("Saving...");

      const { error } = await supabase
        .from("posts")
        .update({
          ...values,
        })
        .eq("id", postId);

      if (error) throw new Error(error.code);
    },

    onSuccess: () => {
      form.setError("root", { message: undefined });
      queryClient.invalidateQueries({ queryKey: postKeys.id(postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.drafts() });

      setAutoSaveStateText("Saved");
    },

    onError: (e) => {
      setAutoSaveStateText(null);
      if (e.message === "23505") return titleDuplicateError();
      form.setError("root", {
        message: `Error occurred while auto-saving post draft. Please try again.`,
      });
    },
  });

  const { mutate: publish } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!post) throw new Error("post_not_found");
      if (!currentUser) throw new Error("current_user_not_found");

      const { data, error } = await supabase
        .from("posts")
        .update({
          ...values,
          status: "published",
        })
        .eq("id", postId)
        .select("story_id, folder_id, title, stories(title)")
        .single();

      if (error) throw new Error(error.code);
      return data;
    },
    onSuccess: ({ story_id, folder_id, title, stories }) => {
      queryClient.invalidateQueries({ queryKey: postKeys.id(postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.drafts() });
      queryClient.invalidateQueries({ queryKey: storyKeys.id(story_id) });

      title &&
        queryClient.invalidateQueries({
          queryKey: postKeys.title(folder_id, title),
        });

      if (stories && profile) {
        queryClient.invalidateQueries({
          queryKey: postKeys.story(profile.username, stories.title),
        });
      }
      title &&
        router.replace(`/post/${folder_id}?title=${encodeURIComponent(title)}`);
    },
    onError: (e) => {
      if (e.message === "23505") return titleDuplicateError();
      form.setError("root", {
        message: `Error occurred while publishing post. Copy/save the current data to a safe storage and then try again.`,
      });
    },
  });

  const { mutate: switchToDraft } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!post) throw new Error("post_not_found");
      if (!currentUser) throw new Error("current_user_not_found");
      const { data, error } = await supabase
        .from("posts")
        .update({
          ...values,
          status: "draft",
        })
        .eq("id", postId)
        .select("story_id, folder_id, title, stories(title)")
        .single();

      if (error) throw new Error(error.code);
      return data;
    },
    onSuccess: ({ story_id, folder_id, title, stories }) => {
      queryClient.invalidateQueries({ queryKey: postKeys.id(postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.drafts() });
      queryClient.invalidateQueries({ queryKey: storyKeys.id(story_id) });

      title &&
        queryClient.invalidateQueries({
          queryKey: postKeys.title(folder_id, title),
        });

      if (stories && profile) {
        queryClient.invalidateQueries({
          queryKey: postKeys.story(profile.username, stories.title),
        });
      }
    },
    onError: (e) => {
      if (e.message === "23505") return titleDuplicateError();
      form.setError("root", {
        message: `Error occurred while switching to draft post. Copy/save the current data to a safe storage and then try again.`,
      });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: post?.title ?? "",
      content: post?.content ?? "",
    },
  });

  const formTitle = form.watch("title");
  const formContent = form.watch("content");
  const isContentChanged = post?.content !== formContent;

  const debounceUpdatePost = useDebounceCallback(updatePost, 2000);

  useEffect(() => {
    const subscription = form.watch(({ title, content }, { type }) => {
      if (post?.status === "published") return;
      if (type !== "change") return;
      if (!title || !content) return;

      setAutoSaveStateText(null);
      debounceUpdatePost({ title, content });
    });
    return () => subscription.unsubscribe();
  }, [debounceUpdatePost, form, post?.status]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    publish(values);
  };

  if (post?.owner_id !== currentUser.id) {
    router.replace("/");
    return <></>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="mx-6 mt-2 flex flex-col rounded-xl bg-background p-4 text-foreground">
          <div className="mb-2 flex flex-wrap-reverse items-center justify-end gap-2">
            {post?.status === "published" && (
              <Button
                variant="secondary"
                onClick={(e) => {
                  e.preventDefault();
                  switchToDraft(form.getValues());
                }}
              >
                Switch to Draft
              </Button>
            )}
            <Button type="submit" disabled={!post}>
              Save & Publish
            </Button>
          </div>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Title" {...field} />
                </FormControl>
                <FormDescription>
                  Posts in the same folder must have different titles.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {post && (
            <PostLinks post={post} isOwner={currentUser.id === post.owner_id} />
          )}

          {form.formState.errors.root && (
            <FormMessage>{form.formState.errors.root.message}</FormMessage>
          )}
          {form.formState.errors.content && (
            <FormMessage>{form.formState.errors.content.message}</FormMessage>
          )}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <div
              className={cn(
                "sticky inset-x-0 right-10 top-8 z-50 ml-auto max-w-max",
                GeistSans.className,
              )}
            >
              {post?.status === "draft" && autoSaveStateText ? (
                <button onClick={() => setAutoSaveStateText(null)}>
                  <Badge variant="secondary">{autoSaveStateText}</Badge>
                </button>
              ) : (
                <Badge className="invisible" />
              )}

              {post?.status === "published" && isContentChanged && (
                <Badge variant="destructive">Can&apos;t auto-saving</Badge>
              )}
            </div>
          </PopoverTrigger>
          {post?.status === "published" && isContentChanged && (
            <PopoverContent className="whitespace-pre-wrap break-words text-center">
              Published posts cannot be auto-saved. If you have a lot of
              changes, switch to draft.
            </PopoverContent>
          )}
        </Popover>

        <div className="sticky inset-x-0 top-1 z-40 mx-auto flex w-[calc(100%-3rem)] items-center justify-center text-center text-sm opacity-90">
          <Popover>
            <PopoverTrigger asChild>
              <div className="mx-auto w-fit max-w-full rounded-md p-1.5 transition-colors hover:cursor-pointer hover:bg-transparent/5 hover:text-inherit">
                <p
                  className={`line-clamp-1 whitespace-pre-wrap break-words text-center ${formTitle === "" && "opacity-50"}`}
                >
                  {formTitle || "Untitled"}
                </p>
              </div>
            </PopoverTrigger>
            <PopoverContent>
              <p className="whitespace-pre-wrap break-words text-center">
                {formTitle || "Untitled"}
              </p>
            </PopoverContent>
          </Popover>
        </div>

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormControl>
                <TextareaAutosize
                  className="resize-none bg-inherit px-0 pb-96 focus:outline-none sm:px-6"
                  autoFocus
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
