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
        "glass-panel p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
