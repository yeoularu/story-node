"use client";

import { User } from "@supabase/supabase-js";
import { useTheme } from "next-themes";
import { useIsMounted, useLocalStorage } from "usehooks-ts";
import {
  fontSizeVariants,
  fontVariants,
  themeVariants,
} from "../_data/settingsData";

export default function ViewerSettingsProvider({
  children,
  currentUser,
}: Readonly<{
  children: React.ReactNode;
  currentUser?: User;
}>) {
  const { theme } = useTheme();
  const isMounted = useIsMounted();

  const [{ font, fontSize, viewerTheme }] = useLocalStorage(
    "viewer-settings:" + currentUser?.id,
    { font: "default", fontSize: "16", viewerTheme: theme ?? "system" },
  );

  return (
    <div
      className={`transition-opacity
      ${isMounted() ? "opacity-100" : "opacity-0"}
        ${
          isMounted() &&
          [
            fontVariants[font],
            fontSizeVariants[fontSize],
            themeVariants[viewerTheme],
          ].join(" ")
        }
      `}
    >
      {children}
    </div>
  );
}
