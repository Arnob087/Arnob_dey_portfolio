"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamically import ReactQuill — MUST disable SSR
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[200px] rounded-2xl bg-slate-50 border border-slate-200 animate-pulse flex items-center justify-center text-slate-400 text-sm">
      Loading editor…
    </div>
  ),
});

// Import Quill styles
import "react-quill-new/dist/quill.snow.css";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
}

const modules = {
  toolbar: [
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ header: [3, 4, false] }],
    ["link"],
    [{ align: [] }],
    ["clean"],
  ],
  clipboard: {
    matchVisual: false,
  },
};

const formats = [
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "header",
  "link",
  "align",
];

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Start writing...",
  height = 200,
}) => {
  return (
    <div className="quill-wrapper" style={{ minHeight: height }}>
      <ReactQuill
        theme="snow"
        value={value || ""}
        onChange={(content: string) => {
          // Quill returns "<p><br></p>" for empty content — normalize to ""
          const cleaned = content === "<p><br></p>" ? "" : content;
          onChange(cleaned);
        }}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor;