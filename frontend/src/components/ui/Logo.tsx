"use client";

import React from "react";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  theme?: "dark" | "light" | "auto";
  showTagline?: boolean;
  variant?: "standard" | "app-icon";
}

const WORDMARK_ASPECT = 245 / 64;

export default function Logo({
  className = "",
  iconOnly = false,
  size = "md",
  theme = "auto",
  variant = "standard",
}: LogoProps) {
  const dark = theme !== "light";

  // App icon variant — SVG mark, transparent background
  if (variant === "app-icon" || iconOnly) {
    const iconSizes = {
      sm: "w-10 h-10",
      md: "w-14 h-14",
      lg: "w-18 h-18",
      xl: "w-24 h-24",
    };
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]} ${className}`}>
        <img
          src={dark ? "/branding/logo-mark.svg" : "/branding/logo-mark-light.svg"}
          alt="CopyCoach AI"
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  // Standard full logo — SVG wordmark lockup, keeps intrinsic aspect ratio
  const logoWidths = {
    sm: 148,
    md: 200,
    lg: 260,
    xl: 340,
  };
  const w = logoWidths[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div className="relative flex items-center justify-center shrink-0">
        <img
          src={dark ? "/branding/logo.svg" : "/branding/logo-light.svg"}
          alt="CopyCoach AI - Elevate Your Copywriting with AI"
          width={w}
          height={Math.round(w / WORDMARK_ASPECT)}
          className="object-contain transition-transform duration-200 hover:scale-105"
        />
      </div>
    </div>
  );
}
