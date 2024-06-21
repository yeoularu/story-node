import Logo from "@/app/_components/Logo";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import GoogleBtn from "./GoogleBtn";

export default function LoginCard({
  searchParams,
}: Readonly<{
  searchParams: { message: string; next: string };
}>) {
  const signInWithGoogle = async () => {
    "use server";
    const origin = headers().get("origin");

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback${searchParams.next ? "?next=" + searchParams.next : ""}`,
      },
    });

    if (data.url) {
      redirect(data.url);
    }

    if (error) {
      console.error(error);
      return redirect("/login?message=Could not authenticate user");
    }
  };

  return (
    <div className="fixed z-10 h-dvh w-dvw">
      <div className="flex h-full w-full items-center justify-center">
        <Card className="m-4 max-w-md">
          <CardHeader className="flex flex-col items-center gap-2">
            <Link href="/">
              <Logo />
            </Link>
            <CardTitle className="text-xl text-secondary-foreground">
              Sign In or Sign Up
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-1">
            <p className="text-muted-foreground">continue with</p>
            <form action={signInWithGoogle}>
              <GoogleBtn />
            </form>
            {searchParams.message && <p>{searchParams.message}</p>}
          </CardContent>
          <CardFooter className="inline-block text-sm text-gray-500">
            By sining in or sining up, you agree with our{" "}
            <Link href="/terms" className="text-muted-foreground underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy-policy"
              className="text-muted-foreground underline"
            >
              Privacy Policy
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
