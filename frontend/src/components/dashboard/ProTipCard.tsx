import React from "react";
import { Lightbulb } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ProTipCardProps {
  text?: string;
}

export default function ProTipCard(props: ProTipCardProps) {
  const { t } = useTranslation("dashboard");
  const tip = props.text ?? t("defaultTip");
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-border bg-surface px-4 py-3">
      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent-bright" />
      <div>
        <p className="text-xs font-bold text-text-secondary">{t("proTip")}</p>
        <p className="mt-0.5 text-[13px] leading-relaxed text-text-secondary">{tip}</p>
      </div>
    </div>
  );
}