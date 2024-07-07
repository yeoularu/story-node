"use client";

import { safariFantasyStyleAtom } from "@/atoms/safariFantasyStyle";
import { User } from "@supabase/supabase-js";
import { useSetAtom } from "jotai";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { useIsClient, useLocalStorage } from "usehooks-ts";
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

  const isClient = useIsClient();
  const [{ font, fontSize, viewerTheme }] = useLocalStorage(
    "viewer-settings:" + (currentUser?.id ?? "unauthenticated"),
    { font: "default", fontSize: "16", viewerTheme: theme ?? "system" },
  );

  const userAgent =
    typeof window === "undefined"
      ? ""
      : window.navigator.userAgent.toLowerCase();
  const isSafari =
    userAgent.includes("safari") && !userAgent.includes("chrome");

  const setSafariFantasyStyle = useSetAtom(safariFantasyStyleAtom);

  useEffect(() => {
    if (isSafari && font === "fantasy")
      setSafariFantasyStyle("leading-[3] h-8");
    else setSafariFantasyStyle("");
  }, [isSafari, font, setSafariFantasyStyle]);

  return (
    <div
      className={`transition-opacity
      ${isClient ? "opacity-100" : "opacity-0"}
        ${
          isClient &&
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
