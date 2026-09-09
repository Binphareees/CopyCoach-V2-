import React from "react";
import clsx from "clsx";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({
  children,
  className,
}: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-border bg-surface p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
