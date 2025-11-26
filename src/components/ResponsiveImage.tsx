"use client";

import Image, { type ImageProps } from "next/image";

type Props = Omit<ImageProps, "fill" | "sizes"> & {
  /** standaard: true */
  fill?: boolean;
  /** standaard: responsive sizes */
  sizes?: string;
  /** extra classname */
  className?: string;
};

export default function ResponsiveImage({
  fill = true,
  sizes,
  className,
  ...props
}: Props) {
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