"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { GradientButton } from "../ui/gradient-button";
import Logo from "../ui/Logo";
import { supabase, ensureSupabaseConfig } from "@/lib/supabase";
import { User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface ProfileData {
  full_name?: string;
  avatar_url?: string;
}

export default function Navbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close the account dropdown when clicking/tapping anywhere outside it
  useEffect(() => {
    if (!showDropdown) return;

    function handlePointerDown(event: PointerEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [showDropdown]);

  useEffect(() => {
    let isMounted = true;

    async function checkUser() {
      await ensureSupabaseConfig();
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (isMounted) {
        setUser(currentUser);
        if (currentUser) {
          const { data } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", currentUser.id)
            .maybeSingle();

          if (data && isMounted) {
            setProfile(data);
          }
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    }

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (isMounted) {
        const currentUser = session?.user || null;
        setUser(currentUser);
        if (currentUser) {
          const { data } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", currentUser.id)
            .maybeSingle();

          if (data && isMounted) {
            setProfile(data);
          }
        } else {
          setProfile(null);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setShowDropdown(false);
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "";

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border bg-navbar-bg backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-105">
          <Logo theme="dark" size="md" showTagline={true} />
        </Link>

        {/* Navigation Links */}
        <div className="hidden items-center gap-8 text-sm text-text-secondary md:flex">
          <Link href="#features" className="transition hover:text-text-primary">
            Features
          </Link>

          <Link href="#how-it-works" className="transition hover:text-text-primary">
            How It Works
          </Link>

          <Link href="#pricing" className="transition hover:text-text-primary">
            Pricing
          </Link>

          <Link href="#about-app" className="transition hover:text-text-primary">
            About App
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-9 w-20 bg-surface animate-pulse rounded-lg" />
          ) : user ? (
            /* Logged In User Profile & Navigation */
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-accent-foreground font-medium text-xs sm:text-sm px-4 py-2 rounded-xl transition-all shadow-md"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-border hover:border-border-strong hover:bg-surface-elevated transition-all text-text-primary cursor-pointer"
                >
                  <div className="h-8 w-8 rounded-lg overflow-hidden bg-surface-overlay border border-border flex items-center justify-center font-bold text-xs text-text-secondary shrink-0">
                    {avatarUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                    ) : (
                      displayName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="hidden lg:inline-block text-xs font-semibold max-w-[120px] truncate">
                    {displayName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                </button>

                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border/50 bg-[#0d1117] dark:bg-[#0a0e18] p-2 shadow-2xl z-50 text-text-primary animate-in fade-in zoom-in-95">
                      <div className="px-3 py-2 border-b border-white/15 mb-1">
                        <p className="text-xs font-bold text-text-primary truncate">{displayName}</p>
                        <p className="text-[11px] text-text-muted truncate">{user.email}</p>
                      </div>

                      <Link
                        href="/dashboard"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium hover:bg-white/15 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-accent" />
                        <span>Go to Dashboard</span>
                      </Link>

                      <Link
                        href="/dashboard/profile"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium hover:bg-white/15 transition-colors"
                      >
                        <User className="w-4 h-4 text-accent" />
                        <span>My Profile Settings</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-danger hover:bg-danger-surface transition-colors mt-1 border-t border-white/15"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            /* Logged Out Actions */
            <>
              <Link
                href="/auth/login"
                className="text-sm text-text-secondary transition hover:text-text-primary"
              >
                Login
              </Link>

              <GradientButton asChild className="!min-w-0 !px-5 !py-2.5 !text-sm !rounded-lg">
                <Link href="/auth/signup">Get Started</Link>
              </GradientButton>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
