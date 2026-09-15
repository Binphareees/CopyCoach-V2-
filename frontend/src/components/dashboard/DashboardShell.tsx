"use client";

import React, { createContext, useContext, useCallback, useEffect, useState } from "react";
import DashboardSidebar from "./DashboardSidebar";

interface DashboardShellContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
}

const DashboardShellContext = createContext<DashboardShellContextValue>({
  open: false,
  setOpen: () => {},
  collapsed: false,
  setCollapsed: () => {},
  toggleCollapsed: () => {},
});

export function useDashboardShell() {
  return useContext(DashboardShellContext);
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const close = useCallback(() => setOpen(false), []);
  const toggleCollapsed = useCallback(() => setCollapsed((c) => !c), []);

  return (
    <DashboardShellContext.Provider value={{ open, setOpen, collapsed, setCollapsed, toggleCollapsed }}>
      <div className="min-h-screen">
        <DashboardSidebar />
        {open && (
          <div
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={close}
          />
        )}
        <div
          className={`flex min-h-screen flex-col transition-[padding] duration-300 ease-in-out ${
            collapsed ? "" : "lg:pl-[264px]"
          }`}
        >
          {children}
        </div>
      </div>
    </DashboardShellContext.Provider>
  );
}