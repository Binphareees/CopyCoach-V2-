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

  const titleSizes = {
    sm: "text-base sm:text-lg",
    md: "text-xl sm:text-2xl",
    lg: "text-2xl sm:text-3xl",
    xl: "text-3xl sm:text-4xl",
  };

  const taglineSizes = {
    sm: "text-[9px] sm:text-[10px]",
    md: "text-[11px] sm:text-[12px]",
    lg: "text-[13px] sm:text-[14px]",
    xl: "text-[15px] sm:text-[16px]",
  };

  const isDarkTarget = theme === "dark";
  const isLightTarget = theme === "light";

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* BRAND ICON (Neural Brain + Coach Pencil) */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md transition-transform duration-200 hover:scale-105"
        >
          <defs>
            {/* AI Brain Network Gradient */}
            <linearGradient id="brainGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f5d4" />
              <stop offset="50%" stopColor="#00b4d8" />
              <stop offset="100%" stopColor="#7209b7" />
            </linearGradient>

            {/* Pencil/Coach Gradient */}
            <linearGradient id="pencilGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00b4d8" />
              <stop offset="100%" stopColor="#3a0ca3" />
            </linearGradient>

            <filter id="glowPulse" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* App Icon Container Background (If variant="app-icon") */}
          {variant === "app-icon" && (
            <rect x="6" y="6" width="188" height="188" rx="48" fill="#0f172a" stroke="#1E293B" strokeWidth="3" />
          )}

          {/* AI Brain Nodes Background */}
          <g stroke="url(#brainGlow)" strokeWidth="3" opacity="0.85">
            <line x1="50" y1="80" x2="80" y2="50" />
            <line x1="80" y1="50" x2="120" y2="60" />
            <line x1="50" y1="80" x2="65" y2="110" />
            <line x1="65" y1="110" x2="100" y2="120" />
            <line x1="80" y1="50" x2="100" y2="90" />

            <circle cx="50" cy="80" r="5" fill="#00f5d4" />
            <circle cx="80" cy="50" r="6" fill="#00b4d8" />
            <circle cx="120" cy="60" r="5" fill="#7209b7" />
            <circle cx="65" cy="110" r="5" fill="#00f5d4" />
            <circle cx="100" cy="120" r="6" fill="#00b4d8" />
            <circle cx="100" cy="90" r="4" fill="#ffffff" />
          </g>

          {/* Stylized Pencil & Coach Figure */}
          <g transform="rotate(-35 100 100)">
            {/* Pencil Body */}
            <rect x="85" y="30" width="30" height="110" rx="6" fill="url(#pencilGrad)" stroke="#ffffff" strokeWidth="4" />

            {/* Eraser Cap */}
            <path d="M 85 45 L 115 45 L 115 36 C 115 32 111 28 107 28 L 93 28 C 89 28 85 32 85 36 Z" fill="#7209b7" />
            <line x1="85" y1="45" x2="115" y2="45" stroke="#ffffff" strokeWidth="2" />

            {/* Pencil Tip */}
            <path d="M 85 140 L 100 170 L 115 140 Z" fill="#00b4d8" />
            <polygon points="95,160 100,170 105,160" fill="#0f172a" />

            {/* Coach Silhouette Detail inside Pencil */}
            <circle cx="100" cy="75" r="5" fill="#ffffff" />
            <path d="M 92 95 C 92 85 108 85 108 95 L 108 115 L 92 115 Z" fill="#ffffff" />
            {/* Pointer arm */}
            <line x1="104" y1="90" x2="114" y2="82" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
          </g>

          {/* Glowing Focal Point at Tip */}
          <circle cx="50" cy="155" r="7" fill="#00f5d4" />
          <circle cx="50" cy="155" r="14" fill="#00f5d4" opacity="0.3" />
        </svg>
      </div>

      {/* BRAND TYPOGRAPHY & TAGLINE */}
      {!iconOnly && (
        <div className="flex flex-col justify-center">
          {/* Main Header: CopyCoach AI */}
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`font-black tracking-tight transition-colors duration-200 ${titleSizes[size]} ${
                isDarkTarget
                  ? "text-white"
                  : isLightTarget
                  ? "text-slate-900"
                  : "text-slate-900 dark:text-white"
              }`}
            >
              CopyCoach
            </span>
            <span className={`font-black tracking-tight bg-gradient-to-r from-teal-400 via-cyan-400 to-violet-500 bg-clip-text text-transparent ${titleSizes[size]}`}>
              AI
            </span>
          </div>

          {/* Subtitle / Tagline: Elevate Your Copywriting with AI */}
          {showTagline && (
            <p
              className={`font-semibold tracking-wide mt-1 transition-colors duration-200 ${taglineSizes[size]} ${
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
      )}
    </div>
  );
}
