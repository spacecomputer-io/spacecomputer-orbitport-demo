import { useCallback } from "react";
import { useAuthStore } from "@/store/auth";

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface RandomSeedResponse {
  value: string;
  sig: string;
  src: string;
}

export function useOrbitport() {
  const { accessToken, setToken, isTokenValid } = useAuthStore();

  const getAccessToken = useCallback(async (): Promise<string> => {
    // If we have a valid token, return it
    if (isTokenValid() && accessToken) {
      return accessToken;
    }

    try {
      const response = await fetch("/api/auth");
      if (!response.ok) {
        throw new Error("Failed to get access token");
      }

      const data: TokenResponse = await response.json();
      setToken(data.access_token, data.expires_in);
      return data.access_token;
    } catch (error) {
      console.error("Error getting access token:", error);
      throw error;
    }
  }, [accessToken, isTokenValid, setToken]);

  const getRandomSeed = useCallback(async (): Promise<RandomSeedResponse> => {
    const token = await getAccessToken();

    try {
      const response = await fetch("/api/random", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get random seed");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error getting random seed:", error);
      throw error;
    }
  }, [getAccessToken]);

  return {
    getRandomSeed,
  };
}
