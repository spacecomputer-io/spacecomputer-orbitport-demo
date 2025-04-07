import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const apiUrl = process.env.ORBITPORT_API_URL;
  if (!apiUrl) {
    return res.status(500).json({ message: "Missing Orbitport API URL" });
  }

  try {
    const response = await fetch(`${apiUrl}/api/v1/rand_seed`, {
      headers: {
        Authorization: req.headers.authorization || "",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get random seed");
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Failed to get random seed",
    });
  }
}
