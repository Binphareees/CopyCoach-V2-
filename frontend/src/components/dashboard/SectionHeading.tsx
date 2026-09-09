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
      <span className="mt-0.5 text-[11px] font-bold tracking-wide text-accent-bright">
        {number}
      </span>
      <div className="min-w-0">
        <h2 className="text-lg font-bold leading-snug tracking-tight text-text-primary">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-[13px] leading-relaxed text-text-secondary">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}