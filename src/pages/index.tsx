import { useState, useEffect } from "react";
import Head from "next/head";
import { Planet, generatePlanets } from "@/types/planet";
import { motion, AnimatePresence } from "framer-motion";
import { useOrbitport } from "@/hooks/useOrbitport";
import { toast } from "sonner";
import SelectedPlanet from "@/components/SelectedPlanet";
import PlanetGrid from "@/components/PlanetGrid";
import { ChevronDown } from "lucide-react";
import Image from "next/image";

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

  // Generate initial planets
  useEffect(() => {
    const dummyBytes = new Uint8Array(32);
    crypto.getRandomValues(dummyBytes);
    const initialPlanets = generatePlanets(dummyBytes);
    setPlanets(initialPlanets.slice(0, 5));
    setAnimationPlanets(initialPlanets);
  }, []);

  const handleLaunch = async () => {
    if (isLaunching) return;
    setIsLaunching(true);
    setSelectedPlanet(null);

    try {
      toast.loading("Retrieving cosmic random seed...");
      const response = await getRandomSeed();
      toast.dismiss();

      setRandomSeed(response.value);
      const bytes = hexStringToUint8Array(response.value);
      const newPlanets = generatePlanets(bytes);

      // Start roulette animation
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
      }, 150); // Optimized for mobile performance

      // Stop roulette and show final planet
      setTimeout(() => {
        clearInterval(rouletteInterval);
        const selectedPlanet = newPlanets[bytes[0] % 100];
        setSelectedPlanet(selectedPlanet);
        setPlanets(newPlanets.slice(0, 5));
        setIsLaunching(false);
      }, 2500); // Longer duration for smoother animation
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
        {/* Title Section */}
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
                    <p className="text-base lg:text-lg opacity-80 mb-2 lg:mb-4">
                      You&apos;ve discovered
                    </p>
                    <h2 className="text-2xl lg:text-5xl font-bold tracking-wider">
                      {selectedPlanet.name}
                    </h2>
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Planets Section */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 w-full px-6">
          <div className="relative flex justify-center items-center h-[200px]">
            <AnimatePresence mode="wait">
              {!selectedPlanet ? (
                <PlanetGrid planets={planets} isLaunching={isLaunching} />
              ) : (
                <SelectedPlanet
                  planet={selectedPlanet}
                  randomSeed={randomSeed}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Console */}
        <div className="fixed bottom-0 left-0 right-0 flex justify-center">
          <div className="relative w-full max-w-2xl">
            <Image
              src="/console.png"
              alt="Control Console"
              width={1200}
              height={600}
              className="w-full"
              priority
            />
            <div className="absolute top-[27.8%] left-[37%] w-[28.5%] aspect-[458/201]">
              <button
                className="absolute inset-0 cursor-pointer disabled:cursor-not-allowed transition-all duration-500 group touch-manipulation"
                onClick={handleLaunch}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleLaunch();
                }}
                disabled={isLaunching}
                aria-label="Launch"
              >
                <div className="relative w-full h-full">
                  <Image
                    src="/button/button.png"
                    alt="Launch Button"
                    fill
                    className="object-cover group-active:hidden select-none"
                    priority
                  />
                  <Image
                    src="/button/button-pressed.png"
                    alt="Launch Button Pressed"
                    fill
                    className="object-cover hidden group-active:block select-none"
                    priority
                  />
                </div>
              </button>

              {/* Floating Caret */}
              <AnimatePresence>
                {!selectedPlanet && !isLaunching && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: -10 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
                  >
                    <ChevronDown className="w-6 h-6 text-white/80" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
