import { SignJWT, jwtVerify } from "jose";
import { env } from "../lib/env";

const COOKIE_NAME = "recomeca_sid";
const MAX_AGE_S = 60 * 60 * 24 * 30; // 30 dias

function key() {
  return new TextEncoder().encode(env.appSecret || "segredo-de-desenvolvimento");
}

export type SessionPayload = { sid: number; uid: number };

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_S}s`)
    .sign(key());
}

export async function verifySession(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key());
    if (typeof payload.sid !== "number" || typeof payload.uid !== "number") {
      return null;
    }
    return { sid: payload.sid, uid: payload.uid };
  } catch {
    return null;
  }
}

export function sessionCookie(token: string): string {
  const secure = env.isProduction ? "; Secure" : "";
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_S}${secure}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function readSessionCookie(header: string | null): string | null {
  if (!header) return null;
  const match = header.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export const SESSION_MAX_AGE_MS = MAX_AGE_S * 1000;
