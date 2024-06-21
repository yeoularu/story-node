import "@/app/globals.css";
import { createClient } from "@/lib/supabase/server";
import ViewerHeader from "./_components/ViewerHeader";
import ViewerSettingsProvider from "./_components/ViewerSettingsProvider";

export default async function ViewerShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <ViewerSettingsProvider currentUser={user ?? undefined}>
      <ViewerHeader currentUser={user ?? undefined} />
      <main className="h-auto min-h-dvh pt-10">{children}</main>
    </ViewerSettingsProvider>
  );
}
