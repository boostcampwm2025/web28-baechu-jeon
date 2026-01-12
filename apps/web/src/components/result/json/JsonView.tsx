"use client";

import { useState, useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";

const INITIAL_JSON = {
  layers: [
    {
      name: "presentation",
      description: "UI 컴포넌트 레이어",
      files: ["src/components/Header.tsx", "src/components/Footer.tsx"],
      dependencies: ["business"],
    },
    {
      name: "business",
      description: "비즈니스 로직 레이어",
      files: ["src/services/AnalysisService.ts"],
      dependencies: ["data"],
    },
    {
      name: "data",
      description: "데이터 접근 레이어",
      files: ["src/repositories/AnalysisRepository.ts"],
      dependencies: [],
    },
  ],
};

export default function JsonViewComponent() {
  const [jsonData, setJsonData] = useState(INITIAL_JSON);

  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false); // 복사 상태

  const value = JSON.stringify(jsonData, null, 2);

  const onChange = useCallback(
    (val: string) => {
      if (!isEditing) return;
      try {
        const parsed = JSON.parse(val);
        setJsonData(parsed);
        console.log("JSON updated:", parsed);
      } catch (err) {
        console.log("Invalid JSON:", err);
      }
    },
    [isEditing],
  );

  const toggleEdit = () => setIsEditing((prev) => !prev);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value); // JSON 전체 복사
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // 2초 후 툴팁 사라짐
    } catch (err) {
      console.error("복사 실패:", err);
    }
  };

  const handleReset = () => {
    setJsonData({ layers: [] });
    console.log("JSON reset to initial state");
  };

  return (
    <div className="flex h-screen flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between bg-gray-800 p-3 pr-4 text-white">
        <div className="flex items-center space-x-2">
          <h1 className="text-lg font-bold">JSON Editor</h1>
          {!isEditing && (
            <span className="rounded bg-gray-700 px-2 py-0.5 text-sm">
              read-only
            </span>
          )}
        </div>

        <div className="flex items-end space-x-2">
          <button
            className="cursor-pointer rounded bg-blue-500 px-3 py-1 hover:bg-blue-600"
            onClick={handleCopy}
          >
            복사
          </button>
          {copied && (
            <span className="text-xs text-green-400">복사되었습니다!</span>
          )}

          <button
            className="cursor-pointer rounded bg-yellow-500 px-3 py-1 hover:bg-yellow-600"
            onClick={handleReset}
          >
            초기화
          </button>

          <button
            className="cursor-pointer rounded bg-gray-500 px-3 py-1 hover:bg-gray-600"
            onClick={toggleEdit}
          >
            {isEditing ? "완료" : "수정"}
          </button>
        </div>
      </div>

      {/* 에디터 */}
      <div className="flex-1">
        <CodeMirror
          value={value}
          height="100vh"
          extensions={[json()]}
          onChange={onChange}
          theme="dark"
          editable={isEditing}
        />
      </div>
    </div>
  );
}
