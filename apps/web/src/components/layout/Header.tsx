import Link from "next/link";
import profile from "@/assets/profile.svg";

export default function Header() {
  return (
    <header className="border-b border-sky-100 bg-white/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-7">
        <Link href="/" className="flex cursor-pointer items-center gap-3">
          <img src="/logo.svg" alt="로고" />
          <h1 className="text-xl font-bold">쇼미더구조</h1>
        </Link>

        <div className="h-10 w-10 cursor-pointer overflow-hidden rounded-full shadow-md transition-transform hover:scale-105 active:scale-95">
          <img
            src={profile.src}
            alt="프로필 이미지"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
