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
    <div className="flex flex-wrap gap-2">
      {CATEGORY_OPTIONS.map((cat) => {
        const Icon = cat.icon;
        const isActive = value === cat.value;
        return (
          <button
            key={cat.value}
            type="button"
            onClick={() => onChange(cat.value)}
            aria-pressed={isActive}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              isActive
                ? "border-transparent bg-accent text-accent-foreground"
                : "border-border bg-surface text-text-muted hover:bg-surface-muted hover:text-text-primary"
            }`}
          >
            <Icon
              className={`h-3.5 w-3.5 ${isActive ? "text-accent-foreground" : "text-text-muted"}`}
            />
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}