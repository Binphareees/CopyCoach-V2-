"use client";

import React from "react";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { DashboardKey } from "@/i18n/keys";

export interface ToneOption {
  value: string;
  label: string;
  labelKey: DashboardKey;
}

export const TONE_OPTIONS: ToneOption[] = [
  { value: "Persuasive", label: "Persuasive & High-Converting", labelKey: "tonePersuasive" },
  { value: "Urgent", label: "Urgent & FOMO", labelKey: "toneUrgent" },
  { value: "Professional", label: "Professional & Authoritative", labelKey: "toneProfessional" },
  { value: "Witty", label: "Playful & Witty", labelKey: "toneWitty" },
  { value: "Empathetic", label: "Empathetic & Story-Driven", labelKey: "toneEmpathetic" },
  { value: "Bold & Punchy", label: "Bold & Unapologetic", labelKey: "toneBold" },
];

interface ToneSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ToneSelector({ value, onChange }: ToneSelectorProps) {
  const { t } = useTranslation("dashboard");

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
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-start text-xs font-semibold leading-snug transition-colors ${
              isActive
                ? "border-transparent bg-accent text-accent-foreground"
                : "border-border bg-surface text-text-muted hover:bg-surface-muted hover:text-text-primary"
            }`}
          >
            {isActive && <Check className="h-3.5 w-3.5 shrink-0" />}
            <span className="truncate">{t(tone.labelKey)}</span>
          </button>
        );
      })}
    </div>
  );
}