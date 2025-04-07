import Image from "next/image";
import { cn } from "@/lib/utils";

interface ColoredPlanetImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  color: string;
  className?: string;
  priority?: boolean;
}

export function ColoredPlanetImage({
  src,
  alt,
  width,
  height,
  color,
  className,
  priority,
}: ColoredPlanetImageProps) {
  // Extract HSL values from the color string with more flexible pattern
  const hslMatch = color.match(/hsl\((\d+)[,\s]+(\d+)%[,\s]+(\d+)%\)/i);

  if (!hslMatch) {
    console.warn(`Invalid HSL color format: ${color}`);
    return (
      <div className={cn("relative inline-block", className)}>
        <div className="relative" style={{ width, height }}>
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className="rounded-full"
            priority={priority}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      </div>
    );
  }

  const [, hue, saturation, lightness] = hslMatch;

  return (
    <div className={cn("relative inline-block", className)}>
      <div className="relative" style={{ width, height }}>
        <div
          className="absolute inset-0 rounded-full mix-blend-overlay z-10"
          style={{
            backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
            opacity: 0.5,
          }}
        />
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="rounded-full"
          priority={priority}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
    </div>
  );
}
