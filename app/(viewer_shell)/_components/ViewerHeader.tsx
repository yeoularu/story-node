"use client";

import { User } from "@supabase/supabase-js";
import BackBtn from "./BackBtn";
import ViewerSettingsPanel from "./ViewerSettingsPanel";

export default function ViewerHeader({
  currentUser: user,
}: Readonly<{ currentUser?: User }>) {
  return (
    <div className="fixed top-0 w-full bg-inherit">
      <header className="flex items-center justify-between p-1">
        <BackBtn />
        <ViewerSettingsPanel currentUser={user ?? undefined} />
      </header>
    </div>
  );
}
