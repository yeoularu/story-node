import { createClient } from "@/lib/supabase/server";
import { folderKeys, getFolder } from "@/queries/folder";
import { getPostByTitle, postKeys } from "@/queries/post";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { redirect } from "next/navigation";
import PostViewer from "./_components/PostsViewer";

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ searchParams }: Props) {
  const title = searchParams.title;

  return {
    title: `${title} | story-node`,
    openGraph: {
      title: `${title} | story-node`,
    },
  };
}

export default async function PostPage({
  params,
  searchParams,
}: Readonly<{
  params: { folderId: string };
  searchParams: { title: string | undefined };
}>) {
  const supabase = createClient();
  const queryClient = new QueryClient();
  const title = searchParams.title;
  if (!title) return redirect("/not-found");

  const infinitePostsByFolderPromise = await queryClient.prefetchInfiniteQuery({
    queryKey: postKeys.infiniteByFolder(params.folderId),
    queryFn: () => getPostByTitle(supabase, params.folderId, title),
    initialPageParam: ["initialTitle", title],
  });

  const folderPromise = await queryClient.prefetchQuery({
    queryKey: folderKeys.id(params.folderId),
    queryFn: () => getFolder(supabase, params.folderId),
  });

  await Promise.all([infinitePostsByFolderPromise, folderPromise]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="container flex max-w-screen-xl flex-col">
        <PostViewer folderId={params.folderId} initialTitle={title} />
      </div>
    </HydrationBoundary>
  );
}
