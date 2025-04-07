import { useState, useEffect } from "react";
import Head from "next/head";
import { Planet, generatePlanets, RARITY_COLORS } from "@/types/planet";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useOrbitport } from "@/hooks/useOrbitport";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface RandomSeedResponse {
  value: string;
  sig: string;
  src: string;
}

// Helper to convert hex string to Uint8Array
const hexStringToUint8Array = (hexString: string): Uint8Array => {
  const pairs = hexString.match(/[\dA-F]{2}/gi) || [];
  return new Uint8Array(pairs.map((s) => parseInt(s, 16)));
};

export default function Home() {
  const [isLaunching, setIsLaunching] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [randomSeed, setRandomSeed] = useState<string | null>(null);
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [animationPlanets, setAnimationPlanets] = useState<Planet[]>([]);
  const { getRandomSeed } = useOrbitport();

  // Generate initial blurred planets and animation planets
  useEffect(() => {
    // Generate random initial bytes for display
    const dummyBytes = new Uint8Array(32);
    crypto.getRandomValues(dummyBytes);
    const initialPlanets = generatePlanets(dummyBytes);
    setPlanets(initialPlanets.slice(0, 5));

    // Generate separate set for animation
    const animBytes = new Uint8Array(32);
    crypto.getRandomValues(animBytes);
    setAnimationPlanets(generatePlanets(animBytes));
  }, []);

  const handleLaunch = async () => {
    if (isLaunching) return;
    setIsLaunching(true);
    setSelectedPlanet(null);

    try {
      toast.loading("Retrieving cosmic random seed...");
      const response = (await getRandomSeed()) as RandomSeedResponse;
      toast.dismiss();

      setRandomSeed(response.value);
      const bytes = hexStringToUint8Array(response.value);
      const newPlanets = generatePlanets(bytes);

      // Start roulette animation with random planets
      let animationIndex = 0;
      const rouletteInterval = setInterval(() => {
        setPlanets(() => {
          const newSet = animationPlanets.slice(
            animationIndex % 95,
            (animationIndex % 95) + 5
          );
          animationIndex += 1;
          return newSet;
        });
      }, 100);

      // Stop roulette after 2 seconds and show final planet
      setTimeout(() => {
        clearInterval(rouletteInterval);
        const selectedPlanet = newPlanets[bytes[0] % 100];
        setSelectedPlanet(selectedPlanet);
        setPlanets(newPlanets.slice(0, 5));
        setIsLaunching(false);
      }, 2000);
    } catch (error) {
      console.error("Launch failed:", error);
      toast.error("Failed to retrieve random seed");
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

      <main className="min-h-screen flex flex-col">
        {/* Title Section with flex layout */}
        <div className="flex-1 flex items-start justify-center mt-20">
          <div className="w-full max-w-4xl">
            <AnimatePresence mode="wait">
              {!selectedPlanet && !isLaunching ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <h1 className="text-4xl font-bold mb-4">Cosmic Wayfinder</h1>
                  <p className="text-sm opacity-80 max-w-md mx-auto">
                    Powered by real satellites in orbit using Orbitport&apos;s
                    cEDGE/Crypto2 technology for true cosmic randomness.
                  </p>
                </motion.div>
              ) : (
                selectedPlanet && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center"
                  >
                    <p className="text-lg opacity-80 mb-4">
                      You&apos;ve discovered
                    </p>
                    <h2 className="text-5xl font-bold tracking-wider">
                      {selectedPlanet.name}
                    </h2>
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Absolutely positioned planets section in the center of screen */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
          <div className="relative flex justify-center items-center h-[200px]">
            <AnimatePresence mode="wait">
              {!selectedPlanet ? (
                <motion.div
                  key="planet-grid"
                  className="flex items-center justify-center gap-8"
                >
                  {planets.map((planet, index) => (
                    <motion.div
                      key={`${planet.id}-${index}`}
                      initial={{ opacity: 1 }}
                      animate={{
                        scale: index === 2 ? 1.5 : 1,
                        filter: isLaunching ? "blur(0px)" : "blur(4px)",
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <Image
                        src={planet.image}
                        alt={planet.name}
                        width={100}
                        height={100}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="selected-planet"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative">
                    <Image
                      src={selectedPlanet.image}
                      alt={selectedPlanet.name}
                      width={200}
                      height={200}
                      priority
                    />
                    <p
                      className={`font-semibold mt-2 text-center ${
                        RARITY_COLORS[selectedPlanet.rarity]
                      }`}
                    >
                      {selectedPlanet.rarity}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Seed Dialog - Part of the absolutely positioned container */}
          {selectedPlanet && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-12"
            >
              <Dialog>
                <DialogTrigger asChild>
                  <button className="px-6 py-2 bg-white/10 rounded-md hover:bg-white/20 transition-colors border border-white/20 cursor-pointer">
                    View Random Seed
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Random Seed Details</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p>{selectedPlanet.lore}</p>
                    <div className="bg-white/20 p-4 rounded-md font-mono text-sm break-all">
                      {randomSeed || "No seed available"}
                    </div>
                    <p className="text-sm opacity-80">
                      Source: Orbitport cEDGE/Crypto2 Satellite Network
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>
          )}
        </div>

        {/* Console - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 flex justify-center">
          <div className="relative w-full max-w-2xl">
            <img src="/console.png" alt="Control Console" className="w-full" />
            {/* Desktop Launch Area */}
            <button
              className="absolute top-[27.8%] left-[37.2%] w-[190px] h-[84px] cursor-pointer disabled:cursor-not-allowed transition-opacity group"
              onClick={handleLaunch}
              disabled={isLaunching}
            >
              <img
                src="/button/button.png"
                alt="Launch Button"
                className="w-full h-full object-cover group-active:hidden"
              />
              <img
                src="/button/button-pressed.png"
                alt="Launch Button Pressed"
                className="w-full h-full object-cover hidden group-active:block"
              />
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
