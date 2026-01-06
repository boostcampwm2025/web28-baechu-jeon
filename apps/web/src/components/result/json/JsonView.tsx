"use client";

import JsonEditor from "@uiw/react-json-view";
import { useState } from "react";

export default function JsonView() {
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

  return (
    <div>
      <JsonEditor
        value={jsonData}
        style={{
          padding: "1rem",
          borderRadius: "8px",
          fontSize: "14px",
        }}
      />
    </div>
  );
}
