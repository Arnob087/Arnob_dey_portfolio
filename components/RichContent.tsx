"use client";

import React from "react";

interface RichContentProps {
  html: string;
  className?: string;
}

const RichContent: React.FC<RichContentProps> = ({ html, className = "" }) => {
  if (!html || html.trim() === "" || html === "<p><br></p>") {
    return null;
  }

  return (
    <div
      className={`rich-content ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default RichContent;