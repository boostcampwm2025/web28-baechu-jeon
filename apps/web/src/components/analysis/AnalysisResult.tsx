import { AnalysisData } from '@/types/analysis';

interface AnalysisResultProps {
  data: AnalysisData;
}

export default function AnalysisResult({ data }: AnalysisResultProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">분석 결과</h2>

      {/* 1. 아키텍처 정보 */}
      <section className="mb-6">
        <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
          <span className="text-2xl">🏗️</span>
          <span>아키텍처</span>
        </h3>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="mb-2">
            <span className="font-semibold text-gray-700">타입:</span>{' '}
            <span className="text-gray-900">{data.architecture.type}</span>
          </div>
          <div className="mb-3">
            <span className="font-semibold text-gray-700">패턴:</span>{' '}
            <div className="flex flex-wrap gap-2 mt-1">
              {data.architecture.patterns.map((pattern, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-200 text-blue-800 text-sm rounded-full"
                >
                  {pattern}
                </span>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {data.architecture.description}
          </p>
        </div>
      </section>

      {/* 2. 레이어 정보 */}
      <section className="mb-6">
        <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
          <span className="text-2xl">📂</span>
          <span>레이어 분석</span>
        </h3>
        <div className="space-y-4">
          {data.layers.map((layer, idx) => (
            <div
              key={idx}
              className="border-l-4 border-green-500 pl-4 py-3 bg-gray-50 rounded-r-lg"
            >
              <h4 className="font-semibold text-gray-900 mb-1">{layer.name}</h4>
              <p className="text-sm text-gray-600 mb-2">{layer.description}</p>
              <div className="mb-2">
                <span className="text-xs font-medium text-gray-500">경로:</span>
                <p className="text-xs text-gray-600 mt-1">
                  {layer.paths.join(', ')}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">기술 스택:</span>
                <p className="text-xs text-gray-600 mt-1">{layer.technicalDetails}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 시각화 데이터 정보 */}
      {data.visualization && (
        <section className="mb-6">
          <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
            <span className="text-2xl">🔗</span>
            <span>관계 정보</span>
          </h3>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">노드 수:</span> {data.visualization.nodes.length}개
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">연결 수:</span> {data.visualization.edges.length}개
            </p>
          </div>
        </section>
      )}

      {/* 4. AI 프롬프트 (개발용) */}
      {data.prompt && (
        <details className="mt-6">
          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 font-medium">
            AI 프롬프트 보기 (개발용)
          </summary>
          <pre className="mt-2 bg-gray-100 text-gray-800 p-4 rounded text-xs overflow-auto max-h-96 whitespace-pre-wrap">
            {data.prompt}
          </pre>
        </details>
      )}

      {/* 5. 원본 JSON (개발용) */}
      <details className="mt-6">
        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 font-medium">
          원본 JSON 보기 (개발용)
        </summary>
        <pre className="mt-2 bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  );
}
