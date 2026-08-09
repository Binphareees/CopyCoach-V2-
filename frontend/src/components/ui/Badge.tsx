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
          "bg-[#5B5CEB]/20 text-[#A8A9FF]": variant === "primary",
          "bg-[#7CFFB2]/20 text-[#7CFFB2]": variant === "success",
          "bg-yellow-500/20 text-yellow-300": variant === "warning",
        },
        className
      )}
    >
      {children}
    </span>
  );
}