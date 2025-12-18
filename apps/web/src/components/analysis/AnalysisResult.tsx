import { AnalysisData, BoundaryAnalysis } from '@/types/analysis';

interface AnalysisResultProps {
  data: AnalysisData;
}

export default function AnalysisResult({ data }: AnalysisResultProps) {
  const boundaries = Object.entries(data.boundaries || {});

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 font-mono">
        Architectural Analysis Result
      </h2>

      {boundaries.length === 0 ? (
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 text-orange-800">
          분석된 경계(Boundary)가 없습니다. 프로젝트 구조를 확인해주세요.
        </div>
      ) : (
        <div className="space-y-12">
          {boundaries.map(([name, analysis]: [string, BoundaryAnalysis]) => (
            <section key={name} className="border-t pt-8 first:border-t-0 first:pt-0">
              <h3 className="text-2xl font-bold mb-6 text-gray-900 uppercase tracking-tight flex items-center gap-3">
                <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                {name} Boundary
              </h3>

              {/* Architecture Patterns */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4 tracking-wider">
                  Architecture Patterns
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(analysis.architecturePatterns || []).map((pattern, idx) => (
                    <div key={idx} className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="font-bold text-blue-900 mb-2">{pattern.name}</div>
                      <ul className="text-xs text-blue-800 space-y-1">
                        {(pattern.evidence || []).map((ev, evIdx) => (
                          <li key={evIdx} className="flex items-start gap-1">
                            <span className="mt-1">•</span>
                            <span>{ev}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Layers */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4 tracking-wider">
                  Layer Model
                </h4>
                <div className="space-y-4">
                  {(analysis.layers || []).map((layer, idx) => (
                    <div key={idx} className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                        <span className="font-bold text-gray-900">{layer.name}</span>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded-md text-gray-600">
                          {layer.responsibility}
                        </span>
                      </div>
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                            Mapped Folders ({(layer.folders || []).length})
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(layer.folders || []).length > 0 ? (
                              (layer.folders || []).map((folder, fIdx) => (
                                <code
                                  key={fIdx}
                                  className="text-[11px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded border border-green-100"
                                >
                                  {folder}
                                </code>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400 italic">No folders mapped</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                            Mapped Files ({(layer.files || []).length})
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(layer.files || []).length > 0 ? (
                              (layer.files || []).map((file, fIdx) => (
                                <code
                                  key={fIdx}
                                  className="text-[11px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-100"
                                >
                                  {file}
                                </code>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400 italic">No files mapped</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dependency Flow */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4 tracking-wider">
                  Dependency Flow
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg border text-sm text-gray-700 leading-relaxed font-mono">
                  {analysis.dependencyFlow || 'No dependency flow defined'}
                </div>
              </div>
            </section>
          ))}

          {/* Global Assumptions (from stage 2) */}
          {(data as any).assumptions && (data as any).assumptions.length > 0 && (
            <section className="border-t pt-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Analysis Assumptions
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                {(data as any).assumptions.map((assumption: string, idx: number) => (
                  <li key={idx}>{assumption}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Cross-Boundary Interaction */}
          {(data as any).crossBoundaryInteraction && (
            <section className="border-t pt-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Cross-Boundary Interaction
              </h3>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-gray-700 leading-relaxed">
                {(data as any).crossBoundaryInteraction}
              </div>
            </section>
          )}
        </div>
      )}

      <div className="mt-12 pt-8 border-t space-y-4">
        {data.prompt && (
          <details className="group">
            <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-600 font-medium list-none flex items-center gap-1">
              <span className="group-open:rotate-90 transition-transform">▶</span>
              View AI Prompt (Debug)
            </summary>
            <pre className="mt-4 bg-gray-50 text-gray-600 p-4 rounded-lg text-[10px] overflow-auto max-h-96 whitespace-pre-wrap border">
              {data.prompt}
            </pre>
          </details>
        )}

        <details className="group">
          <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-600 font-medium list-none flex items-center gap-1">
            <span className="group-open:rotate-90 transition-transform">▶</span>
            View Raw Analysis Result (JSON)
          </summary>
          <pre className="mt-4 bg-gray-900 text-gray-300 p-4 rounded-lg text-[10px] overflow-auto max-h-96 border shadow-inner">
            {JSON.stringify(data.rawAiResponse || data.boundaries, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
