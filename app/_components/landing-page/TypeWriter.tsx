import { Badge } from "@/components/ui/badge";
import React, { useEffect, useState } from "react";

const TypeWriter = ({
  words = ["words"],
  writeSpeed = 80,
  eraseSpeed = 30,
  pauseBetween = 2000,
  prefix = "prefix",
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [autoSaveStateText, setAutoSaveStateText] = useState<
    "" | "Saving..." | "Saved"
  >("");

  useEffect(() => {
    const word = words[currentWordIndex];

    const getTypingSpeed = () => {
      if (isPaused) return pauseBetween;
      if (isDeleting) return eraseSpeed;
      return writeSpeed;
    };

    const timer = setTimeout(() => {
      if (!isDeleting && currentText.length < word.length) {
        setCurrentText(word.slice(0, currentText.length + 1));
        setAutoSaveStateText("");
      } else if (
        !isDeleting &&
        currentText.length === word.length &&
        !isPaused
      ) {
        setIsPaused(true);
        setTimeout(() => {
          setAutoSaveStateText("Saving...");
        }, 500);
        setTimeout(() => {
          setAutoSaveStateText("Saved");
        }, 1000);
        setTimeout(() => {
          setIsPaused(false);
          setIsDeleting(true);
        }, pauseBetween);
      } else if (isDeleting && currentText.length > 0) {
        setCurrentText(word.slice(0, currentText.length - 1));
        setAutoSaveStateText("");
      } else if (isDeleting && currentText.length === 0) {
        setIsPaused(true);
        setTimeout(() => {
          setAutoSaveStateText("Saving...");
        }, 500);
        setTimeout(() => {
          setIsPaused(false);
        }, 900);
        setIsDeleting(false);
        setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
      }
    }, getTypingSpeed());

    return () => {
      clearTimeout(timer);
    };
  }, [
    currentText,
    currentWordIndex,
    isDeleting,
    isPaused,
    words,
    writeSpeed,
    eraseSpeed,
    pauseBetween,
  ]);

  return (
    <div>
      <Badge
        className={`ml-auto block h-6 w-fit ${autoSaveStateText === "" ? "invisible" : "visible"}`}
        variant="secondary"
      >
        {autoSaveStateText}
      </Badge>

      <p className="inline-block">
        {prefix}
        {currentText}
        <span className="-ml-1 animate-blink">│</span>
      </p>
    </div>
  );
};

export default TypeWriter;
