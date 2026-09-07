"use client";

import React from "react";
import Image from "next/image";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  theme?: "dark" | "light" | "auto";
  showTagline?: boolean;
  variant?: "standard" | "app-icon";
}

export default function Logo({
  className = "",
  iconOnly = false,
  size = "md",
  theme = "auto",
  showTagline = true,
  variant = "standard",
}: LogoProps) {
  // Size metrics
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-11 h-11",
    lg: "w-14 h-14",
    xl: "w-20 h-20",
  };

  const logoWidths = {
    sm: 80,
    md: 120,
    lg: 160,
    xl: 220,
  };

  const logoHeights = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 88,
  };

  const taglineSizes = {
    sm: "text-[9px] sm:text-[10px]",
    md: "text-[11px] sm:text-[12px]",
    lg: "text-[13px] sm:text-[14px]",
    xl: "text-[15px] sm:text-[16px]",
  };

  const isDarkTarget = theme === "dark";
  const isLightTarget = theme === "light";

  // App icon variant - just the icon part
  if (variant === "app-icon") {
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]} ${className}`}>
        <Image
          src="/images/logo-icon.png"
          alt="CopyCoach AI"
          width={64}
          height={64}
          className="w-full h-full object-contain"
          priority
        />
      </div>
    );
  }

  // Standard full logo
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* BRAND IMAGE LOGO */}
      <div className="relative flex items-center justify-center shrink-0">
        <Image
          src="/images/logo-full.png"
          alt="CopyCoach AI - Elevate Your Copywriting with AI"
          width={logoWidths[size]}
          height={logoHeights[size]}
          className="object-contain transition-transform duration-200 hover:scale-105"
          priority
        />
      </div>

      {/* TAGLINE (shown below logo when enabled) */}
      {!iconOnly && showTagline && (
        <p
          className={`font-semibold tracking-wide transition-colors duration-200 ${taglineSizes[size]} ${
            isDarkTarget
              ? "text-slate-300"
              : isLightTarget
              ? "text-slate-600"
              : "text-slate-600 dark:text-slate-300"
          }`}
        >
          Elevate Your Copywriting with AI
        </p>
      )}
    </div>
  );
}
