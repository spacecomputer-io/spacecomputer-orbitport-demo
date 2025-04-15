import { NextApiRequest, NextApiResponse } from "next";
import { getValidToken } from "@/lib/auth";

const ORBITPORT_API_URL = process.env.ORBITPORT_API_URL;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    if (!ORBITPORT_API_URL) {
      return res.status(500).json({ message: "Missing Orbitport API URL" });
    }

    // Get valid token using our auth utility
    const accessToken = await getValidToken(req, res);
    if (!accessToken) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    // Call downstream API with access token
    const response = await fetch(`${ORBITPORT_API_URL}/api/v1/rand_seed`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Orbitport API error:", errorText);
      return res
        .status(502)
        .json({ message: "Failed to get random seed", error: errorText });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error("Error in random endpoint:", err);
    return res.status(500).json({
      message: "Failed to get random seed",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
}
