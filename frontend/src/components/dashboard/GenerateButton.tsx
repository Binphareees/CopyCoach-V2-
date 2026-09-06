"use client";

import React from "react";
import { Sparkles, RefreshCw } from "lucide-react";

interface GenerateButtonProps {
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}

export default function GenerateButton({ loading, disabled, onClick }: GenerateButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      className="group relative flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-accent-deep via-accent to-accent-bright px-8 py-4 text-[15px] font-bold tracking-tight text-white shadow-accent-glow transition-all duration-200 hover:-translate-y-0.5 hover:from-accent hover:to-[#7C7CF7] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:w-auto sm:min-w-[320px]"
    >
      {loading ? (
        <>
          <RefreshCw className="h-5 w-5 animate-spin" />
          Generating your marketing copy...
        </>
      ) : (
        <>
          <Sparkles className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
          Generate AI Marketing Copy
        </>
      )}
    </button>
  );
}