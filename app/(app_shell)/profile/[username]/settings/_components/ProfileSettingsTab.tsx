"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { getProfileByUsername, profileKeys } from "@/queries/profile";
import { User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { UserCog } from "lucide-react";
import { useParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { useMediaQuery } from "usehooks-ts";
import AccountSettings from "./AccountSettings";

export default function ProfileSettingTab({
  currentUser,
}: Readonly<{
  currentUser: User;
}>) {
  const params = useParams<{ username: string }>();
  const username = decodeURIComponent(params.username);
  const supabase = createClient();

  const [tab, setTab] = useQueryState("tab", { history: "push" });
  const isDesktop = useMediaQuery("(min-width: 768px)", {
    initializeWithValue: false,
  });

  const { data: profile } = useQuery({
    queryKey: profileKeys.username(username),
    queryFn: () => getProfileByUsername(supabase, username),
  });

  if (!profile) return null;
  if (currentUser.id !== profile.id) {
    window.location.href = "/";
    return <></>;
  }
  return (
    <Tabs
      value={tab ?? "account"}
      onValueChange={setTab}
      className="flex w-full flex-1 flex-col"
    >
      <div
        className={`mb-4 flex ${isDesktop ? "justify-start" : "justify-center"}`}
      >
        <TabsList>
          <TabsTrigger value="account">
            <UserCog className="mr-1 h-4 w-4 text-muted-foreground" />
            Account
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="account">
        <AccountSettings profile={profile} />
      </TabsContent>
    </Tabs>
  );
}
