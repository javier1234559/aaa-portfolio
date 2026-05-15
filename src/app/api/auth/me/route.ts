import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getMockCredentials } from "@/lib/auth/credentials";
import { isSessionCookieValid, SESSION_COOKIE } from "@/lib/auth/session";

export async function GET() {
  const session = (await cookies()).get(SESSION_COOKIE);

  if (!isSessionCookieValid(session?.value)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { email: mockEmail } = getMockCredentials();

  return NextResponse.json({
    user: {
      id: "mock-user-1",
      email: mockEmail,
      name: "Example User",
    },
  });
}
