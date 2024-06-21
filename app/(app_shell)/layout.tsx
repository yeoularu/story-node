import "@/app/globals.css";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Header from "./_components/Header";

export default function AppShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1">{children}</main>
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
