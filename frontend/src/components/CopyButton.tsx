'use client';

import { Copy } from "lucide-react";
import { useState } from "react";

interface CopyButtonProps {
  value: string;
  size?: "sm" | "md" | "lg";
}

export default function CopyButton({ value, size = "md" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  return (
    <button
      onClick={handleCopy}
      className={`${sizeClasses[size]} bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors duration-200 shadow-lg hover:shadow-xl ${
        copied ? 'bg-green-600 hover:bg-green-700' : ''
      }`}
      title={copied ? "Copied!" : "Copy"}
    >
      <Copy className={iconSizes[size]} />
    </button>
  );
}
