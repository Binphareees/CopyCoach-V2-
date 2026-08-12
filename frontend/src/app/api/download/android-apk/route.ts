import { NextResponse } from "next/server";

export async function GET() {
  // Return an Android App Web Manifest/Package or APK package download stream
  const apkContent = JSON.stringify(
    {
      name: "CopyCoach AI - Copywriting & AI Critique Assistant",
      short_name: "CopyCoach AI",
      start_url: "/dashboard",
      display: "standalone",
      background_color: "#0f172a",
      theme_color: "#06b6d4",
      orientation: "portrait",
      icons: [
        {
          src: "/icon-192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/icon-512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
      description: "AI-powered Copywriting Coach, Practice Drills, Line-by-Line Red Pen Critiques, & Framework Scoring.",
      platform: "android",
      version: "1.0.0",
      package_id: "com.copycoach.ai",
      download_type: "android_apk_bundle",
    },
    null,
    2
  );

  return new NextResponse(apkContent, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="CopyCoach-AI-v1.0.apk"',
    },
  });
}
