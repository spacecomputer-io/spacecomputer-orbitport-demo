import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import cookie from "cookie";

const AUTH_SECRET = (
  process.env.AUTH_SECRET || "dev_secret_32_bytes_long_for_demo"
)
  .padEnd(32, "!")
  .slice(0, 32);
const COOKIE_NAME = "orbitport_token";
const TOKEN_EXPIRE_BUFFER = 86400; // seconds, refresh token if expiring soon

interface TokenData {
  access_token: string;
  exp: number;
}

// Encrypt a string using AES-256-GCM
function encrypt(text: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    Buffer.from(AUTH_SECRET),
    iv
  );
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${encrypted}`;
}

// Decrypt a string using AES-256-GCM
function decrypt(data: string | undefined): string | null {
  if (!data) return null;
  try {
    const [ivB64, tagB64, encrypted] = data.split(".");
    if (!ivB64 || !tagB64 || !encrypted) return null;
    const iv = Buffer.from(ivB64, "base64");
    const tag = Buffer.from(tagB64, "base64");
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      Buffer.from(AUTH_SECRET),
      iv
    );
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(encrypted, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    return null;
  }
}

// Parse JWT and extract exp
function parseToken(token: string | null): TokenData | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    if (!payload.exp) return null;
    return { access_token: token, exp: payload.exp };
  } catch {
    return null;
  }
}

// Get a new access token from Orbitport
async function getNewAccessToken(): Promise<string | null> {
  const clientId = process.env.ORBITPORT_CLIENT_ID;
  const clientSecret = process.env.ORBITPORT_CLIENT_SECRET;
  const authUrl = process.env.ORBITPORT_AUTH_URL;

  if (!clientId || !clientSecret || !authUrl) {
    throw new Error("Missing Orbitport authentication configuration");
  }

  try {
    const response = await fetch(`${authUrl}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        audience: "https://op.spacecoin.xyz/api",
        grant_type: "client_credentials",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get access token");
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error getting access token:", error);
    return null;
  }
}

export async function getValidToken(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<string | null> {
  // 1. Parse cookies
  const cookies = cookie.parse(req.headers.cookie || "");
  const encryptedToken = cookies[COOKIE_NAME];
  let accessToken: string | null = null;
  let tokenExp = 0;

  if (encryptedToken) {
    const decrypted = decrypt(encryptedToken);
    const parsed = parseToken(decrypted);
    if (parsed) {
      const now = Math.floor(Date.now() / 1000);
      // Only use token if not expired and not about to expire
      if (parsed.exp > now + TOKEN_EXPIRE_BUFFER) {
        accessToken = parsed.access_token;
        tokenExp = parsed.exp;
      }
    }
  }

  // 2. If no valid token, get new one from Orbitport
  if (!accessToken) {
    accessToken = await getNewAccessToken();
    if (!accessToken) {
      return null;
    }

    // parse exp from JWT
    const parsed = parseToken(accessToken);
    if (!parsed) {
      return null;
    }
    tokenExp = parsed.exp;

    // Encrypt and set cookie
    const encrypted = encrypt(accessToken);
    res.setHeader(
      "Set-Cookie",
      cookie.serialize(COOKIE_NAME, encrypted, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: tokenExp - Math.floor(Date.now() / 1000),
      })
    );
  }

  return accessToken;
}
