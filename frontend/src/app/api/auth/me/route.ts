import { NextRequest, NextResponse } from "next/server";
import { getServerUser, isAdmin } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  const user = await getServerUser(request);
  if (!user) {
    return NextResponse.json(
      { authenticated: false, isAdmin: false },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    isAdmin: isAdmin()(user),
    user: {
      id: user.id,
      email: user.email,
      fullName: user.user_metadata?.full_name || user.user_metadata?.name || null,
      avatarUrl:
        user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
    },
  });
}