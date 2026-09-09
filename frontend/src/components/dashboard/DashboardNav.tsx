"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

interface DashboardNavLinkProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  matchPrefix?: string;
  badge?: React.ReactNode;
  onNavigate?: () => void;
}

export function DashboardNavLink({
  href,
  label,
  icon,
  matchPrefix,
  badge,
  onNavigate,
}: DashboardNavLinkProps) {
  const pathname = usePathname();

  const isSection = href.includes("#");
  const isActive = isSection
    ? false
    : matchPrefix
      ? pathname === href || pathname.startsWith(matchPrefix)
      : pathname === href;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={clsx(
        "group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors",
        isActive
          ? "bg-accent/12 text-accent-bright"
          : "text-text-secondary hover:bg-surface hover:text-text-primary"
      )}
    >
      <span
        className={clsx(
          "shrink-0 transition-colors",
          isActive ? "text-accent-bright" : "text-text-muted group-hover:text-text-secondary"
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {badge}
    </Link>
  );
}

interface DashboardNavButtonProps {
  label: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
  onClick?: () => void;
  title?: string;
  variant?: "default" | "danger";
}

export function DashboardNavButton({
  label,
  icon,
  badge,
  onClick,
  title,
  variant = "default",
}: DashboardNavButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={clsx(
        "group flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors",
        variant === "danger"
          ? "text-danger hover:bg-danger/15"
          : "text-text-secondary hover:bg-surface hover:text-text-primary"
      )}
    >
      <span
        className={clsx(
          "shrink-0 transition-colors",
          variant === "danger" ? "text-danger" : "text-text-muted group-hover:text-text-secondary"
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate text-left">{label}</span>
      {badge}
    </button>
  );
}

interface DashboardNavGroupProps {
  label: string;
  children: React.ReactNode;
}

export function DashboardNavGroup({ label, children }: DashboardNavGroupProps) {
  return (
    <div className="mb-1.5">
      <span className="block px-2.5 pb-1.5 pt-3 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
        {label}
      </span>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}