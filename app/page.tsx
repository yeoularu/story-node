import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import Logo from "./_components/Logo";
import Landing from "./_components/landing-page/Landing";

export default async function Index() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/home");

  return (
    <div className="dark bg-background text-foreground">
      <header className="z-50 w-full">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
          <Logo />
        </div>
      </header>
      <main className="container flex flex-col items-center justify-start">
        <div className="mx-auto my-8 max-w-2xl py-8 text-center">
          <h1 className="inline scroll-m-20 text-center text-3xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
            Write with structure
            <p className="bg-gradient-to-tr from-[hsl(142.1,70.6%,70%)] via-primary to-primary/90 bg-clip-text text-transparent">
              Expand your universe
            </p>
          </h1>
          <p className="text-md my-4 scroll-m-20 text-center text-base font-light lg:text-lg">
            story-node is a platform that transforms storytelling by providing
            tools to structure, visualize, and expand your creative worlds,
            offering immersive experiences for both writers and readers.
          </p>
          <div className="flex justify-center gap-3 text-center">
            <Button
              className="bg-primary/75 hover:bg-primary/50"
              variant="secondary"
              asChild
            >
              <Link href="/home">Get started</Link>
            </Button>
            <Button className="bg-foreground/25" variant="secondary" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>

        <Landing />
      </main>
      <div className="fixed h-10 bg-foreground/10"></div>
      <footer className="mt-4 flex flex-wrap-reverse items-center justify-center">
        <p className="inline-flex h-10 items-center justify-center gap-1 whitespace-nowrap px-4 text-sm text-muted-foreground">
          Made by
          <Link
            className="underline-offset-4 hover:underline"
            href="https://github.com/yeoularu"
          >
            yeoularu
          </Link>
          2024.
        </p>
        <div>
          <Button
            variant="link"
            className="font-normal text-muted-foreground"
            asChild
          >
            <Link href="/terms">Terms</Link>
          </Button>
          <Button
            variant="link"
            className="font-normal text-muted-foreground"
            asChild
          >
            <Link href="/privacy-policy">Privacy</Link>
          </Button>
          <Button
            variant="link"
            className="font-normal text-muted-foreground"
            asChild
          >
            <Link href="https://github.com/yeoularu/story-node">Github</Link>
          </Button>
        </div>
      </footer>
    </div>
  );
}
