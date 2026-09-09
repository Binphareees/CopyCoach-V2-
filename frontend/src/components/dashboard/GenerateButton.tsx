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
      className="w-full"
    >
      {loading ? (
        <>
          <RefreshCw className="h-4 w-4 animate-spin" />
          Improving your copy…
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          Improve your copy
        </>
      )}
    </GradientButton>
  );
}