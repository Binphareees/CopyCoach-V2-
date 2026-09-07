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
      "bg-accent text-accent-foreground hover:bg-accent-hover":
        variant === "primary",

      "bg-surface-elevated text-text-primary hover:bg-surface-muted border border-border":
        variant === "secondary",

      "border border-border text-text-primary hover:bg-surface-elevated":
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
