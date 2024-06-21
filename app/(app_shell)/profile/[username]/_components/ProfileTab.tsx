"use client";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { getProfileByUsername, profileKeys } from "@/queries/profile";
import { useQuery } from "@tanstack/react-query";
import { Book, Star, User } from "lucide-react";
import { useParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { useMediaQuery } from "usehooks-ts";
import Overview from "./Overview";
import Stars from "./Stars";
import Stories from "./Stories";

export default function ProfileTab() {
  const params = useParams<{ username: string }>();
  const username = decodeURIComponent(params.username);
  const [tab, setTab] = useQueryState("tab", { history: "push" });
  const supabase = createClient();
  const isDesktop = useMediaQuery("(min-width: 768px)", {
    initializeWithValue: false,
  });

  const { data: profile } = useQuery({
    queryKey: profileKeys.username(username),
    queryFn: () => getProfileByUsername(supabase, username),
  });
  const storiesCount = profile?.stories[0].count ?? 0;
  const starsCount = profile?.stars[0].count ?? 0;

  return (
    <Tabs value={tab ?? "overview"} onValueChange={setTab} className="w-full">
      <div className={`flex ${isDesktop ? "justify-start" : "justify-center"}`}>
        <TabsList>
          <TabsTrigger value="overview">
            <User className="mr-1 h-4 w-4 text-muted-foreground max-[400px]:hidden" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="stories">
            <Book className="mr-1 h-4 w-4 text-muted-foreground max-[400px]:hidden" />
            Stories
            {storiesCount > 0 && (
              <Badge variant="display">{storiesCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="stars">
            <Star className="mr-1 h-4 w-4 text-muted-foreground max-[400px]:hidden" />
            Stars
            {starsCount > 0 && <Badge variant="display">{starsCount}</Badge>}
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="overview">
        {profile && <Overview userId={profile.id} />}
      </TabsContent>
      <TabsContent value="stories">
        {profile && <Stories userId={profile.id} />}
      </TabsContent>
      <TabsContent value="stars">
        {profile && <Stars userId={profile.id} />}
      </TabsContent>
    </Tabs>
  );
}
