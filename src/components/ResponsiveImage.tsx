// src/components/ui/ResponsiveImage.tsx
"use client";

import Image from "next/image";
import type { ComponentProps } from "react";

/**
 * ✅ ResponsiveImage
 * Veilige wrapper rond Next.js <Image /> die automatisch een `sizes` attribuut toevoegt
 * voor fill-images. Hiermee verdwijnen de “missing sizes” waarschuwingen.
 *
 * ➜ Gebruik deze component overal in plaats van <Image fill />.
 *    Bijvoorbeeld:
 *
 *    <ResponsiveImage src="/foto.jpg" alt="Strand" />
 *    <ResponsiveImage src={f.image} alt={f.title} className="rounded-xl" priority />
 *
 * Standaard instellingen:
 * - fill = true
 * - object-cover styling
 * - sizes = "(max-width:640px) 100vw, (max-width:1024px) 50vw, (max-width:1536px) 33vw, 25vw"
 */

type NextImageProps = ComponentProps<typeof Image>;

type Props = Omit<NextImageProps, "sizes" | "fill" | "className"> & {
  sizes?: string;
  fill?: boolean;
  className?: string;
};

export default function ResponsiveImage({
  sizes,
  className,
  fill = true,
  ...props
}: Props) {
  // ✅ Standaard responsive sizes
  const defaultSizes =
    sizes ??
    "(max-width:640px) 100vw, (max-width:1024px) 50vw, (max-width:1536px) 33vw, 25vw";

  return (
    <Image
      {...props}
      fill={fill}
      sizes={defaultSizes}
      className={`object-cover ${className ?? ""}`}
    />
  );
}
