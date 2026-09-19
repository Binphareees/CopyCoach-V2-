'use client';
import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';

// Single source of truth: the Concept H logo assets in /public/branding.
// `logo.svg` is the charcoal wordmark for light backgrounds; `logo-inverse.svg`
// is the white wordmark for dark backgrounds (same artwork, recolored).
const LIGHT_LOGO_SRC = '/branding/logo.svg';
const DARK_LOGO_SRC = '/branding/logo-inverse.svg';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'mark' | 'app-icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'dark' | 'light' | 'auto';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  theme = 'auto',
}) => {
  const { isDarkMode } = useTheme();

  const sizeClasses = {
    sm: 'h-12 md:h-14',
    md: 'h-20 md:h-24',
    lg: 'h-28 md:h-32',
    xl: 'h-40 md:h-48',
  };

  const useDarkArtwork = theme === 'dark' || (theme === 'auto' && isDarkMode);
  const src = useDarkArtwork ? DARK_LOGO_SRC : LIGHT_LOGO_SRC;

  return (
    <div className={`inline-flex items-center ${sizeClasses[size]} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="CopyCoach AI"
        className="h-full w-auto max-w-full"
      />
    </div>
  );
};

export default Logo;
