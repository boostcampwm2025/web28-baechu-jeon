export default function Home() {
  return (
    <main className="overflow-y-auto bg-sky-50">
      <section className="mx-auto max-w-5xl px-6 pt-24 pb-20 text-center">
        <h2 className="mb-6 text-5xl leading-tight font-black text-slate-900 md:text-6xl">
          프로젝트 구조를
          <br />
          <span className="bg-linear-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
            한눈에 파악하세요
          </span>
        </h2>

        <p className="mx-auto max-w-2xl text-lg leading-relaxed font-medium text-slate-500 md:text-xl">
          복잡한 구조를 시각화하여 더 빠르고 정확하게 이해합니다.
        </p>
      </section>

      {/* TODO: 업로드 영역 */}

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-sky-100 bg-white p-12 shadow-sm md:p-16">
          <div className="absolute top-0 left-0 h-2 w-full bg-linear-to-r from-sky-500/30 via-sky-500 to-sky-500/30"></div>

          <div className="mb-12 text-center">
            <h3 className="mb-4 text-3xl font-bold">서비스 이용 가이드</h3>
            <p className="text-lg text-slate-500">
              누구나 쉽게 프로젝트 구조를 시각화할 수 있습니다.
            </p>
          </div>

          <div className="relative grid gap-8 md:grid-cols-3">
            <StepCard
              step="1"
              title="프로젝트 업로드"
              desc="분석하고 싶은 프로젝트의 ZIP 파일이나 GitHub 주소를 입력하여 시작하세요."
              iconPath="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />

            <ArrowIcon className="absolute top-8 left-[30%]" />

            <StepCard
              step="2"
              title="AI 자동 분석"
              desc="AI 엔진이 폴더 구조와 의존성을 분석하여 최적의 다이어그램을 생성합니다."
              iconPath="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />

            <ArrowIcon className="absolute top-8 right-[30%]" />

            <StepCard
              step="3"
              title="결과 확인 및 저장"
              desc="완성된 구조도를 이미지로 저장하거나 링크로 팀원들과 공유해보세요."
              iconPath="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function StepCard({
  title,
  desc,
  iconPath,
}: {
  step: string;
  title: string;
  desc: string;
  iconPath: string;
}) {
  return (
    <div className="group flex flex-col items-center text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-500 shadow-sm transition-transform group-hover:scale-110">
        <svg
          className="h-8 w-8"
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
      <h4 className="mb-3 text-lg font-bold text-slate-800">{title}</h4>
      <p className="px-4 text-sm leading-relaxed text-slate-500">{desc}</p>
    </div>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <div className={`hidden text-sky-200 md:block ${className}`}>
      <svg
        className="h-10 w-10"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 7l5 5m0 0l-5 5m5-5H6"
        />
      </svg>
    </div>
  );
}
