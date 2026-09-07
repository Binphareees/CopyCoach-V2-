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

  // Bigger size metrics for app icon — more noticeable
  const iconSizes = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-18 h-18",
    xl: "w-24 h-24",
  };

  // Proportional sizing for full logo
  const logoWidths = {
    sm: 140,
    md: 200,
    lg: 260,
    xl: 340,
  };

  const logoHeights = {
    sm: 84,
    md: 120,
    lg: 156,
    xl: 204,
  };

  // App icon variant — transparent brain+pencil icon, no background
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

  // Standard full logo — theme-aware
  // Both SVGs have transparent backgrounds with the brain+pencil icon
  // Dark mode: white text, blue AI
  // Light mode: dark text, blue AI
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
