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
  // Size metrics for app icon
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-11 h-11",
    lg: "w-14 h-14",
    xl: "w-20 h-20",
  };

  // Proportional sizing for full logo (original aspect ratio ~1.67:1)
  const logoWidths = {
    sm: 120,
    md: 180,
    lg: 240,
    xl: 320,
  };

  const logoHeights = {
    sm: 72,
    md: 108,
    lg: 144,
    xl: 192,
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

  // Standard full logo - tagline is baked into the image
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
    </div>
  );
}
