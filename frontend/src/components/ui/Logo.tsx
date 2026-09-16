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
  const textColor = isDark ? "#FFFFFF" : "#1D1E1B";
  const tealAccent = "#6FDFB5";

  // App icon / Editorial Compass Mark variant only
  if (variant === "app-icon" || iconOnly) {
    const iconSizes = {
      sm: "w-7 h-7",
      md: "w-9 h-9",
      lg: "w-12 h-12",
      xl: "w-16 h-16",
    };

    return (
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]} ${className}`}>
        <svg
          viewBox="40 5 155 150"
          className="w-full h-full object-contain overflow-visible"
          aria-label="CopyCoach AI Mark"
        >
          <g id="editorial-compass-mark">
            {/* Central Mint Teal Star Accent */}
            <path
              id="mint-teal-star"
              d="M 118.5 80.0 L 109.5 62.0 L 118.5 44.0 L 127.5 62.0 Z M 118.5 80.0 L 127.5 98.0 L 118.5 116.0 L 109.5 98.0 Z M 118.5 80.0 L 100.5 71.0 L 82.5 80.0 L 100.5 89.0 Z M 118.5 80.0 L 134.5 89.0 L 154.5 80.0 L 134.5 71.0 Z"
              fill={tealAccent}
            />
            
            {/* Outer Cardinal Dark Star Points */}
            <path
              id="dark-star-tips"
              d="M 118.5 8.0 L 112.0 58.0 L 118.5 50.0 L 125.0 58.0 Z M 118.5 152.0 L 125.0 102.0 L 118.5 110.0 L 112.0 102.0 Z M 46.5 80.0 L 96.5 73.5 L 88.5 80.0 L 96.5 86.5 Z M 190.5 80.0 L 140.5 86.5 L 148.5 80.0 L 140.5 73.5 Z"
              fill={textColor}
            />
            
            {/* 4 Inward Mouse Cursor Arrows */}
            <polygon id="cursor-nw" points="112.5,74.0 77.0,48.0 98.0,69.0 68.0,39.0 61.0,46.0 91.0,76.0 71.0,90.0" fill={textColor} />
            <polygon id="cursor-ne" points="124.5,74.0 160.0,48.0 139.0,69.0 169.0,39.0 176.0,46.0 146.0,76.0 166.0,90.0" fill={textColor} />
            <polygon id="cursor-se" points="124.5,86.0 160.0,112.0 139.0,91.0 169.0,121.0 176.0,114.0 146.0,84.0 166.0,70.0" fill={textColor} />
            <polygon id="cursor-sw" points="112.5,86.0 77.0,112.0 98.0,91.0 68.0,121.0 61.0,114.0 91.0,84.0 71.0,70.0" fill={textColor} />
          </g>
        </svg>
      </div>
    );
  }

  // Standard full logo — Editorial Compass Mark + Title Case CopyCoach AI Wordmark
  const logoWidths = {
    sm: "w-28",
    md: "w-36",
    lg: "w-44",
    xl: "w-56",
  };

  return (
    <div className={`inline-flex items-center select-none ${logoWidths[size]} ${className}`}>
      <svg
        viewBox="0 0 240 210"
        className="w-full h-auto object-contain transition-transform duration-200 hover:scale-[1.02]"
        aria-label="CopyCoach AI"
      >
        <g id="editorial-compass-mark">
          {/* Central Mint Teal Star Accent */}
          <path
            id="mint-teal-star"
            d="M 118.5 80.0 L 109.5 62.0 L 118.5 44.0 L 127.5 62.0 Z M 118.5 80.0 L 127.5 98.0 L 118.5 116.0 L 109.5 98.0 Z M 118.5 80.0 L 100.5 71.0 L 82.5 80.0 L 100.5 89.0 Z M 118.5 80.0 L 134.5 89.0 L 154.5 80.0 L 134.5 71.0 Z"
            fill={tealAccent}
          />
          
          {/* Outer Cardinal Dark Star Points */}
          <path
            id="dark-star-tips"
            d="M 118.5 8.0 L 112.0 58.0 L 118.5 50.0 L 125.0 58.0 Z M 118.5 152.0 L 125.0 102.0 L 118.5 110.0 L 112.0 102.0 Z M 46.5 80.0 L 96.5 73.5 L 88.5 80.0 L 96.5 86.5 Z M 190.5 80.0 L 140.5 86.5 L 148.5 80.0 L 140.5 73.5 Z"
            fill={textColor}
          />
          
          {/* 4 Inward Mouse Cursor Arrows */}
          <polygon id="cursor-nw" points="112.5,74.0 77.0,48.0 98.0,69.0 68.0,39.0 61.0,46.0 91.0,76.0 71.0,90.0" fill={textColor} />
          <polygon id="cursor-ne" points="124.5,74.0 160.0,48.0 139.0,69.0 169.0,39.0 176.0,46.0 146.0,76.0 166.0,90.0" fill={textColor} />
          <polygon id="cursor-se" points="124.5,86.0 160.0,112.0 139.0,91.0 169.0,121.0 176.0,114.0 146.0,84.0 166.0,70.0" fill={textColor} />
          <polygon id="cursor-sw" points="112.5,86.0 77.0,112.0 98.0,91.0 68.0,121.0 61.0,114.0 91.0,84.0 71.0,70.0" fill={textColor} />
        </g>
        
        {/* Title Case Wordmark: CopyCoach AI */}
        <g id="wordmark" fill={textColor}>
          {/* C */}
          <path d="M 29.50 172.00 H 31.00 C 26.33 168.00 13.33 168.00 9.00 181.50 C 9.00 195.00 26.33 195.00 31.00 191.00 H 29.50 C 25.00 191.00 13.20 187.33 13.20 181.50 C 13.20 175.67 25.00 172.00 29.50 172.00 Z" />
          {/* o */}
          <path d="M 42.50 176.00 A 8.50 9.50 0 1 1 42.50 195.00 A 8.50 9.50 0 1 1 42.50 176.00 Z M 42.50 179.60 A 4.90 5.90 0 1 0 42.50 191.40 A 4.90 5.90 0 1 0 42.50 179.60 Z" />
          {/* p */}
          <path d="M 55.00 176.00 H 63.50 A 8.50 9.50 0 0 1 63.50 195.00 H 58.60 V 203.00 H 55.00 Z M 58.60 179.60 H 63.50 A 4.90 5.90 0 0 0 63.50 191.40 H 58.60 Z" />
          {/* y */}
          <path d="M 75.00 176.00 H 78.60 L 83.50 195.00 V 203.00 H 79.90 V 195.00 L 75.00 176.00 Z M 92.00 176.00 H 88.40 L 81.70 196.80 L 85.30 196.80 Z" />
          {/* C */}
          <path d="M 116.50 172.00 H 118.00 C 113.33 168.00 100.33 168.00 96.00 181.50 C 96.00 195.00 113.33 195.00 118.00 191.00 H 116.50 C 112.00 191.00 100.20 187.33 100.20 181.50 C 100.20 175.67 112.00 172.00 116.50 172.00 Z" />
          {/* o */}
          <path d="M 129.50 176.00 A 8.50 9.50 0 1 1 129.50 195.00 A 8.50 9.50 0 1 1 129.50 176.00 Z M 129.50 179.60 A 4.90 5.90 0 1 0 129.50 191.40 A 4.90 5.90 0 1 0 129.50 179.60 Z" />
          {/* a */}
          <path d="M 149.50 176.00 A 8.50 9.50 0 0 1 158.00 195.00 H 154.40 V 179.60 A 4.90 5.90 0 0 0 149.50 179.60 Z M 149.50 176.00 A 8.50 9.50 0 1 0 149.50 195.00 H 158.00 V 191.40 H 149.50 Z" />
          {/* c */}
          <path d="M 175.80 179.60 H 177.00 C 173.33 176.00 163.33 176.00 161.00 185.50 C 161.00 195.00 173.33 195.00 177.00 191.40 H 175.80 C 172.00 191.40 164.60 188.83 164.60 185.50 C 164.60 182.17 172.00 179.60 175.80 179.60 Z" />
          {/* h */}
          <path d="M 180.00 168.00 H 183.60 V 179.60 A 3.60 3.60 0 0 1 192.40 179.60 V 195.00 H 196.00 V 179.60 A 7.20 7.20 0 0 0 183.60 175.20 V 168.00 Z M 180.00 176.00 V 195.00 H 183.60 V 176.00 Z" />
          {/* A */}
          <path d="M 211.00 168.00 H 214.00 L 220.00 195.00 H 215.80 L 213.90 188.20 H 208.10 L 206.20 195.00 H 202.00 Z M 211.00 174.30 L 209.10 183.00 H 212.90 Z" />
          {/* I */}
          <path d="M 223.00 168.00 H 227.50 V 195.00 H 223.00 Z" />
        </g>
      </svg>
    </div>
  );
}
