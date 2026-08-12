"use client";

import React from "react";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  theme?: "dark" | "light" | "auto";
}

export default function Logo({
  className = "",
  iconOnly = false,
  size = "md",
  theme = "auto",
}: LogoProps) {
  // Size calculations
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
    xl: "w-14 h-14",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  const isDarkTarget = theme === "dark";
  const isLightTarget = theme === "light";

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Icon Mark SVG */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            {/* Gradient 1: Core Brand Gradient */}
            <linearGradient id="logoGradPrimary" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#06B6D4" /> {/* Cyan 500 */}
              <stop offset="50%" stopColor="#3B82F6" /> {/* Blue 500 */}
              <stop offset="100%" stopColor="#6366F1" /> {/* Indigo 500 */}
            </linearGradient>

            {/* Gradient 2: Sparkle Accent */}
            <linearGradient id="logoGradSpark" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" /> {/* Sky 400 */}
              <stop offset="100%" stopColor="#A855F7" /> {/* Purple 500 */}
            </linearGradient>

            {/* Subtle glow filter */}
            <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Hexagonal Outer Shield / Canvas */}
          <rect
            x="8"
            y="8"
            width="84"
            height="84"
            rx="24"
            fill="url(#logoGradPrimary)"
            className="transition-all duration-300"
          />

          {/* Inner Geometric Shield Shadow Overlay */}
          <rect
            x="12"
            y="12"
            width="76"
            height="76"
            rx="20"
            fill="#0F172A"
            fillOpacity="0.2"
          />

          {/* Stylized Double 'C' & AI Feather / Quill Spark */}
          {/* Main Outer C Curve */}
          <path
            d="M 68 32 C 60 22 40 22 30 34 C 20 46 20 62 30 72 C 40 82 60 82 68 70"
            stroke="white"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Inner Glowing AI Arrow / Spark / Quill */}
          <path
            d="M 52 32 L 68 48 L 52 64 L 56 48 Z"
            fill="url(#logoGradSpark)"
            filter="url(#logoGlow)"
          />

          {/* AI Spark Star Dots */}
          <circle cx="72" cy="26" r="4.5" fill="#38BDF8" />
          <circle cx="78" cy="48" r="3" fill="#A855F7" />
        </svg>
      </div>

      {/* Brand Text Header */}
      {!iconOnly && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight transition-colors duration-200 ${textSizes[size]} ${
                isDarkTarget
                  ? "text-white"
                  : isLightTarget
                  ? "text-slate-900"
                  : "text-slate-900 dark:text-white"
              }`}
            >
              Copy<span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent">Coach</span>
            </span>

            {/* AI Pill Badge */}
            <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest rounded-md bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 border border-cyan-500/30 text-cyan-500 dark:text-cyan-400">
              AI
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
