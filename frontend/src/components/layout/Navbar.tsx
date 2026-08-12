"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "../ui/Button";
import Logo from "../ui/Logo";
import FeedbackModal from "../ui/FeedbackModal";
import DownloadAppModal from "../ui/DownloadAppModal";
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
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#0B1020]/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-105">
          <Logo theme="dark" size="md" showTagline={true} />
        </Link>

        {/* Navigation Links */}
        <div className="hidden items-center gap-8 text-sm text-gray-300 md:flex">
          <Link href="#features" className="transition hover:text-white">
            Features
          </Link>

          <Link href="#how-it-works" className="transition hover:text-white">
            How It Works
          </Link>

          <Link href="#pricing" className="transition hover:text-white">
            Pricing
          </Link>

          <Link href="#about-app" className="transition hover:text-white">
            About App
          </Link>

          <Link href="#support" className="transition hover:text-white">
            Help & Support
          </Link>

          <a
            href="#mobile-app"
            className="transition text-cyan-300 hover:text-cyan-200 font-medium flex items-center gap-1"
          >
            <span>Get App APK/iOS</span>
          </a>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <DownloadAppModal triggerText="Get App APK/iOS" triggerClassName="hidden sm:inline-flex" />
          <FeedbackModal triggerClassName="hidden sm:inline-flex" />

          {loading ? (
            <div className="h-9 w-20 bg-white/5 animate-pulse rounded-lg" />
          ) : user ? (
            /* Logged In User Profile & Navigation */
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-[#5B5CEB] hover:bg-[#4a4be0] text-white font-medium text-xs sm:text-sm px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-500/20"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-white cursor-pointer"
                >
                  <div className="h-8 w-8 rounded-lg overflow-hidden bg-indigo-900/60 border border-indigo-400/30 flex items-center justify-center font-bold text-xs text-indigo-200 shrink-0">
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
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-2xl z-50 text-slate-100 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-2 border-b border-slate-800 mb-1">
                        <p className="text-xs font-bold text-white truncate">{displayName}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      </div>

                      <Link
                        href="/dashboard"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium hover:bg-slate-800 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                        <span>Go to Dashboard</span>
                      </Link>

                      <Link
                        href="/dashboard/profile"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium hover:bg-slate-800 transition-colors"
                      >
                        <User className="w-4 h-4 text-indigo-400" />
                        <span>My Profile Settings</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/40 transition-colors mt-1 border-t border-slate-800/80"
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
                className="hidden text-sm text-gray-300 transition hover:text-white sm:block"
              >
                Login
              </Link>

              <Button size="sm" href="/auth/signup">
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}