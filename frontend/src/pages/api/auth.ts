import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const clientId = process.env.ORBITPORT_CLIENT_ID;
  const clientSecret = process.env.ORBITPORT_CLIENT_SECRET;
  const authUrl = process.env.ORBITPORT_AUTH_URL;

  if (!clientId || !clientSecret || !authUrl) {
    return res
      .status(500)
      .json({ message: "Missing Orbitport authentication configuration" });
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
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error getting access token:", error);
    return res
      .status(500)
      .json({ message: "Failed to authenticate with Orbitport" });
  }
}
