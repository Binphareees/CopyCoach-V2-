import React from "react";
import clsx from "clsx";
import Link from "next/link";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  href?: string;
};

const buttonStyles = (
  variant: "primary" | "secondary" | "outline",
  size: "sm" | "md" | "lg"
) =>
  clsx(
    "inline-flex items-center justify-center rounded-full font-semibold transition-all duration-300",
    {
      "bg-[#5B5CEB] text-white hover:opacity-90":
        variant === "primary",

      "bg-[#151A2D] text-white hover:bg-[#1F2745]":
        variant === "secondary",

      "border border-white/20 text-white hover:bg-white/10":
        variant === "outline",

      "px-4 py-2 text-sm":
        size === "sm",

      "px-6 py-3 text-base":
        size === "md",

      "px-8 py-4 text-lg":
        size === "lg",
    }
  );

export default function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  type = "button",
  className,
  href,
}: ButtonProps) {

  const styles = buttonStyles(variant, size);

  if (href) {
    return (
      <Link
        href={href}
        className={clsx(styles, className)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={clsx(styles, className)}
    >
      {children}
    </button>
  );
}