import { useCallback } from "react";

interface RandomSeedResponse {
  value: string;
  sig: string;
  src: string;
}

export function useOrbitport() {
  const getRandomSeed = useCallback(async (): Promise<RandomSeedResponse> => {
    try {
      const response = await fetch("/api/random");
      if (!response.ok) {
        throw new Error("Failed to get random seed");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error getting random seed:", error);
      throw error;
    }
  }, []);

  return {
    getRandomSeed,
  };
}
