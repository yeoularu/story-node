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
import deleteUser from "../_actions/deleteUser";

export default function AccountSettings({ userId }: { userId: string }) {
  const handleDeleteUser = async () => {
    await deleteUser(userId);
    window.location.href = "/login";
  };

  return (
    <>
      <h2 className="my-4 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight text-destructive first:mt-0">
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
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
