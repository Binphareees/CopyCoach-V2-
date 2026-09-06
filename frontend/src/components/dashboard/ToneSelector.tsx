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
    <div className="flex flex-wrap gap-2.5">
      {TONE_OPTIONS.map((tone) => {
        const isActive = value === tone.value;
        return (
          <button
            key={tone.value}
            type="button"
            onClick={() => onChange(tone.value)}
            aria-pressed={isActive}
            className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-[13px] font-semibold transition-all duration-200 active:scale-[0.97] ${
              isActive
                ? "border-transparent bg-accent text-white shadow-accent-soft"
                : "border-line-soft bg-ink-800 text-brand-200 hover:border-line hover:bg-ink-700 hover:text-white"
            }`}
          >
            {isActive && <Check className="h-3.5 w-3.5" />}
            {tone.label}
          </button>
        );
      })}
    </div>
  );
}