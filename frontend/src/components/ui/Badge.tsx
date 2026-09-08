import React from "react";
import clsx from "clsx";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "primary" | "success" | "warning" | "danger" | "info" | "neutral";
  className?: string;
};

export default function Badge({
  children,
  variant = "primary",
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium",
        {
          "border-accent/25 bg-accent-glow/20 text-accent-hover":
            variant === "primary",
          "border-success/25 bg-success-surface text-success":
            variant === "success",
          "border-warning/25 bg-warning-surface text-warning":
            variant === "warning",
          "border-danger/25 bg-danger-surface text-danger":
            variant === "danger",
          "border-info/25 bg-info-surface text-info":
            variant === "info",
          "border-glass-border bg-glass-bg-elevated text-text-secondary":
            variant === "neutral",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
