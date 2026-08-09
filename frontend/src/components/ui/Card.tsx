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
        "rounded-3xl border border-white/10 bg-[#151A2D] p-6 shadow-lg transition-all duration-300 hover:border-[#5B5CEB]/50 hover:shadow-xl",
        className
      )}
    >
      {children}
    </div>
  );
}