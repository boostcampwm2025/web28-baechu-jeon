"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const MEME_COUNT = 20;
const MEME_PATHS = Array.from(
  { length: MEME_COUNT },
  (_, i) => `/memes/${i + 1}.png`,
);
const SHOW_TIME = 7000;

// Fisher-Yates 셔플
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function MemeSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const shuffledPaths = useRef<string[]>(shuffleArray(MEME_PATHS));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        // 모두 보여줬으면 다시 셔플
        if (next >= MEME_COUNT) {
          shuffledPaths.current = shuffleArray(MEME_PATHS);
          return 0;
        }
        return next;
      });
    }, SHOW_TIME);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-6 flex justify-center">
      <div className="relative h-64 w-64 overflow-hidden rounded-lg">
        <Image
          src={shuffledPaths.current[currentIndex]}
          alt="개발자 밈"
          fill
          className="object-contain"
          sizes="256px"
          priority={currentIndex === 0}
        />
      </div>
    </div>
  );
}
