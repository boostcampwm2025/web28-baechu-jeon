interface AiAnalysisResult {
  projectId: string;
  overview: {
    projectType: string;
    framework: string[];
    language: string[];
    projectSize: string;
  };
  architecture: {
    pattern: string;
    layers: string[];
    description: string;
  };
  components: {
    name: string;
    responsibility: string;
    location: string;
  }[];
  techStack: {
    frameworks: string[];
    libraries: string[];
    tools: string[];
  };
}

interface AiAnalysisViewProps {
  data: AiAnalysisResult;
}

export default function AiAnalysisView({ data }: AiAnalysisViewProps) {
  return (
    <div className="space-y-6">
      {/* 프로젝트 개요 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500 mb-1">프로젝트 타입</p>
          <p className="text-lg font-semibold text-gray-900">
            {data.overview.projectType}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500 mb-1">프레임워크</p>
          <p className="text-lg font-semibold text-gray-900">
            {data.overview.framework.join(', ')}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500 mb-1">언어</p>
          <p className="text-lg font-semibold text-gray-900">
            {data.overview.language.join(', ')}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500 mb-1">프로젝트 규모</p>
          <p className="text-lg font-semibold text-gray-900">
            {data.overview.projectSize}
          </p>
        </div>
      </div>

      {/* 아키텍처 패턴 */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">아키텍처 패턴</h2>
        </div>
        <div className="mb-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {data.architecture.pattern}
          </span>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">계층 구조:</p>
          <div className="flex flex-wrap gap-2">
            {data.architecture.layers.map((layer, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm"
              >
                {layer}
              </span>
            ))}
          </div>
        </div>
        <p className="text-gray-700 leading-relaxed">
          {data.architecture.description}
        </p>
      </section>

      {/* 주요 컴포넌트 */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">주요 컴포넌트</h2>
        <div className="space-y-4">
          {data.components.map((component, index) => (
            <div
              key={index}
              className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r"
            >
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-gray-900">{component.name}</h3>
                <span className="text-xs text-gray-500 font-mono">
                  {component.location}
                </span>
              </div>
              <p className="text-gray-700 text-sm">{component.responsibility}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 기술 스택 */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">기술 스택</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">프레임워크</p>
            <div className="flex flex-wrap gap-2">
              {data.techStack.frameworks.map((framework, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {framework}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">라이브러리</p>
            <div className="flex flex-wrap gap-2">
              {data.techStack.libraries.map((library, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                >
                  {library}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">도구</p>
            <div className="flex flex-wrap gap-2">
              {data.techStack.tools.map((tool, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
