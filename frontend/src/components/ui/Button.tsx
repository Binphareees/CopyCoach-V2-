import React from "react";
import clsx from "clsx";
import Link from "next/link";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "success";
  size?: "sm" | "md" | "lg" | "icon";
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  href?: string;
  disabled?: boolean;
  title?: string;
};

const buttonStyles = (
  variant: ButtonProps["variant"] = "primary",
  size: ButtonProps["size"] = "md"
) =>
  clsx(
    "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium",
    "transition-colors duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-45",
    {
      "bg-accent text-accent-foreground hover:bg-accent-hover":
        variant === "primary",

      "border border-border bg-surface-elevated text-text-primary hover:bg-surface-overlay":
        variant === "secondary",

      "border border-border bg-transparent text-text-primary hover:bg-surface":
        variant === "outline",

      "text-text-secondary hover:bg-surface hover:text-text-primary":
        variant === "ghost",

      "bg-danger text-white hover:bg-danger/85":
        variant === "destructive",

      "bg-success text-white hover:bg-success/85":
        variant === "success",

      "px-3.5 py-1.5 text-sm":
        size === "sm",

      "px-5 py-2.5 text-sm":
        size === "md",

      "px-7 py-3.5 text-base":
        size === "lg",

      "h-10 w-10":
        size === "icon",
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
  disabled,
  title,
}: ButtonProps) {

  const styles = buttonStyles(variant, size);

  if (href) {
    return (
      <Link
        href={href}
        className={clsx(styles, className)}
        aria-disabled={disabled}
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
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
}
