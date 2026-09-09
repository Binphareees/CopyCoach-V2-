"use client";

import React from "react";
import { Check } from "lucide-react";

export interface ToneOption {
  value: string;
  label: string;
}

export const TONE_OPTIONS: ToneOption[] = [
  { value: "Persuasive", label: "Persuasive & High-Converting" },
  { value: "Urgent", label: "Urgent & FOMO" },
  { value: "Professional", label: "Professional & Authoritative" },
  { value: "Witty", label: "Playful & Witty" },
  { value: "Empathetic", label: "Empathetic & Story-Driven" },
  { value: "Bold & Punchy", label: "Bold & Unapologetic" },
];

interface ToneSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ToneSelector({ value, onChange }: ToneSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {TONE_OPTIONS.map((tone) => {
        const isActive = value === tone.value;
        return (
          <button
            key={tone.value}
            type="button"
            onClick={() => onChange(tone.value)}
            aria-pressed={isActive}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-left text-xs font-semibold leading-snug transition-colors ${
              isActive
                ? "border-transparent bg-accent text-accent-foreground"
                : "border-border bg-surface text-text-muted hover:bg-surface-muted hover:text-text-primary"
            }`}
          >
            {isActive && <Check className="h-3.5 w-3.5 shrink-0" />}
            <span className="truncate">{tone.label}</span>
          </button>
        );
      })}
    </div>
  );
}