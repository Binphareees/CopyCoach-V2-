"use client";

import React from "react";
import { useTheme } from "@/components/providers/ThemeProvider";

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
  const { isDarkMode } = useTheme();

  const isDarkTarget = theme === "dark" || (theme === "auto" && isDarkMode);

  // Size metrics for app icon
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-11 h-11",
    lg: "w-14 h-14",
    xl: "w-20 h-20",
  };

  // Proportional sizing for full logo
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

  // App icon variant - symbol SVG
  if (variant === "app-icon" || iconOnly) {
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]} ${className}`}>
        <img
          src="/logo-symbol.svg"
          alt="CopyCoach AI"
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  // Standard full logo - theme-aware SVG
  const logoSrc = isDarkTarget ? "/logo-primary-dark.svg" : "/logo-primary-light.svg";

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div className="relative flex items-center justify-center shrink-0">
        <img
          src={logoSrc}
          alt="CopyCoach AI - Elevate Your Copywriting with AI"
          width={logoWidths[size]}
          height={logoHeights[size]}
          className="object-contain transition-transform duration-200 hover:scale-105"
        />
      </div>
    </div>
  );
}
