import type { User } from "@/feature/auth/types";

interface LoginDto {
  email: string;
  password: string;
}

interface RegisterDto {
  email: string;
  password: string;
}

async function parseJsonResponse<T>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as T & {
    message?: string;
  };
  if (!res.ok) {
    throw new Error(data.message ?? "Request failed");
  }
  return data;
}

/** Same-origin fetch so session cookies attach to this app (not NEXT_PUBLIC_APP_API). */
async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  return parseJsonResponse<T>(res);
}

export const authApi = {
  login(form: LoginDto) {
    return authFetch<{ user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(form),
    });
  },
  register(form: RegisterDto) {
    return authFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(form),
    });
  },
  getMe() {
    return authFetch<User>("/api/auth/me");
  },
};
