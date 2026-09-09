"use client";

import React from "react";
import clsx from "clsx";

type StatTone = "accent" | "info" | "success" | "warning" | "danger" | "neutral";

interface DashboardStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  footer?: React.ReactNode;
  tone?: StatTone;
  className?: string;
  onClick?: () => void;
}

const toneTile: Record<StatTone, string> = {
  accent: "bg-accent/12 text-accent-bright ring-1 ring-inset ring-accent/25",
  info: "bg-info/12 text-info ring-1 ring-inset ring-info/25",
  success: "bg-success/12 text-success ring-1 ring-inset ring-success/25",
  warning: "bg-warning/12 text-warning ring-1 ring-inset ring-warning/25",
  danger: "bg-danger/12 text-danger ring-1 ring-inset ring-danger/25",
  neutral: "bg-glass-bg-elevated text-text-secondary ring-1 ring-inset ring-glass-border",
};

export default function DashboardStatCard({
  icon,
  label,
  value,
  hint,
  footer,
  tone = "neutral",
  className,
  onClick,
}: DashboardStatCardProps) {
  return (
    <div className={clsx("glass-stat", onClick && "cursor-pointer", className)} onClick={onClick}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-300">{label}</span>
        <span className={clsx("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", toneTile[tone])}>
          {icon}
        </span>
      </div>
      <div className="my-3">{value}</div>
      {hint && <p className="text-xs text-brand-300">{hint}</p>}
      {footer}
    </div>
  );
}