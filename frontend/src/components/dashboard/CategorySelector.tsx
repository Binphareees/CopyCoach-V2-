"use client";

import React from "react";
import { Share2, Megaphone, Mail, MousePointerClick, Package, PenLine } from "lucide-react";

export interface CategoryOption {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: "Social Media", label: "Social Media", icon: Share2 },
  { value: "Advertisement", label: "Ad Campaign", icon: Megaphone },
  { value: "Email", label: "Email Marketing", icon: Mail },
  { value: "Landing Page", label: "Landing Page", icon: MousePointerClick },
  { value: "Product Description", label: "Product Copy", icon: Package },
  { value: "Blog", label: "Blog Content", icon: PenLine },
];

interface CategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CategorySelector({ value, onChange }: CategorySelectorProps) {
  return (
    <div className="no-scrollbar -mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1">
      {CATEGORY_OPTIONS.map((cat) => {
        const Icon = cat.icon;
        const isActive = value === cat.value;
        return (
          <button
            key={cat.value}
            type="button"
            onClick={() => onChange(cat.value)}
            aria-pressed={isActive}
            className={`flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-3 text-[13px] font-semibold transition-all duration-200 active:scale-[0.97] ${
              isActive
                ? "border-transparent bg-accent text-white shadow-accent-soft"
                : "border-glass-border bg-glass-bg-elevated text-brand-200 hover:border-glass-border hover:bg-glass-bg-hover hover:text-white"
            }`}
          >
            <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-brand-300"}`} />
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}