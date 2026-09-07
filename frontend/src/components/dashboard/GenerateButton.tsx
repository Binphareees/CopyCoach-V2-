"use client";

import React from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { GradientButton } from "../ui/gradient-button";

interface GenerateButtonProps {
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}

export default function GenerateButton({ loading, disabled, onClick }: GenerateButtonProps) {
  return (
    <GradientButton
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      className="w-full sm:w-auto sm:min-w-[320px]"
    >
      {loading ? (
        <>
          <RefreshCw className="h-5 w-5 animate-spin" />
          Generating your marketing copy...
        </>
      ) : (
        <>
          <Sparkles className="h-5 w-5" />
          Generate AI Marketing Copy
        </>
      )}
    </GradientButton>
  );
}