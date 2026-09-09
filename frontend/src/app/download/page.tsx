"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import Logo from "@/components/ui/Logo";
import { GradientButton } from "@/components/ui/gradient-button";
import { Smartphone, Download, CheckCircle2, Shield, Zap, ArrowLeft, Layers } from "lucide-react";

export default function DownloadLandingPage() {
  const { t } = useTranslation("landing");
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadApk = () => {
    setDownloading(true);
    window.location.href = "/api/download/android-apk";
    setTimeout(() => {
      setDownloading(false);
      setDownloadSuccess(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen text-text-primary flex flex-col font-sans">
      {/* HEADER */}
      <header className="border-b border-border bg-navbar-bg backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Logo theme="dark" size="sm" showTagline={false} />
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors bg-surface px-3.5 py-2 rounded-xl border border-border"
          >
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
            <span>{t("dlReturnToDashboard")}</span>
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-bold uppercase tracking-wider mb-6">
          <Smartphone className="w-4 h-4 text-accent" />
          <span>{t("mobileAppBadge")}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-text-primary tracking-tight max-w-3xl leading-tight mb-4">
          {t("downloadHeroTitlePart1")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-bright via-accent to-accent-deep">{t("downloadHeroTitleBrand")}</span>
        </h1>

        <p className="text-sm sm:text-base text-text-muted max-w-2xl mb-10 leading-relaxed">
          {t("downloadHeroDesc")}
        </p>

        {/* STORE BUTTONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl w-full mb-12">
          {/* GOOGLE PLAY STORE */}
          <button
            type="button"
            onClick={handleDownloadApk}
            className="group relative flex items-center gap-4 p-5 rounded-2xl bg-surface-elevated border border-border hover:border-accent/40 hover:bg-surface-muted transition-all shadow-xl cursor-pointer text-start"
          >
            <div className="p-3 rounded-xl bg-surface border border-border text-accent group-hover:scale-105 transition-transform">
              <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L18.81,13.12C19.46,12.47 19.46,11.53 18.81,10.88L16.81,8.88L14.75,10.94L16.81,15.12M4.6,2.7L12.97,11.07L15.1,8.94L5.65,2.15C5.32,1.91 4.9,2.12 4.6,2.7M4.6,21.3C4.9,21.88 5.32,22.09 5.65,21.85L15.1,15.06L12.97,12.93L4.6,21.3Z" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-text-muted block tracking-wider">
                {t("appGetItOn")}
              </span>
              <span className="text-base font-bold text-text-primary group-hover:text-accent transition-colors">
                {t("dlGooglePlayStore")}
              </span>
              <span className="text-xs text-accent block mt-0.5 font-medium">
                {t("apkVersionTwo")}
              </span>
            </div>
          </button>

          {/* APPLE APP STORE */}
          <a
            href="https://apps.apple.com/app/copycoach-ai/id640000000"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center gap-4 p-5 rounded-2xl bg-surface-elevated border border-border hover:border-accent/40 hover:bg-surface-muted transition-all shadow-xl cursor-pointer text-start"
          >
            <div className="p-3 rounded-xl bg-surface border border-border text-text-primary group-hover:scale-105 transition-transform">
              <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.09,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-text-muted block tracking-wider">
                {t("appDownloadOnThe")}
              </span>
              <span className="text-base font-bold text-text-primary group-hover:text-accent transition-colors">
                {t("dlAppleAppStore")}
              </span>
              <span className="text-xs text-accent block mt-0.5 font-medium">
                {t("appIosTestFlight")}
              </span>
            </div>
          </a>
        </div>

        {/* DIRECT APK DOWNLOAD BOX */}
        <div className="w-full max-w-xl bg-surface-elevated border border-border rounded-2xl p-5 mb-12 flex items-center justify-between">
          <div className="text-start">
            <h3 className="text-sm font-bold text-text-primary">{t("dlDirectApkPackage")}</h3>
            <p className="text-xs text-text-muted">{t("apkBuildInfo")}</p>
          </div>

          <GradientButton
            onClick={handleDownloadApk}
            disabled={downloading}
            className="w-full sm:w-auto"
          >
            {downloading ? (
              <span>{t("preparingDownload")}</span>
            ) : downloadSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>{t("appApkDownloaded")}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-white" />
                <span>{t("dlDownloadApk")}</span>
              </>
            )}
          </GradientButton>
        </div>

        {/* FEATURES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-start">
          <div className="bg-surface-elevated border border-border rounded-2xl p-6">
            <div className="p-3 rounded-xl bg-accent/10 text-accent-bright w-fit mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-text-primary mb-2">{t("featureInstantFeedbackTitle")}</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              {t("featureInstantFeedbackDesc")}
            </p>
          </div>

          <div className="bg-surface-elevated border border-border rounded-2xl p-6">
            <div className="p-3 rounded-xl bg-accent/10 text-accent-bright w-fit mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-text-primary mb-2">{t("featureFrameworkDrillsTitle")}</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              {t("featureFrameworkDrillsDesc")}
            </p>
          </div>

          <div className="bg-surface-elevated border border-border rounded-2xl p-6">
            <div className="p-3 rounded-xl bg-accent/10 text-accent-bright w-fit mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-text-primary mb-2">{t("featureOfflineSyncTitle")}</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              {t("featureOfflineSyncDesc")}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}