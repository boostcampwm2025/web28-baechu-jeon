"use client";

import React, { useState, useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";

export default function JsonViewComponent() {
  // JSON object 상태
  const [jsonData, setJsonData] = useState({
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
  });

  // CodeMirror는 string만 받으므로 stringify
  const value = JSON.stringify(jsonData, null, 2); // 2칸 들여쓰기

  const onChange = useCallback((val: string) => {
    try {
      // 변경 내용을 다시 object로 파싱
      const parsed = JSON.parse(val);
      setJsonData(parsed);
      console.log("JSON updated:", parsed);
    } catch (err) {
      console.log("Invalid JSON:", err);
      // 유효하지 않은 JSON은 상태에 적용하지 않음
    }
  }, []);

  return (
    <div>
      <h1>JSON Editor</h1>
      <CodeMirror
        value={value}
        // height="400px"
        extensions={[json()]}
        onChange={onChange}
        theme="light"
      />
    </div>
  );
}
