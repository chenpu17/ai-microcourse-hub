import { cookies, headers } from "next/headers";

const ADMIN_COOKIE_NAME = "admin_session";

export type AdminAuthMode = "password" | "trusted_header";

export function getAdminCookieName() {
  return ADMIN_COOKIE_NAME;
}

export function getAdminAuthMode(): AdminAuthMode {
  return process.env.ADMIN_AUTH_MODE === "trusted_header" ? "trusted_header" : "password";
}

export function getAdminTrustedHeaderName() {
  return process.env.ADMIN_TRUSTED_HEADER || "x-internal-user";
}

function parseAllowedUsers() {
  return String(process.env.ADMIN_TRUSTED_USERS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function getAdminAuthState() {
  const mode = getAdminAuthMode();

  if (mode === "trusted_header") {
    const headerStore = await headers();
    const headerName = getAdminTrustedHeaderName();
    const identity = headerStore.get(headerName);
    const allowedUsers = parseAllowedUsers();
    const authorized =
      Boolean(identity) &&
      (allowedUsers.length === 0 || allowedUsers.includes(String(identity)));

    return {
      mode,
      authorized,
      identity: identity || null
    };
  }

  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  return {
    mode,
    authorized: Boolean(session && session === process.env.ADMIN_PASSWORD),
    identity: session ? "password-session" : null
  };
}

export async function isAdminAuthorized() {
  const auth = await getAdminAuthState();
  return auth.authorized;
}
