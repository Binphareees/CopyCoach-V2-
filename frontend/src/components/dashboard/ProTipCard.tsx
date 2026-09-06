import React from "react";
import { Lightbulb } from "lucide-react";

interface ProTipCardProps {
  text?: string;
}

const DEFAULT_TIP =
  "Fill in your product details above, pick a category and tone of voice, then tap Generate to create high-converting marketing copy.";

export default function ProTipCard({ text = DEFAULT_TIP }: ProTipCardProps) {
  return (
    <div className="flex items-start gap-3.5 rounded-2xl border border-line-soft bg-ink-900 p-4.5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent-bright">
        <Lightbulb className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[14px] font-bold text-white">
          Pro Tip
        </p>
        <p className="mt-0.5 text-[13px] leading-relaxed text-brand-200">{text}</p>
      </div>
    </div>
  );
}