"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { createClient } from "@/lib/supabase/client";
import { Tables } from "@/lib/types/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { TriangleAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import deleteUser from "../_actions/deleteUser";

const formSchema = z.object({
  username: z
    .string()
    .regex(/^\S+$/, {
      message: "Username must not contain spaces.",
    })
    .regex(/^[^@]*$/, {
      message: "Username must not contain '@' characters.",
    }),
});

export default function AccountSettings({
  profile,
}: Readonly<{ profile: Tables<"profiles"> }>) {
  const supabase = createClient();
  const { mutate } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...values,
        })
        .eq("id", profile.id)
        .single();

      if (error) throw Error(error.code);
    },
    onSuccess: () => {
      supabase.auth.signOut();
      window.location.href = "/login";
    },

    onError: (e) => {
      if (e.message === "23505")
        return form.setError("username", {
          message: "Username already taken.",
        });

      form.setError("root", {
        message: "Unknown error, please refresh and try again",
      });
      console.error(e);
    },
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: profile.username,
    },
  });

  const watchUsername = form.watch("username");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    mutate(values);
  }

  const handleDeleteUser = async () => {
    await deleteUser(profile.id);
    window.location.href = "/login";
  };

  return (
    <div className="flex flex-col items-start gap-8">
      <div>
        <h2 className="my-4 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight text-foreground first:mt-0">
          Change username
        </h2>
        <Dialog>
          <Button variant="outline" asChild>
            <DialogTrigger>Change username</DialogTrigger>
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Changing your username</DialogTitle>
              <DialogDescription>
                <Alert variant="destructive" className="my-2">
                  <TriangleAlert className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    Unexpected bad things will happen if you don’t read this!
                  </AlertDescription>
                </Alert>
                If you change your username, the URL of your story and profile
                page will change, which may cause confusion for users who have
                saved the old URL.
                <br />- We will not set up redirects for your old story and
                profile page.
                <br />- You will be signed out.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="john_doe" {...field} />
                      </FormControl>
                      <FormDescription>Your unique username.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.formState.errors.root && (
                  <FormMessage>
                    {form.formState.errors.root.message}
                  </FormMessage>
                )}
                <DialogFooter>
                  <Button
                    variant="outline"
                    type="submit"
                    disabled={watchUsername === profile.username}
                  >
                    Change my username
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <h2 className="my-4 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight text-destructive first:mt-0">
          Delete account
        </h2>
        <AlertDialog>
          <Button variant="destructive" asChild>
            <AlertDialogTrigger>Delete your account</AlertDialogTrigger>
          </Button>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data (stories, posts, stars, etc.) from
                our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleDeleteUser}
              >
                Delete this account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
