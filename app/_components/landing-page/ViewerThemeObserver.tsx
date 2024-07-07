"use client";

import {
  fontSizeVariants,
  fontVariants,
  themeVariants,
} from "@/app/(viewer_shell)/_data/settingsData";
import { useIntersectionObserver } from "usehooks-ts";

export default function ViewerThemeObserver({
  children,
  font,
  fontSize,
  theme,
  setViewerTheme,
}: Readonly<{
  children: React.ReactNode;
  font: string;
  fontSize: number;
  theme: string;
  setViewerTheme: (v: string) => void;
}>) {
  const { ref } = useIntersectionObserver({
    onChange: (isIntersecting) => {
      if (isIntersecting) {
        setViewerTheme(
          [
            fontVariants[font],
            fontSizeVariants[fontSize],
            themeVariants[theme],
          ].join(" "),
        );
      }
    },
  });

  return <span ref={ref}> {children} </span>;
}
