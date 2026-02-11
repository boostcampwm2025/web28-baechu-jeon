import Link from "next/link";
import { IoLogoGithub, IoArrowForward } from "react-icons/io5";

export default function NotFound() {
  return (
    <main className="bg-page relative flex min-h-[calc(100vh-64px)] flex-col items-center justify-center overflow-hidden px-6">
      {/* 중앙 콘텐츠 */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* PAGE NOT FOUND 텍스트 - 상단 */}
        <div
          className="text-[6vw] font-black tracking-tight whitespace-nowrap"
          style={{
            WebkitTextStroke: "1px var(--color-accent)",
            WebkitTextFillColor: "transparent",
          }}
        >
          PAGE NOT FOUND
        </div>

        {/* 404 텍스트 - 중앙 크게 */}
        <div
          className="-my-4 text-[18vw] leading-none font-black"
          style={{
            WebkitTextStroke: "2px var(--color-accent)",
            WebkitTextFillColor: "transparent",
          }}
        >
          404
        </div>

        <Link
          href="/"
          className="text-accent hover:text-accent/80 mt-8 inline-flex items-center gap-2 text-sm font-medium transition-colors"
        >
          메인으로
          <IoArrowForward className="h-4 w-4" />
        </Link>

        <div className="mt-8">
          <a
            href="https://github.com/boostcampwm2025/web28-show-me-the-gujo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-accent inline-flex items-center gap-2 text-xs transition-colors"
          >
            <IoLogoGithub className="h-4 w-4" />
            잠깐 저희 레포 구경하실래요?
          </a>
        </div>
      </div>
    </main>
  );
}
