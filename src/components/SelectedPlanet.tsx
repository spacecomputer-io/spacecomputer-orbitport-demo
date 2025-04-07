import { Planet, RARITY_COLORS } from "@/types/planet";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SelectedPlanetProps {
  planet: Planet;
  randomSeed: string | null;
}

export default function SelectedPlanet({
  planet,
  randomSeed,
}: SelectedPlanetProps) {
  return (
    <motion.div
      key="selected-planet"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center"
    >
      <div className="relative">
        <Image
          src={planet.image}
          alt={planet.name}
          width={200}
          height={200}
          priority
        />
        <p
          className={`font-semibold mt-2 text-center ${
            RARITY_COLORS[planet.rarity]
          }`}
        >
          {planet.rarity}
        </p>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-12"
      >
        <Dialog>
          <DialogTrigger asChild>
            <button className="px-4 lg:px-6 py-2 bg-white/10 rounded-md hover:bg-white/20 transition-colors border border-white/20 cursor-pointer w-max">
              View Random Seed
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Random Seed Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>{planet.lore}</p>
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
    </motion.div>
  );
}
