"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { getProfileById, profileKeys } from "@/queries/profile";
import { getStarsByUserId, starKeys } from "@/queries/star";
import { storyKeys } from "@/queries/story";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Star } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ToggleStarBtn({
  userId,
  story,
}: Readonly<{
  userId?: string;
  story: {
    id: string;
    title: string;
    profiles: { username: string } | null;
    stars: { count: number }[];
  };
}>) {
  const pathname = usePathname();

  if (!userId) {
    return (
      <Button variant="outline" size="sm" asChild>
        <Link href={"/login?next=" + pathname}>
          <Star className="mr-2 h-4 w-4 text-muted-foreground" />
          Star<Badge variant="display">{story.stars[0].count}</Badge>
        </Link>
      </Button>
    );
  }

  return <StarBtn userId={userId} story={story} />;
}

const StarBtn = ({
  userId,
  story,
}: {
  userId: string;
  story: {
    id: string;
    title: string;
    profiles: { username: string } | null;
    stars: { count: number }[];
  };
}) => {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: starList, isPending } = useQuery({
    queryKey: starKeys.userId(userId),
    queryFn: () => getStarsByUserId(supabase, userId),
  });

  const { data: currentUserProfile } = useQuery({
    queryKey: profileKeys.id(userId),
    queryFn: () => getProfileById(supabase, userId),
  });

  const isStarred = starList?.some(({ story_id }) => story_id === story.id);

  const { mutate: star } = useMutation({
    mutationFn: async () => {
      if (isStarred) {
        await supabase
          .from("stars")
          .delete()
          .eq("story_id", story.id)
          .eq("user_id", userId);
      } else {
        await supabase
          .from("stars")
          .insert([{ story_id: story.id, user_id: userId }]);
      }
    },
    onMutate: async () => {
      const previousData = queryClient.getQueryData(starKeys.userId(userId));
      queryClient.setQueryData(
        starKeys.userId(userId),
        (old: { story_id: string }[]) => {
          if (isStarred) {
            return old?.filter((star) => star.story_id !== story.id);
          } else return [...old, { story_id: story.id }];
        },
      );

      if (story.profiles?.username) {
        queryClient.setQueryData(
          storyKeys.title(story.profiles.username, story.title),
          (old: { stars: { count: number }[] }) => {
            if (isStarred) {
              return { ...old, stars: [{ count: old.stars[0].count - 1 }] };
            } else
              return { ...old, stars: [{ count: old.stars[0].count + 1 }] };
          },
        );
      }

      return { previousData };
    },
    onError: (e, _, context) => {
      console.error(e);
      queryClient.setQueryData(starKeys.userId(userId), context?.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: starKeys.userId(userId) });
      queryClient.invalidateQueries({ queryKey: storyKeys.lists() });
      currentUserProfile &&
        queryClient.invalidateQueries({
          queryKey: profileKeys.username(currentUserProfile?.username),
        });
    },
  });

  if (isPending) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-muted-foreground" />
      </Button>
    );
  }

  const handleClick = () => {
    star();
  };

  return isStarred ? (
    <Button variant="outline" size="sm" onClick={handleClick}>
      <Star className="mr-2 h-4 w-4 fill-yellow-400 text-yellow-400" />
      Starred
      <Badge variant="display">{story.stars[0].count}</Badge>
    </Button>
  ) : (
    <Button variant="outline" size="sm" onClick={handleClick}>
      <Star className="mr-2 h-4 w-4 text-muted-foreground" />
      Star<Badge variant="display">{story.stars[0].count}</Badge>
    </Button>
  );
};
