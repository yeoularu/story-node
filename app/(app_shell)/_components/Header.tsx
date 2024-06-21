import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Logo from "../../_components/Logo";
import { ModeToggle } from "../../_components/ModeToggle";
import AvatarNav from "./AvatarNav";
import CreateNewMenu from "./CreateNewMenu";
import LoginBtn from "./LoginBtn";

export default async function Header() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <Link href="/home">
          <Logo />
        </Link>

        <div className="flex gap-2">
          <CreateNewMenu />
          <ModeToggle />
          {user ? <AvatarNav user={user} /> : <LoginBtn />}
        </div>
      </div>
    </header>
  );
}
