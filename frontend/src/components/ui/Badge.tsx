import React from "react";
import clsx from "clsx";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "primary" | "success" | "warning" | "danger" | "info" | "neutral";
  className?: string;
};

export default function Badge({
  children,
  variant = "neutral",
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        {
          "border-accent/30 bg-accent/10 text-accent":
            variant === "primary",
          "border-success/30 bg-success-surface text-success":
            variant === "success",
          "border-warning/30 bg-warning-surface text-warning":
            variant === "warning",
          "border-danger/30 bg-danger-surface text-danger":
            variant === "danger",
          "border-info/30 bg-info-surface text-info":
            variant === "info",
          "border-border bg-surface text-text-secondary":
            variant === "neutral",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
