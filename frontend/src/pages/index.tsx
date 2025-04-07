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
  const { getRandomSeed } = useOrbitport();

  // Generate initial blurred planets
  useEffect(() => {
    // Generate random initial bytes
    const dummyBytes = new Uint8Array(32);
    crypto.getRandomValues(dummyBytes);
    const initialPlanets = generatePlanets(dummyBytes);
    setPlanets(initialPlanets.slice(0, 5));
  }, []);

  const handleLaunch = async () => {
    if (isLaunching) return;
    setIsLaunching(true);
    setSelectedPlanet(null); // Reset selected planet

    try {
      toast.loading("Retrieving cosmic random seed...");
      const response = (await getRandomSeed()) as RandomSeedResponse;
      toast.dismiss();

      // Store the hex string
      setRandomSeed(response.value);

      // Convert hex string to bytes
      const bytes = hexStringToUint8Array(response.value);
      const newPlanets = generatePlanets(bytes);

      // Start roulette animation
      const rouletteInterval = setInterval(() => {
        setPlanets((prevPlanets) => {
          const shifted = [...prevPlanets];
          shifted.unshift(shifted.pop()!);
          return shifted;
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

      <main className="min-h-screen flex flex-col relative">
        {/* Fixed height container for consistent layout */}
        <div className="flex-1 flex flex-col">
          {/* Title Section - Fixed height space */}
          <div className="h-[180px] flex items-center justify-center">
            <AnimatePresence>
              {!selectedPlanet && !isLaunching && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <h1 className="text-4xl font-bold mb-4">Cosmic Wayfinder</h1>
                  <p className="text-sm opacity-80 max-w-md">
                    Powered by real satellites in orbit using Orbitport&apos;s
                    cEDGE/Crypto2 technology for true cosmic randomness.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Planets Display - Always centered */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-full flex justify-center">
              {/* Initial Planets */}
              <AnimatePresence>
                {!selectedPlanet && (
                  <div className="flex items-center justify-center gap-8">
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
                          className="rounded-full"
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>

              {/* Selected Planet Overlay */}
              <AnimatePresence>
                {selectedPlanet && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center text-center"
                  >
                    <p className="text-lg mb-2 opacity-80">
                      You&apos;ve discovered
                    </p>
                    <h2 className="text-5xl font-bold mb-8 tracking-wider">
                      {selectedPlanet.name}
                    </h2>
                    <div className="relative mb-8">
                      <Image
                        src={selectedPlanet.image}
                        alt={selectedPlanet.name}
                        width={200}
                        height={200}
                        priority
                      />
                      <p
                        className={`text-sm font-semibold mt-2 ${
                          RARITY_COLORS[selectedPlanet.rarity]
                        }`}
                      >
                        {selectedPlanet.rarity}
                      </p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="px-6 py-2 bg-white/10 rounded-md hover:bg-white/20 transition-colors border border-white/20">
                          View Random Seed
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Random Seed Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p>{selectedPlanet.lore}</p>
                          <div className="bg-black/20 p-4 rounded-md font-mono text-sm break-all">
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
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Console */}
        <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-8">
          <div className="relative w-full max-w-2xl">
            <Image
              src="/console.png"
              alt="Control Console"
              width={800}
              height={300}
              className="w-full"
            />
            {/* Desktop Launch Area (invisible button) */}
            <div
              className="absolute hidden md:block top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                        w-[200px] h-[60px] cursor-pointer"
              onClick={!isLaunching ? handleLaunch : undefined}
              style={{ opacity: isLaunching ? 0.5 : 1 }}
            />
            {/* Mobile Launch Button */}
            <button
              onClick={handleLaunch}
              disabled={isLaunching}
              className="md:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                       text-2xl font-bold text-white px-8 py-3 rounded-md
                       bg-[#C73314] disabled:opacity-50 transition-opacity"
            >
              LAUNCH
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
