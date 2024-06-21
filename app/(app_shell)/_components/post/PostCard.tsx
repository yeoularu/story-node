import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tables } from "@/lib/types/supabase";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import Link from "next/link";

dayjs.extend(localizedFormat);

export default function PostCard({
  post,
  content,
}: Readonly<{
  post: Tables<"posts"> & {
    post_links_from: {
      to_post_id: string;
    }[];
    post_links_to: {
      from_post_id: string;
    }[];
  };
  content: React.ReactNode;
}>) {
  const cardLink =
    post.status === "published"
      ? `/post/${post.folder_id}?title=${post.title}`
      : `/compose/post/${post.id}`;

  return (
    <Link key={post.id} href={cardLink}>
      <Card>
        <CardHeader>
          <CardTitle className="line-clamp-2 min-h-12 whitespace-pre-wrap break-words">
            {post.title ??
              `Untitled draft (Created at ${dayjs(post.inserted_at).format("lll")})`}
          </CardTitle>
          <CardDescription>
            {dayjs(post.inserted_at).format("lll")}
          </CardDescription>
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    </Link>
  );
}
