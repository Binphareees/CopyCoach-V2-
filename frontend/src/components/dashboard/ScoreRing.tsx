"use client";

import React from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

interface ScoreRingProps {
  score: number;
  label?: string;
  className?: string;
}

export default function ScoreRing({
  score,
  label = "Conversion Ready",
  className,
}: ScoreRingProps) {
  const { t } = useTranslation("dashboard");
  const clamped = Math.max(0, Math.min(100, Math.round(score)));

  return (
    <div className={clsx("flex flex-col items-end gap-1.5", className)}>
      <div
        className="score-ring"
        style={{ "--score": `${clamped}%` } as React.CSSProperties}
        role="img"
        aria-label={t("optimizationScoreAria", { score: clamped })}
      >
        <div className="z-10 flex flex-col items-center leading-none">
          <span className="score-ring-value text-text-primary">{clamped}</span>
          <span className="score-ring-unit">/ 100</span>
        </div>
      </div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
        {label === "Conversion Ready" ? t("conversionReady") : label}
      </p>
    </div>
  );
}