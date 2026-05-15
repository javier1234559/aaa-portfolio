import { NextResponse } from "next/server";

import { getMockCredentials } from "@/lib/auth/credentials";
import { SESSION_COOKIE, SESSION_VALUE } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 },
      );
    }

    const { email: mockEmail, password: mockPassword } = getMockCredentials();

    if (email !== mockEmail || password !== mockPassword) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    const res = NextResponse.json({
      user: {
        id: "mock-user-1",
        email: mockEmail,
        name: "Example User",
      },
    });
    const secure =
      process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

    res.cookies.set({
      name: SESSION_COOKIE,
      value: SESSION_VALUE,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      secure,
    });
    return res;
  } catch {
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 },
    );
  }
}
