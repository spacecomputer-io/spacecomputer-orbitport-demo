import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import * as cookie from "cookie";

const AUTH_SECRET = (
  process.env.AUTH_SECRET || "dev_secret_32_bytes_long_for_demo"
)
  .padEnd(32, "!")
  .slice(0, 32);
const COOKIE_NAME = "orbitport_token";
const TOKEN_EXPIRE_BUFFER = 60; // Refresh token if expiring within this buffer

interface TokenData {
  access_token: string;
  exp: number;
}

/**
 * Encrypts a string using AES-256-GCM encryption.
 *
 * @param text - The plaintext string to encrypt.
 * @returns The encrypted string in the format: iv.tag.encrypted
 */
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

/**
 * Decrypts a string encrypted with AES-256-GCM.
 *
 * @param data - The encrypted string to decrypt (format: iv.tag.encrypted).
 * @returns The decrypted plaintext string, or null if decryption fails.
 */
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

/**
 * Parses a JWT and extracts its expiration timestamp.
 *
 * @param token - The JWT string to parse.
 * @returns An object containing the access token and its expiration, or null if parsing fails.
 */
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

/**
 * Requests a new access token from the Orbitport API using client credentials.
 *
 * @returns The access token string, or null if the request fails.
 * @throws Error if required authentication configuration is missing.
 */
async function generateAccessToken(): Promise<string | null> {
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

/**
 * Retrieves the encrypted token from request cookies.
 * @param req - Next.js API request object
 * @returns The encrypted token string, or null if not found
 */
function getEncryptedTokenFromCookies(req: NextApiRequest): string | null {
  const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
  return cookies[COOKIE_NAME] || null;
}

/**
 * Sets the encrypted access token as an HTTP-only cookie in the response.
 * @param res - Next.js API response object
 * @param token - The access token to encrypt and set
 * @param exp - Expiration time (epoch seconds) of the token
 */
function setEncryptedTokenCookie(
  res: NextApiResponse,
  token: string,
  exp: number
): void {
  const encrypted = encrypt(token);
  res.setHeader(
    "Set-Cookie",
    cookie.serialize(COOKIE_NAME, encrypted, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: exp - Math.floor(Date.now() / 1000),
    })
  );
}

/**
 * Retrieves a valid access token from cookies or generates a new one if expired or missing.
 * Handles encryption/decryption, JWT parsing, and cookie management.
 *
 * @param req - Next.js API request object
 * @param res - Next.js API response object
 * @returns The valid access token string, or null if unable to retrieve
 */
export async function getValidToken(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<string | null> {
  try {
    const encryptedToken = getEncryptedTokenFromCookies(req);
    let accessToken: string | null = null;

    if (encryptedToken) {
      const decrypted = decrypt(encryptedToken);
      const parsed = parseToken(decrypted);
      if (parsed) {
        const now = Math.floor(Date.now() / 1000);
        // Only use token if not expired and not about to expire
        if (parsed.exp > now + TOKEN_EXPIRE_BUFFER) {
          accessToken = parsed.access_token;
        } else {
          console.log("Token expired or about to expire");
        }
      }
    }

    // If no valid token, generate a new one
    if (!accessToken) {
      accessToken = await generateAccessToken();
      if (!accessToken) {
        console.error("Failed to get new access token");
        return null;
      }
      const parsed = parseToken(accessToken);
      if (!parsed) {
        console.error("Failed to parse new token");
        return null;
      }
      setEncryptedTokenCookie(res, accessToken, parsed.exp);
    }

    return accessToken;
  } catch (error) {
    console.error("Error in getValidToken:", error);
    return null;
  }
}
