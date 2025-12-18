import { ProjectInfo } from '@/types/analysis';

interface PreprocessInfoProps {
  data: ProjectInfo;
}

export default function PreprocessInfo({ data }: PreprocessInfoProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">전처리 정보</h2>

      <div className="space-y-3">
        <div className="flex items-start">
          <span className="text-sm font-medium text-gray-600 w-32">프로젝트명:</span>
          <span className="text-sm text-gray-900 font-medium">{data.name}</span>
        </div>

        <div className="flex items-start">
          <span className="text-sm font-medium text-gray-600 w-32">감지된 프레임워크:</span>
          <div className="flex flex-wrap gap-2">
            {data.detectedFramework.length > 0 ? (
              data.detectedFramework.map((framework, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                >
                  {framework}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-500">없음</span>
            )}
          </div>
        </div>

        <div className="flex items-start">
          <span className="text-sm font-medium text-gray-600 w-32">파일 수:</span>
          <span className="text-sm text-gray-900">{data.fileCount.toLocaleString()}개</span>
        </div>

        <div className="flex items-start">
          <span className="text-sm font-medium text-gray-600 w-32">폴더 수:</span>
          <span className="text-sm text-gray-900">{data.folderCount.toLocaleString()}개</span>
        </div>
      </div>
    </div>
  );
}
