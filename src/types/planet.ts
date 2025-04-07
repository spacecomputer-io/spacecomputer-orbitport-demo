export interface Planet {
  id: number;
  name: string;
  number: number;
  rarity: "Common" | "Rare" | "Legendary" | "Ultra Rare";
  image: string;
  color: string;
  lore?: string;
}

export const RARITY_COLORS = {
  Common: "text-blue-400",
  Rare: "text-purple-400",
  Legendary: "text-yellow-400",
  "Ultra Rare": "text-green-400",
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
  const hue = Math.floor((randomBytes[4] * 137.508) % 360); // Golden angle approximation
  const saturation = Math.floor(70 + (randomBytes[5] % 30)); // 70-100%
  const lightness = Math.floor(40 + (randomBytes[6] % 20)); // 40-60%
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

    // Determine rarity and image
    let rarity: Planet["rarity"];
    let image: string;

    // Use first byte for rarity determination
    const rarityRoll = planetBytes[0] % 100;

    if (rarityRoll < 1) {
      // 1% chance for Ultra Rare
      rarity = "Ultra Rare";
      image = "/planets/durian.png";
    } else if (rarityRoll < 6) {
      // 5% chance for Legendary
      rarity = "Legendary";
      image = `/planets/planet-${(planetBytes[0] % 12) + 1}.png`;
    } else if (rarityRoll < 31) {
      // 25% chance for Rare
      rarity = "Rare";
      image = `/planets/planet-${(planetBytes[0] % 12) + 1}.png`;
    } else {
      // 69% chance for Common
      rarity = "Common";
      image = `/planets/planet-${(planetBytes[0] % 12) + 1}.png`;
    }

    planets.push({
      id: planetNumber,
      name: generatePlanetName(i, planetBytes),
      number: planetNumber,
      rarity,
      image,
      color: generateRandomColor(planetBytes),
      lore:
        rarity === "Ultra Rare"
          ? "The legendary Durian Planet, known for its pungent aroma that can be detected from neighboring galaxies. A delicacy so rare, it appears only to the most fortunate cosmic travelers."
          : `A mysterious planet in the cosmic frontier. Planet #${planetNumber} holds secrets yet to be discovered.`,
    });
  }

  return planets;
};
