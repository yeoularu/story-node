import { createClient } from "@/lib/supabase/server";
import { folderKeys, getFolder } from "@/queries/folder";
import { getPostByTitle, getPostsByFolder, postKeys } from "@/queries/post";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
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
  searchParams: { title: string };
}>) {
  const supabase = createClient();
  const queryClient = new QueryClient();

  const postsByFolderPromise = await queryClient.prefetchQuery({
    queryKey: postKeys.folder(params.folderId),
    queryFn: () => getPostsByFolder(supabase, params.folderId),
  });

  const infinitePostsByFolderPromise = await queryClient.prefetchInfiniteQuery({
    queryKey: postKeys.infiniteByFolder(params.folderId),
    queryFn: () =>
      getPostByTitle(supabase, params.folderId, searchParams.title),
    initialPageParam: ["initialTitle", searchParams.title],
  });

  const folderPromise = await queryClient.prefetchQuery({
    queryKey: folderKeys.id(params.folderId),
    queryFn: () => getFolder(supabase, params.folderId),
  });

  await Promise.all([
    postsByFolderPromise,
    infinitePostsByFolderPromise,
    folderPromise,
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="container flex max-w-screen-xl flex-col">
        <PostViewer
          folderId={params.folderId}
          initialTitle={searchParams.title}
        />
      </div>
    </HydrationBoundary>
  );
}
