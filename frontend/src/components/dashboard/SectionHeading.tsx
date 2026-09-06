import React from "react";

interface SectionHeadingProps {
  number: string;
  title: string;
  subtitle?: string;
  className?: string;
}

export default function SectionHeading({
  number,
  title,
  subtitle,
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-sm font-bold text-accent-bright">
        {number}
      </span>
      <div>
        <h2 className="text-[21px] font-bold leading-tight tracking-tight text-brand-100 sm:text-[23px]">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-[13px] leading-relaxed text-brand-200">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}