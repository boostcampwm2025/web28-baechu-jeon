"use client";
import JsonView from "@uiw/react-json-view";
import { useState } from "react";

export default function JsonViewComponent() {
  const [jsonData, setJsonData] = useState({
    architecture: {
      layers: {
        presentation: ["components", "pages"],
        application: ["layout", "hooks"],
        domain: ["models", "services"],
        infrastructure: ["api", "database"],
      },
    },
  });

  const [editMode, setEditMode] = useState(false);

  return (
    <div>
      <button
        onClick={() => setEditMode(!editMode)}
        className="mb-4 rounded bg-blue-500 px-4 py-2 text-white"
      >
        {editMode ? "뷰 모드" : "편집 모드"}
      </button>

      {editMode ? (
        <textarea
          value={JSON.stringify(jsonData, null, 2)}
          onChange={(e) => {
            try {
              setJsonData(JSON.parse(e.target.value));
            } catch (err) {
              // JSON 파싱 에러 무시
            }
          }}
          className="h-96 w-full rounded border p-4 font-mono text-sm"
        />
      ) : (
        <JsonView
          value={jsonData}
          style={{
            padding: "1rem",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        />
      )}
    </div>
  );
}
