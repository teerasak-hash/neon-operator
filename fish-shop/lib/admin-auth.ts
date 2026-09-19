import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "fish-admin-session";
const TTL_SECONDS = 60 * 60 * 8;

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value) throw new Error("ADMIN_SESSION_SECRET is not configured");
  return value;
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function createSession() {
  const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const payload = `admin.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySession(value: string | undefined) {
  if (!value) return false;
  const [role, expText, signature] = value.split(".");
  if (role !== "admin" || !expText || !signature) return false;
  const exp = Number(expText);
  if (!Number.isInteger(exp) || exp <= Math.floor(Date.now() / 1000)) return false;
  const expected = sign(`${role}.${expText}`);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const adminCookie = { name: COOKIE_NAME, maxAge: TTL_SECONDS };
