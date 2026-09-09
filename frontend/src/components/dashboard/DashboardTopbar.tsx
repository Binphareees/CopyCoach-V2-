"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Menu } from "lucide-react";
import { useDashboardShell } from "@/components/dashboard/DashboardShell";

interface DashboardTopbarProps {
  title: string;
  back?: { href: string; label: string };
  right?: React.ReactNode;
}

export default function DashboardTopbar({ title, back, right }: DashboardTopbarProps) {
  const { setOpen } = useDashboardShell();

  return (
    <header className="sticky top-0 z-30 border-b border-border-subtle bg-navbar-bg backdrop-blur-md">
      <div className="flex h-16 items-center gap-2 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation menu"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface hover:text-text-primary lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {back && (
          <Link
            href={back.href}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-surface hover:text-text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="whitespace-nowrap">{back.label}</span>
          </Link>
        )}

        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-text-primary sm:text-base">
          {title}
        </p>

        {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
      </div>
    </header>
  );
}