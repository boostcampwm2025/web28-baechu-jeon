import Uploader from "@/components/upload/Uploader";

export default function Home() {
  return (
    <main className="bg-page">
      <section className="mx-auto max-w-6xl px-6 py-8">
        {/* 상단 제목 */}
        <div className="mb-8 text-center">
          <h2 className="text-heading mb-3 text-3xl leading-tight font-black md:text-4xl">
            프로젝트 구조를{" "}
            <span className="from-accent-dim to-primary bg-linear-to-r bg-clip-text text-transparent">
              한눈에 파악하세요
            </span>
          </h2>
          <p className="text-muted text-lg font-medium">
            복잡한 구조를 시각화하여 더 빠르고 정확하게 이해합니다.
          </p>
        </div>

        {/* 좌우 배치: 업로더 + 가이드 */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 왼쪽: 업로더 */}
          <div className="border-line bg-surface flex h-[420px] flex-col rounded-2xl border p-6">
            <Uploader />
          </div>
          {/* 오른쪽: 서비스 이용 가이드 */}
          <div className="border-line bg-surface flex flex-col rounded-2xl border p-6">
            <h3 className="text-heading mb-6 text-lg font-bold">이용 가이드</h3>

            <div className="flex flex-1 flex-col justify-around py-2">
              <StepCard
                step={1}
                title="프로젝트 업로드"
                desc="ZIP 파일이나 GitHub 주소를 입력하세요."
                iconPath="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
              <StepCard
                step={2}
                title="AI 자동 분석"
                desc="폴더 구조와 의존성을 분석하여 다이어그램을 생성합니다."
                iconPath="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
              <StepCard
                step={3}
                title="결과 확인 및 공유"
                desc="구조도를 이미지로 저장하거나 링크로 공유하세요."
                iconPath="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function StepCard({
  step,
  title,
  desc,
  iconPath,
}: {
  step: number;
  title: string;
  desc: string;
  iconPath: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="bg-accent/10 text-accent flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={iconPath}
          />
        </svg>
      </div>
      <div>
        <h4 className="text-heading mb-1 text-sm font-bold">
          <span className="text-accent mr-2">{step}.</span>
          {title}
        </h4>
        <p className="text-muted text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
