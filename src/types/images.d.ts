declare module "*.png" {
  const src: import("next/dist/shared/lib/get-img-props").StaticImageData;
  export default src;
}
declare module "*.jpg" {
  const src: import("next/dist/shared/lib/get-img-props").StaticImageData;
  export default src;
}
declare module "*.jpeg" {
  const src: import("next/dist/shared/lib/get-img-props").StaticImageData;
  export default src;
}
declare module "*.webp" {
  const src: import("next/dist/shared/lib/get-img-props").StaticImageData;
  export default src;
}
declare module "*.avif" {
  const src: import("next/dist/shared/lib/get-img-props").StaticImageData;
  export default src;
}
declare module "*.svg" {
  // If you import SVGs as files for <Image>, keep as StaticImageData.
  // If you plan to use SVGR (as React components), adjust this block accordingly.
  const src: import("next/dist/shared/lib/get-img-props").StaticImageData;
  export default src;
}