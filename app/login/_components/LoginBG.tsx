"use client";

import bgImage from "@/public/bg_3d_green_squares.jpg";
import Image from "next/image";
import { useState } from "react";
import AnimatedBG from "./AnimatedBG";

export default function LoginBG() {
  const [isLoaded, setIsLoaded] = useState(false);
  if (typeof window !== "undefined") {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes("chrome")) return <AnimatedBG />;
  }

  return (
    <Image
      src={bgImage}
      alt="background image"
      placeholder="blur"
      quality={100}
      fill
      sizes="100vw"
      onLoad={() => setIsLoaded(true)}
      style={{
        objectFit: "cover",
        opacity: isLoaded ? 1 : 0,
        transition: "opacity 1s ease-in-out",
      }}
    />
  );
}
