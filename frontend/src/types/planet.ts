export interface Planet {
  id: number;
  name: string;
  number: number;
  rarity: "Common" | "Rare" | "Legendary";
  image: string;
  color: string;
  lore?: string;
}

export const RARITY_COLORS = {
  Common: "text-blue-400",
  Rare: "text-purple-400",
  Legendary: "text-yellow-400",
} as const;

// Helper to generate planet names
const generatePlanetName = (id: number, randomBytes: Uint8Array): string => {
  const prefixes = [
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
  ];
  const suffixes = [
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
  ];

  // Use random bytes to select prefix and suffix
  const prefixIndex = randomBytes[0] % prefixes.length;
  const suffixIndex = randomBytes[1] % suffixes.length;

  // Generate a random number between 100-999 using the remaining bytes
  const randomNum = 100 + (((randomBytes[2] << 8) + randomBytes[3]) % 900);

  return `${prefixes[prefixIndex]} ${suffixes[suffixIndex]} ${randomNum}`;
};

// Helper to generate random HSL color
const generateRandomColor = (randomBytes: Uint8Array): string => {
  // Use different bytes for different color components
  const hue = (randomBytes[4] * 137.508) % 360; // Golden angle approximation
  const saturation = 70 + (randomBytes[5] % 30); // 70-100%
  const lightness = 40 + (randomBytes[6] % 20); // 40-60%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// Generate 100 planets with different rarities
export const generatePlanets = (randomBytes: Uint8Array): Planet[] => {
  const planets: Planet[] = [];

  // We need 7 bytes per planet, so ensure we have enough bytes
  const bytesPerPlanet = 7;
  const totalBytesNeeded = 100 * bytesPerPlanet;

  // If we don't have enough bytes, repeat the sequence
  const extendedBytes = new Uint8Array(totalBytesNeeded);
  for (let i = 0; i < totalBytesNeeded; i++) {
    extendedBytes[i] = randomBytes[i % randomBytes.length];
  }

  // Generate planets using the extended bytes
  for (let i = 0; i < 100; i++) {
    const startIndex = i * bytesPerPlanet;
    const planetBytes = extendedBytes.slice(
      startIndex,
      startIndex + bytesPerPlanet
    );

    const planetNumber = i + 1;
    // Use modulo 12 to select from 12 PNG images
    const imageIndex = (planetBytes[0] % 12) + 1;

    planets.push({
      id: planetNumber,
      name: generatePlanetName(i, planetBytes),
      number: planetNumber,
      rarity: i < 70 ? "Common" : i < 95 ? "Rare" : "Legendary",
      image: `/planets/planet-${imageIndex}.png`,
      color: generateRandomColor(planetBytes),
      lore: `A mysterious planet in the cosmic frontier. Planet #${planetNumber} holds secrets yet to be discovered.`,
    });
  }

  return planets;
};
