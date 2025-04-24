import { useCallback } from "react";

interface RandomSeedResponse {
  service: string;
  src: string;
  data: string;
  signature: {
    value: string;
    pk: string;
    algo: string;
  };
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
