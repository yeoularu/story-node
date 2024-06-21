import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Index() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/home");

  return (
    <>
      <Link href="/home">home</Link> <br />
      <Link href="/login">sign in</Link>
      <p>
        What unites people? Armies? Gold? Flags? Stories. There&apos;s nothing
        in the world more powerful than a good story.
      </p>
    </>
  );
}
