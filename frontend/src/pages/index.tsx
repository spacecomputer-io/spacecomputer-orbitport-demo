import { useState, useEffect } from "react";
import Head from "next/head";
import { Planet, generatePlanets } from "@/types/planet";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useOrbitport } from "@/hooks/useOrbitport";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Home() {
  const [isLaunching, setIsLaunching] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [randomSeed, setRandomSeed] = useState<Uint8Array | null>(null);
  const [planets, setPlanets] = useState<Planet[]>([]);
  const { getRandomSeed } = useOrbitport();

  // Generate initial blurred planets
  useEffect(() => {
    const dummyBytes = new Uint8Array(32);
    const initialPlanets = generatePlanets(dummyBytes);
    setPlanets(initialPlanets.slice(0, 5));
  }, []);

  const handleLaunch = async () => {
    if (isLaunching) return;
    setIsLaunching(true);

    try {
      const bytes = await getRandomSeed();
      setRandomSeed(bytes);
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
      }, 2000);
    } catch (error) {
      console.error("Launch failed:", error);
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

      <main className="min-h-screen flex flex-col items-center justify-between p-8 relative">
        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Cosmic Wayfinder</h1>
          <p className="text-sm opacity-80 max-w-md">
            Powered by real satellites in orbit using Orbitport&apos;s
            cEDGE/Crypto2 technology for true cosmic randomness.
          </p>
        </div>

        {/* Planets Display */}
        <div className="relative w-full h-[400px] flex items-center justify-center mb-8">
          <AnimatePresence>
            {planets.map((planet, index) => (
              <motion.div
                key={`${planet.id}-${index}`}
                className={`absolute ${index === 2 ? "z-10" : "z-0"}`}
                initial={{ x: 0 }}
                animate={{
                  x: (index - 2) * 150,
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
          </AnimatePresence>

          {/* Selected Planet Overlay */}
          {selectedPlanet && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <p className="text-lg mb-2">You&apos;ve discovered</p>
                <h2 className="text-3xl font-bold mb-4">
                  {selectedPlanet.name}
                </h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="px-4 py-2 bg-white/10 rounded-md hover:bg-white/20 transition-colors">
                      View Random Seed
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Random Seed Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p>
                        This planet was discovered using true random data from
                        satellites in orbit.
                      </p>
                      <div className="bg-black/20 p-4 rounded-md font-mono text-sm">
                        {randomSeed
                          ? Array.from(randomSeed)
                              .map((b) => b.toString(16).padStart(2, "0"))
                              .join(" ")
                          : "No seed available"}
                      </div>
                      <p className="text-sm opacity-80">
                        Source: Orbitport cEDGE/Crypto2 Satellite Network
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </motion.div>
            </div>
          )}
        </div>

        {/* Console */}
        <div className="relative w-full max-w-2xl">
          <Image
            src="/console.png"
            alt="Control Console"
            width={800}
            height={300}
            className="w-full"
          />
          <button
            onClick={handleLaunch}
            disabled={isLaunching}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                       text-2xl font-bold text-orange-300 hover:text-orange-400 
                       transition-colors disabled:opacity-50"
          >
            LAUNCH
          </button>
        </div>
      </main>
    </>
  );
}
