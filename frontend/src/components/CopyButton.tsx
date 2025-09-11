'use client';

import { Copy } from "lucide-react";

export default function CopyButton({ value }: { value: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-slate-400 hover:text-slate-100 p-0.5 rounded hover:bg-slate-700/50 transition-colors"
      title="Copy"
    >
      <Copy className="w-3 h-3" />
    </button>
  );
}
