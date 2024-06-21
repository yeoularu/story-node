"use client";

import bgImage from "@/public/bg_3d_green_squares.jpg";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export default function AnimatedBG() {
  const [transformStyle, setTransformStyle] = useState("");
  const requestRef = useRef<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const position = useRef({ x: 0, y: 0 });

  const updateAnimation = useCallback(() => {
    const x = position.current.x;
    const y = position.current.y;
    setTransformStyle(`translate(${x}px, ${y}px)`);

    requestRef.current = requestAnimationFrame(updateAnimation);
  }, []);

  const handlePointerMove = (e: PointerEvent) => {
    position.current.x = (window.innerWidth / 2 - e.pageX) / 10;
    position.current.y = (window.innerHeight / 2 - e.pageY) / 10;
  };

  const handleDeviceMotion = (e: DeviceMotionEvent) => {
    const x = e.accelerationIncludingGravity?.x;
    const y = e.accelerationIncludingGravity?.y;

    if (x && y) {
      position.current.x = x * 5;
      position.current.y = (y - 5) * 10;
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    requestRef.current = requestAnimationFrame(updateAnimation);

    if (navigator.maxTouchPoints === 0) {
      window.addEventListener("pointermove", handlePointerMove);
    } else {
      window.addEventListener("devicemotion", handleDeviceMotion);
    }

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("devicemotion", handleDeviceMotion);
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [updateAnimation]);

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
        transform: `${transformStyle} scale(1.4)`,
        opacity: isLoaded ? 1 : 0,
        transition: "transform 0.2s ease-out, opacity 1s ease-in-out",
      }}
    />
  );
}
