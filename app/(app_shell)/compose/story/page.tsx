import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PageTitle from "../../_components/PageTitle";
import { UpsertStoryForm } from "../../_components/story/UpsertStoryForm";

export const metadata = {
  title: "Create story | story-node",
};

export default async function ComposeStoryPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/compose/story");
  }

  return (
    <div className="container flex max-w-screen-xl flex-col">
      <PageTitle>Create story</PageTitle>
      <UpsertStoryForm />
    </div>
  );
}
