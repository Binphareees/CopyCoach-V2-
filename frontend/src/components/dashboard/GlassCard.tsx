"use client";

import React from "react";
import clsx from "clsx";

type GlassLevel = "panel" | "elevated" | "deep";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  level?: GlassLevel;
}

const levelClass: Record<GlassLevel, string> = {
  panel: "glass-panel",
  elevated: "glass-panel-elevated",
  deep: "glass-panel-deep",
};

export default function GlassCard({ children, className, level = "panel" }: GlassCardProps) {
  return <div className={clsx(levelClass[level], className)}>{children}</div>;
}