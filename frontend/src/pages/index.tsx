import { useState } from "react";
import Head from "next/head";
import { Planet, generatePlanets } from "@/types/planet";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useOrbitport } from "@/hooks/useOrbitport";

export default function Home() {
  const [isLaunching, setIsLaunching] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const { getRandomSeed } = useOrbitport();

  const handleLaunch = async () => {
    setIsLaunching(true);
    try {
      const randomBytes = await getRandomSeed();
      const planets = generatePlanets(randomBytes);
      const randomNum = (randomBytes[0] + (randomBytes[1] << 8)) % 100;
      const selectedPlanet = planets[randomNum];
      setSelectedPlanet(selectedPlanet);
    } catch (error) {
      console.error("Launch failed:", error);
      alert("Failed to launch. Please try again!");
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <>
      <Head>
        <title>Spacecoin Orbitport Demo</title>
        <meta
          name="description"
          content="Demo showcasing the Spacecoin cTRNG functions"
        />
      </Head>

      <main className="min-h-screen text-white relative overflow-hidden">
        {/* Stars background */}
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-50 bg-repeat" />

        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <h1 className="text-4xl md:text-6xl font-bold text-center text-white">
              Cosmic Launch Lottery
            </h1>

            <AnimatePresence mode="wait">
              {!selectedPlanet ? (
                <motion.div
                  key="launch"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center gap-6"
                >
                  <div className="w-48 h-48 md:w-64 md:h-64 relative">
                    <Image
                      src="/rocket.svg"
                      alt="Spaceship"
                      width={256}
                      height={256}
                      className="w-full h-full object-contain"
                      priority
                    />
                  </div>

                  <button
                    onClick={handleLaunch}
                    disabled={isLaunching}
                    className="px-8 py-4 text-lg font-bold rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:shadow-[0_0_30px_rgba(147,51,234,0.7)]"
                  >
                    {isLaunching ? "Launching..." : "Launch!"}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-6 max-w-md w-full text-center"
                >
                  <div className="w-64 h-64 md:w-80 md:h-80 relative">
                    <div
                      className="w-full h-full rounded-full overflow-hidden"
                      style={{ backgroundColor: selectedPlanet.color }}
                    >
                      <Image
                        src={selectedPlanet.image}
                        alt={selectedPlanet.name}
                        width={320}
                        height={320}
                        className="w-full h-full object-contain animate-float mix-blend-overlay"
                        priority
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold">
                      {selectedPlanet.name}
                    </h2>
                    <p className="text-xl font-semibold text-gray-400">
                      Planet #{selectedPlanet.number}
                    </p>
                    <p
                      className={`text-xl font-semibold ${
                        selectedPlanet.rarity === "Legendary"
                          ? "text-yellow-400"
                          : selectedPlanet.rarity === "Rare"
                          ? "text-purple-400"
                          : "text-blue-400"
                      }`}
                    >
                      {selectedPlanet.rarity}
                    </p>
                    <p className="text-gray-300">{selectedPlanet.lore}</p>
                  </div>

                  <button
                    onClick={() => setSelectedPlanet(null)}
                    className="px-6 py-3 text-sm font-semibold rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    Launch Again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 text-center text-sm text-gray-400 max-w-md">
              <p>
                Powered by real satellites in orbit using Orbitport&apos;s
                cEDGE/Crypto2 technology for true cosmic randomness.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
