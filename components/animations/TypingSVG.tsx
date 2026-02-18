"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function TypingSVG() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // テーマに応じた色を設定
  // ライトモード: #00B3E6 (hsl(200 100% 45%))
  // ダークモード: #00CCFF (hsl(200 100% 60%))
  const typingColor = mounted && resolvedTheme === "dark" ? "00CCFF" : "00B3E6";

  return (
    <div className="mt-6 flex justify-center">
      <a 
        href="https://github.com/32Lwk" 
        target="_blank" 
        rel="noopener noreferrer"
        className="group relative inline-block transition-transform hover:scale-105"
      >
        <img 
          src={`https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=24&pause=1000&color=${typingColor}&center=true&vCenter=true&width=600&lines=Physics+Student+at+Nagoya+Univ.;Aspiring+AI+%C3%97+Physics+Developer;Simulating+the+Universe+with+Code.;Every+thing+as+Code.`}
          alt="GitHubプロフィールの紹介文（Physics Student at Nagoya Univ. / Aspiring AI × Physics Developer）" 
          className="max-w-full h-auto drop-shadow-lg transition-opacity group-hover:opacity-90"
        />
      </a>
    </div>
  );
}
