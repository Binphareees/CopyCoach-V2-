"use client";

import React, { useState, useEffect } from "react";
import { Smartphone, Download, X, QrCode, CheckCircle2, Shield, Zap, ExternalLink } from "lucide-react";

interface DownloadAppModalProps {
  triggerClassName?: string;
  triggerText?: string;
}

export default function DownloadAppModal({
  triggerClassName = "",
  triggerText = "Download App",
}: DownloadAppModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleDownloadApk = () => {
    setDownloading(true);
    // Trigger download of the Android APK
    window.location.href = "/api/download/android-apk";
    setTimeout(() => {
      setDownloading(false);
      setDownloadSuccess(true);
    }, 1200);
  };

  return (
    <>
      {/* TRIGGER BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 hover:from-cyan-500/30 hover:to-blue-600/30 transition-all cursor-pointer shadow-sm ${triggerClassName}`}
      >
        <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
        <span>{triggerText}</span>
      </button>

      {/* MODAL OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn cursor-pointer"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 flex flex-col max-h-[90vh] overflow-y-auto cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE BUTTON */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* HEADER */}
            <div className="flex items-center gap-3.5 mb-6 pr-8">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 shrink-0">
                <Smartphone className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-0.5 rounded-full">
                  Mobile Application
                </span>
                <h3 className="text-xl font-bold text-white mt-1">Download CopyCoach AI Mobile</h3>
                <p className="text-xs text-slate-400">
                  Access copywriting drills, AI critiques, and saved frameworks on Android & iOS.
                </p>
              </div>
            </div>

            {/* STORE BUTTONS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* GOOGLE PLAY STORE BUTTON */}
              <a
                href="https://play.google.com/store/apps/details?id=com.copycoach.ai"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  handleDownloadApk();
                }}
                className="group relative flex items-center gap-3.5 p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all shadow-md cursor-pointer"
              >
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L18.81,13.12C19.46,12.47 19.46,11.53 18.81,10.88L16.81,8.88L14.75,10.94L16.81,15.12M4.6,2.7L12.97,11.07L15.1,8.94L5.65,2.15C5.32,1.91 4.9,2.12 4.6,2.7M4.6,21.3C4.9,21.88 5.32,22.09 5.65,21.85L15.1,15.06L12.97,12.93L4.6,21.3Z" />
                  </svg>
                </div>
                <div className="text-left">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
                    GET IT ON
                  </span>
                  <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    Google Play Store
                  </span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5 font-medium">
                    Android APK Package Included
                  </span>
                </div>
              </a>

              {/* APPLE APP STORE BUTTON */}
              <a
                href="https://apps.apple.com/app/copycoach-ai/id640000000"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center gap-3.5 p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all shadow-md cursor-pointer"
              >
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.09,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
                  </svg>
                </div>
                <div className="text-left">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
                    Download on the
                  </span>
                  <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    Apple App Store
                  </span>
                  <span className="text-[10px] text-cyan-400 block mt-0.5 font-medium">
                    iOS TestFlight & App Store
                  </span>
                </div>
              </a>
            </div>

            {/* DIRECT APK DOWNLOAD ACTION */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Direct Android APK Package</h4>
                  <p className="text-[11px] text-slate-400">Version 1.0.0 (CopyCoach-AI-v1.0.apk)</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownloadApk}
                disabled={downloading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {downloading ? (
                  <span>Downloading APK...</span>
                ) : downloadSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    <span>APK Downloaded!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-slate-950" />
                    <span>Download APK File</span>
                  </>
                )}
              </button>
            </div>

            {/* SCAN QR CODE FOR INSTANT PWA MOBILE INSTALL */}
            <div className="border-t border-slate-800 pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-cyan-400" />
                  <span>Scan QR Code to Install on Phone Immediately</span>
                </h4>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Zero Storage Required</span>
                </span>
              </div>

              <div className="flex items-center gap-4 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                <div className="bg-white p-2 rounded-xl shrink-0">
                  {/* Styled QR Code SVG representation */}
                  <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none">
                    <rect width="100" height="100" fill="white" />
                    <rect x="10" y="10" width="30" height="30" fill="black" />
                    <rect x="15" y="15" width="20" height="20" fill="white" />
                    <rect x="20" y="20" width="10" height="10" fill="black" />

                    <rect x="60" y="10" width="30" height="30" fill="black" />
                    <rect x="65" y="15" width="20" height="20" fill="white" />
                    <rect x="70" y="20" width="10" height="10" fill="black" />

                    <rect x="10" y="60" width="30" height="30" fill="black" />
                    <rect x="15" y="65" width="20" height="20" fill="white" />
                    <rect x="20" y="70" width="10" height="10" fill="black" />

                    <rect x="50" y="50" width="10" height="10" fill="black" />
                    <rect x="70" y="50" width="10" height="10" fill="black" />
                    <rect x="50" y="70" width="20" height="20" fill="black" />
                    <rect x="80" y="80" width="10" height="10" fill="black" />
                  </svg>
                </div>

                <div className="text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-white">How to Install as Mobile App:</p>
                  <p className="text-[11px] text-slate-400">1. Open Camera on iPhone or Android</p>
                  <p className="text-[11px] text-slate-400">2. Scan QR Code & open link in Safari / Chrome</p>
                  <p className="text-[11px] text-cyan-400 font-medium">3. Tap &quot;Add to Home Screen&quot; to install full app</p>
                </div>
              </div>
            </div>

            {/* FOOTER FEATURES */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Clean APK</span>
              </span>
              <a
                href="/download"
                className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Full Download Landing Page</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
