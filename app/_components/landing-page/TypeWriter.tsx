import React, { useEffect, useState } from "react";

const TypeWriter = ({
  words = ["words"],
  writeSpeed = 80,
  eraseSpeed = 30,
  pauseBetween = 1500,
  prefix = "prefix",
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const word = words[currentWordIndex];

    const getTypingSpeed = () => {
      if (isDeleting && currentText.length === 0) return 1000;
      if (isDeleting) return eraseSpeed;
      if (isPaused) return pauseBetween;
      return writeSpeed;
    };

    const timer = setTimeout(() => {
      if (!isDeleting && currentText.length < word.length) {
        setCurrentText(word.slice(0, currentText.length + 1));
      } else if (
        !isDeleting &&
        currentText.length === word.length &&
        !isPaused
      ) {
        setIsPaused(true);
        setTimeout(() => {
          setIsPaused(false);
          setIsDeleting(true);
        }, pauseBetween);
      } else if (isDeleting && currentText.length > 0) {
        setCurrentText(word.slice(0, currentText.length - 1));
      } else if (isDeleting && currentText.length === 0) {
        setIsDeleting(false);
        setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
      }
    }, getTypingSpeed());

    return () => clearTimeout(timer);
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
    <p className="inline-block">
      {prefix}
      {currentText}
      <span className="animate-blink -ml-1">│</span>
    </p>
  );
};

export default TypeWriter;
