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
  variant = "standard",
}: LogoProps) {
  const isDark = theme === "dark";
  const textColor = isDark ? "#FFFFFF" : "#2E3339";
  const lightFacetColor = isDark ? "#CBD5E1" : "#3D434A";

  // App icon / Editorial Mark variant only
  if (variant === "app-icon" || iconOnly) {
    const iconSizes = {
      sm: "w-8 h-8",
      md: "w-10 h-10",
      lg: "w-14 h-14",
      xl: "w-20 h-20",
    };

    return (
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]} ${className}`}>
        <svg
          viewBox="0 0 240 180"
          className="w-full h-full object-contain overflow-visible"
          aria-label="CopyCoach AI Mark"
        >
          <g id="editorial-mark">
            <path
              id="c-ring"
              d="M 209.70 48.66 A 45.0 45.0 0 1 0 223.25 111.72 L 205.23 99.11 A 23.0 23.0 0 1 1 198.05 66.71 Z"
              fill="#14B8A6"
            />
            <polygon
              id="cursor-facet-left"
              points="102.0,14.0 15.0,176.0 85.0,80.0 65.0,140.0 80.0,132.5"
              fill={lightFacetColor}
            />
            <polygon
              id="cursor-facet-right"
              points="102.0,14.0 80.0,132.5 95.0,125.0 135.0,55.0 176.0,42.0"
              fill={textColor}
            />
            <path
              id="quote-left"
              d="M 174.0 72.5 A 7.5 7.5 0 1 1 166.5 80.0 A 7.5 7.5 0 0 1 174.0 72.5 C 177.5 80.0 171.0 92.0 166.0 101.0 C 169.0 98.0 174.0 92.0 174.0 87.5 Z"
              fill={textColor}
            />
            <path
              id="quote-right"
              d="M 197.0 72.5 A 7.5 7.5 0 1 1 189.5 80.0 A 7.5 7.5 0 0 1 197.0 72.5 C 200.5 80.0 194.0 92.0 189.0 101.0 C 192.0 98.0 197.0 92.0 197.0 87.5 Z"
              fill={textColor}
            />
          </g>
        </svg>
      </div>
    );
  }

  // Standard full logo — Editorial Mark + COPYCOACH AI Wordmark
  const logoWidths = {
    sm: "w-36",
    md: "w-48",
    lg: "w-60",
    xl: "w-80",
  };

  return (
    <div className={`inline-flex items-center select-none ${logoWidths[size]} ${className}`}>
      <svg
        viewBox="0 0 350 210"
        className="w-full h-auto object-contain transition-transform duration-200 hover:scale-[1.02]"
        aria-label="CopyCoach AI"
      >
        <g id="editorial-mark">
          <path
            id="c-ring"
            d="M 209.70 48.66 A 45.0 45.0 0 1 0 223.25 111.72 L 205.23 99.11 A 23.0 23.0 0 1 1 198.05 66.71 Z"
            fill="#14B8A6"
          />
          <polygon
            id="cursor-facet-left"
            points="102.0,14.0 15.0,176.0 85.0,80.0 65.0,140.0 80.0,132.5"
            fill={lightFacetColor}
          />
          <polygon
            id="cursor-facet-right"
            points="102.0,14.0 80.0,132.5 95.0,125.0 135.0,55.0 176.0,42.0"
            fill={textColor}
          />
          <path
            id="quote-left"
            d="M 174.0 72.5 A 7.5 7.5 0 1 1 166.5 80.0 A 7.5 7.5 0 0 1 174.0 72.5 C 177.5 80.0 171.0 92.0 166.0 101.0 C 169.0 98.0 174.0 92.0 174.0 87.5 Z"
            fill={textColor}
          />
          <path
            id="quote-right"
            d="M 197.0 72.5 A 7.5 7.5 0 1 1 189.5 80.0 A 7.5 7.5 0 0 1 197.0 72.5 C 200.5 80.0 194.0 92.0 189.0 101.0 C 192.0 98.0 197.0 92.0 197.0 87.5 Z"
            fill={textColor}
          />
        </g>
        
        <g id="wordmark" fill={textColor}>
          <path d="M 40.00 167.80 H 42.00 C 37.33 162.00 23.33 162.00 15.00 178.00 C 15.00 194.00 37.33 194.00 42.00 188.20 H 40.00 C 35.00 188.20 20.80 184.33 20.80 178.00 C 20.80 171.67 35.00 167.80 40.00 167.80 Z" />
          <path d="M 61.50 162.00 A 15.00 16.50 0 1 1 61.50 195.00 A 15.00 16.50 0 1 1 61.50 162.00 Z M 61.50 167.80 A 9.20 10.70 0 1 0 61.50 189.20 A 9.20 10.70 0 1 0 61.50 167.80 Z" />
          <path d="M 82.00 163.00 H 95.50 A 8.50 8.50 0 0 1 95.50 180.00 H 87.80 V 194.00 H 82.00 Z M 87.80 168.80 H 95.50 A 2.70 2.70 0 0 0 95.50 174.20 H 87.80 Z" />
          <path d="M 106.00 163.00 H 113.00 L 119.00 179.00 V 194.00 H 113.20 V 179.00 L 106.00 163.00 Z M 125.00 163.00 H 132.00 L 121.90 181.90 L 116.10 181.90 Z" />
          <path d="M 159.00 167.80 H 161.00 C 156.33 162.00 142.33 162.00 134.00 178.00 C 134.00 194.00 156.33 194.00 161.00 188.20 H 159.00 C 154.00 188.20 139.80 184.33 139.80 178.00 C 139.80 171.67 154.00 167.80 159.00 167.80 Z" />
          <path d="M 180.50 162.00 A 15.00 16.50 0 1 1 180.50 195.00 A 15.00 16.50 0 1 1 180.50 162.00 Z M 180.50 167.80 A 9.20 10.70 0 1 0 180.50 189.20 A 9.20 10.70 0 1 0 180.50 167.80 Z" />
          <path d="M 209.00 163.00 H 212.00 L 224.00 194.00 H 217.00 L 214.10 186.20 H 206.90 L 204.00 194.00 H 197.00 Z M 210.50 172.30 L 208.10 181.00 H 212.90 Z" />
          <path d="M 253.00 167.80 H 255.00 C 250.33 162.00 236.33 162.00 228.00 178.00 C 228.00 194.00 250.33 194.00 255.00 188.20 H 253.00 C 248.00 188.20 233.80 184.33 233.80 178.00 C 233.80 171.67 248.00 167.80 253.00 167.80 Z" />
          <path d="M 261.00 163.00 H 266.80 V 175.60 H 279.20 V 163.00 H 285.00 V 194.00 H 279.20 V 181.40 H 266.80 V 194.00 H 261.00 Z" />
          <path d="M 312.00 163.00 H 315.00 L 327.00 194.00 H 320.00 L 317.10 186.20 H 309.90 L 307.00 194.00 H 300.00 Z M 313.50 172.30 L 311.10 181.00 H 315.90 Z" />
          <path d="M 332.00 163.00 H 337.80 V 194.00 H 332.00 Z" />
        </g>
      </svg>
    </div>
  );
}

