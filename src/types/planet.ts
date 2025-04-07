export interface Planet {
  id: number;
  name: string;
  number: number;
  rarity: "Common" | "Rare" | "Legendary" | "Ultra Rare";
  image: string;
  lore?: string;
}

export const RARITY_COLORS = {
  Common: "text-blue-400",
  Rare: "text-purple-400",
  Legendary: "text-yellow-400",
  "Ultra Rare": "text-green-400",
} as const;

const PREFIXES = [
  "Xylon",
  "Nexus",
  "Astro",
  "Nova",
  "Cosmo",
  "Orbit",
  "Stellar",
  "Galaxy",
  "Quantum",
  "Celestial",
] as const;

const SUFFIXES = [
  "Prime",
  "Alpha",
  "Beta",
  "Gamma",
  "Delta",
  "Epsilon",
  "Zeta",
  "Theta",
  "Sigma",
  "Omega",
] as const;

const RARITY_DISTRIBUTION = {
  "Ultra Rare": { chance: 0.01, image: "/planets/durian.png" },
  Legendary: {
    chance: 0.05,
    image: (id: number) => `/planets/planet-${(id % 12) + 1}.png`,
  },
  Rare: {
    chance: 0.25,
    image: (id: number) => `/planets/planet-${(id % 12) + 1}.png`,
  },
  Common: {
    chance: 0.69,
    image: (id: number) => `/planets/planet-${(id % 12) + 1}.png`,
  },
} as const;

// Helper to generate planet names
const generatePlanetName = (id: number, randomBytes: Uint8Array): string => {
  const prefixIndex = randomBytes[0] % PREFIXES.length;
  const suffixIndex = randomBytes[1] % SUFFIXES.length;
  const randomNum = 100 + (((randomBytes[2] << 8) + randomBytes[3]) % 900);

  return `${PREFIXES[prefixIndex]} ${SUFFIXES[suffixIndex]} ${randomNum}`;
};

// Generate 100 planets with different rarities
export const generatePlanets = (randomBytes: Uint8Array): Planet[] => {
  const planets: Planet[] = [];
  const bytesPerPlanet = 4;
  const totalBytesNeeded = 100 * bytesPerPlanet;

  // Extend bytes if needed
  const extendedBytes = new Uint8Array(totalBytesNeeded);
  for (let i = 0; i < totalBytesNeeded; i++) {
    extendedBytes[i] = randomBytes[i % randomBytes.length];
  }

  // Generate planets
  for (let i = 0; i < 100; i++) {
    const startIndex = i * bytesPerPlanet;
    const planetBytes = extendedBytes.slice(
      startIndex,
      startIndex + bytesPerPlanet
    );
    const planetNumber = i + 1;

    // Determine rarity
    const rarityRoll = planetBytes[0] % 100;
    let cumulativeChance = 0;
    let selectedRarity: keyof typeof RARITY_DISTRIBUTION = "Common";

    for (const [rarity, { chance }] of Object.entries(RARITY_DISTRIBUTION)) {
      cumulativeChance += chance * 100;
      if (rarityRoll < cumulativeChance) {
        selectedRarity = rarity as keyof typeof RARITY_DISTRIBUTION;
        break;
      }
    }

    const rarityConfig = RARITY_DISTRIBUTION[selectedRarity];
    const image =
      typeof rarityConfig.image === "function"
        ? rarityConfig.image(planetBytes[0])
        : rarityConfig.image;

    planets.push({
      id: planetNumber,
      name: generatePlanetName(i, planetBytes),
      number: planetNumber,
      rarity: selectedRarity,
      image,
      lore:
        selectedRarity === "Ultra Rare"
          ? "The legendary Durian Planet, known for its pungent aroma that can be detected from neighboring galaxies. A delicacy so rare, it appears only to the most fortunate cosmic travelers."
          : `A mysterious planet in the cosmic frontier. Planet #${planetNumber} holds secrets yet to be discovered.`,
    });
  }

  return planets;
};
