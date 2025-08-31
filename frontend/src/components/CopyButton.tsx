'use client';

import { Copy } from "lucide-react";

export default function CopyButton({ value }: { value: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-700/50 transition-colors"
      title="Copy"
    >
      <Copy className="w-4 h-4" />
    </button>
  );
}
