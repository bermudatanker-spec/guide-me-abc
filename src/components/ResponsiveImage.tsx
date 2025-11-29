"use client";

import Image, { type ImageProps } from "next/image";

type Props = Omit<ImageProps, "fill" | "sizes"> & {
  fill?: boolean;
  sizes?: string;
  className?: string;
};

export default function ResponsiveImage({
  fill = true,
  sizes,
  className,
  alt = "",          // 👈 ESLint FIX: alt is verplicht → default leeg
  ...props
}: Props) {
  const defaultSizes =
    sizes ??
    "(max-width:640px) 100vw, (max-width:1024px) 50vw, (max-width:1536px) 33vw, 25vw";

  return (
    <Image
      {...props}
      alt={alt}         // 👈 Alt wordt gegarandeerd meegegeven
      fill={fill}
      sizes={defaultSizes}
      className={`object-cover ${className ?? ""}`}
    />
  );
}