import Image from "next/image";
import type { SiteImage } from "@/lib/images/stock";

/**
 * A photo that fills its frame (the parent sets position and aspect ratio),
 * cropped around the focal point, with a blur placeholder when one exists.
 */
export function Photo({
  image,
  sizes,
  className,
  preload = false,
}: {
  image: SiteImage;
  sizes: string;
  className?: string;
  /** Set on the hero (the LCP image) only. */
  preload?: boolean;
}) {
  return (
    <Image
      src={image.src}
      alt={image.alt}
      fill
      sizes={sizes}
      quality={preload ? 70 : 80}
      preload={preload}
      placeholder={image.blurDataURL ? "blur" : "empty"}
      blurDataURL={image.blurDataURL}
      className={className}
      style={{ objectFit: "cover", objectPosition: `${image.focal[0]}% ${image.focal[1]}%` }}
    />
  );
}
