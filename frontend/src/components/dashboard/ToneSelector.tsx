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
    <div className="grid grid-cols-2 gap-2.5">
      {TONE_OPTIONS.map((tone) => {
        const isActive = value === tone.value;
        return (
          <button
            key={tone.value}
            type="button"
            onClick={() => onChange(tone.value)}
            aria-pressed={isActive}
            className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-center text-[13px] font-semibold leading-snug transition-all duration-200 active:scale-[0.97] ${
              isActive
                ? "border-transparent bg-accent text-white shadow-accent-soft"
                : "border-glass-border bg-glass-bg-elevated text-brand-200 hover:border-glass-border hover:bg-glass-bg-hover hover:text-white"
            }`}
          >
            {isActive && <Check className="h-3.5 w-3.5 shrink-0" />}
            {tone.label}
          </button>
        );
      })}
    </div>
  );
}