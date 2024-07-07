"use client";

import { Card, CardTitle } from "@/components/ui/card";
import Image, { StaticImageData } from "next/image";
import { useRef, useState } from "react";
import { useOnClickOutside } from "usehooks-ts";

export default function GifCard({
  title,
  gif,
  img,
}: Readonly<{ title: string; gif: StaticImageData; img: StaticImageData }>) {
  const [play, setPlay] = useState(false);

  const ref = useRef(null);

  const handleClickOutside = () => {
    setPlay(false);
  };

  const handleClickInside = () => {
    setPlay(true);
  };

  useOnClickOutside(ref, handleClickOutside);

  return (
    <Card
      ref={ref}
      onClick={handleClickInside}
      className="h-[28rem] w-80 bg-black"
      onMouseEnter={() => setPlay(true)}
      onMouseLeave={() => setPlay(false)}
    >
      <div
        className={`${play ? "" : "brightness-50 filter"} relative h-96 overflow-hidden transition-all duration-500`}
      >
        <div className="absolute inset-0 z-50 bg-gradient-to-b from-transparent to-black" />
        <Image
          className="rounded-lg rounded-t object-cover"
          src={play ? gif : img}
          fill
          priority={true}
          unoptimized={play}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          alt="GIF image"
        />
      </div>
      <CardTitle className="mt-2 p-4">{title}</CardTitle>
    </Card>
  );
}
