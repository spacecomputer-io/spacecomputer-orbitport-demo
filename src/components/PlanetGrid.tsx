import { Planet } from "@/types/planet";
import { motion } from "framer-motion";
import Image from "next/image";

interface PlanetGridProps {
  planets: Planet[];
  isLaunching: boolean;
}

export default function PlanetGrid({ planets, isLaunching }: PlanetGridProps) {
  return (
    <motion.div
      key="planet-grid"
      className="flex items-center justify-center gap-4 lg:gap-8"
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
          className="relative p-1"
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
  );
}
