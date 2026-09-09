import React from "react";
import { Lightbulb } from "lucide-react";

interface ProTipCardProps {
  text?: string;
}

const DEFAULT_TIP =
  "Fill in your context, choose a copy type and tone, then press Improve your copy for a sharper, higher-converting version.";

export default function ProTipCard({ text = DEFAULT_TIP }: ProTipCardProps) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-border bg-surface px-4 py-3">
      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent-bright" />
      <div>
        <p className="text-xs font-bold text-text-secondary">Pro Tip</p>
        <p className="mt-0.5 text-[13px] leading-relaxed text-text-secondary">{text}</p>
      </div>
    </div>
  );
}