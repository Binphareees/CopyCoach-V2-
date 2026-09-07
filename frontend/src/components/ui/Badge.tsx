import React from "react";
import clsx from "clsx";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "primary" | "success" | "warning";
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
        "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
        {
          "bg-accent/20 text-accent": variant === "primary",
          "bg-success-surface text-success": variant === "success",
          "bg-warning-surface text-warning": variant === "warning",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
