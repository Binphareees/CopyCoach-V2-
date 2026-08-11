"use client";

import { useEffect } from "react";

// Route Segment Error Boundary for Next.js App Router
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error caught:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-slate-100">
      <div className="max-w-md w-full bg-slate-800/80 border border-slate-700/60 rounded-2xl p-8 text-center shadow-xl">
        <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-2">An error occurred</h2>
        <p className="text-slate-400 text-sm mb-6">
          {error.message || "Something went wrong while rendering this section."}
        </p>
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition-colors shadow-lg shadow-indigo-600/20"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
