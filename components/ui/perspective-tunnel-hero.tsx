"use client";

import {
  motion,
  type MotionValue,
  useTransform,
} from "framer-motion";
import Image from "next/image";

export interface StageDimensions {
  width: number;
  height: number;
  isMobile: boolean;
}

export interface TunnelPointer {
  x: MotionValue<number>;
  y: MotionValue<number>;
}

export interface TunnelProduct {
  src: string;
  title: string;
  description: string;
}

export const HERO_PRODUCTS: TunnelProduct[] = [
  {
    src: "/images/hero/products/produk-2.png",
    title: "Custom Poly Mailer",
    description: "Kemasan pengiriman",
  },
  {
    src: "/images/hero/products/produk-3.png",
    title: "Beverage Cup",
    description: "Kemasan minuman",
  },
  {
    src: "/images/hero/products/produk-4.png",
    title: "Kraft Food Box",
    description: "Kemasan makanan",
  },
  {
    src: "/images/hero/products/produk-5.png",
    title: "Food Container",
    description: "Wadah makanan",
  },
  {
    src: "/images/hero/products/produk-6.png",
    title: "Produk 6",
    description: "Pilihan kemasan",
  },
  {
    src: "/images/hero/products/produk-7.png",
    title: "Produk 7",
    description: "Pilihan kemasan",
  },
  {
    src: "/images/hero/products/produk-8.png",
    title: "Produk 8",
    description: "Pilihan kemasan",
  },
];

interface Placement {
  x: number;
  y: number;
  rotation: number;
  delay: number;
}

// Koordinat relatif terhadap titik tengah hero.
// Tiga gambar di atas dan empat gambar di bawah.
const DESKTOP_POSITIONS: Placement[] = [
  { x: -0.35, y: -0.34, rotation: -10, delay: 0 },
  { x: 0, y: -0.37, rotation: 4, delay: 0.12 },
  { x: 0.35, y: -0.34, rotation: 10, delay: 0.04 },
  { x: -0.38, y: 0.33, rotation: -8, delay: 0.08 },
  { x: -0.13, y: 0.37, rotation: 6, delay: 0.16 },
  { x: 0.13, y: 0.37, rotation: -6, delay: 0.1 },
  { x: 0.38, y: 0.33, rotation: 8, delay: 0.02 },
];

const MOBILE_POSITIONS: Placement[] = [
  { x: -0.32, y: -0.36, rotation: -8, delay: 0 },
  { x: 0, y: -0.39, rotation: 3, delay: 0.12 },
  { x: 0.32, y: -0.36, rotation: 8, delay: 0.04 },
  { x: -0.36, y: 0.34, rotation: -6, delay: 0.08 },
  { x: -0.12, y: 0.38, rotation: 4, delay: 0.16 },
  { x: 0.12, y: 0.38, rotation: -4, delay: 0.1 },
  { x: 0.36, y: 0.34, rotation: 6, delay: 0.02 },
];

const PERSPECTIVE = 1000;
const START_DEPTH = -180;
const END_DEPTH = 620;

interface ProductImageProps {
  item: TunnelProduct;
  position: Placement;
  progress: MotionValue<number>;
  pointer: TunnelPointer;
  stage: StageDimensions;
  reducedMotion: boolean;
}

function ProductImage({
  item,
  position,
  progress,
  pointer,
  stage,
  reducedMotion,
}: ProductImageProps) {
  const sceneHeight = Math.max(
    stage.height,
    stage.width <= 640 ? 620 : 680,
  );

  const localProgress = useTransform(
    progress,
    [position.delay, 1],
    [0, 1],
  );

  const depth = useTransform(
    localProgress,
    [0, 0.55, 1],
    [START_DEPTH, 120, END_DEPTH],
  );

  const opacity = useTransform(
    localProgress,
    [0, 0.7, 1],
    [1, 1, 0],
  );

  const width = stage.isMobile
    ? Math.min(stage.width * 0.19, 110)
    : Math.min(stage.width * 0.115, sceneHeight * 0.2, 180);

  const baseX = position.x * stage.width;
  const baseY = position.y * sceneHeight;

  // Menjaga posisi awal sesuai koordinat meski berada di kedalaman.
  const depthCompensation =
    (PERSPECTIVE - START_DEPTH) / PERSPECTIVE;

  const pointerStrength = stage.isMobile ? 0 : 10;

  const transform = useTransform(() => {
    const currentProgress = localProgress.get();

    const x =
      baseX * depthCompensation -
      pointer.x.get() * pointerStrength;

    const y =
      baseY * depthCompensation -
      pointer.y.get() * pointerStrength;

    const rotation =
      position.rotation * (1 + currentProgress * 0.35);

    const rotationY =
      -pointer.x.get() * (stage.isMobile ? 0 : 4);

    return (
      `translate3d(` +
      `calc(-50% + ${x}px), ` +
      `calc(-50% + ${y}px), ` +
      `${depth.get()}px) ` +
      `rotateY(${rotationY}deg) ` +
      `rotateZ(${rotation}deg)`
    );
  });

  const staticTransform =
    `translate3d(` +
    `calc(-50% + ${baseX}px), ` +
    `calc(-50% + ${baseY}px), ` +
    `0px) rotateZ(${position.rotation}deg)`;

  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      style={{
        width,
        height: width * 1.12,
        transform: reducedMotion ? staticTransform : transform,
        opacity: reducedMotion ? 1 : opacity,
      }}
    >
      <Image
        src={item.src}
        alt=""
        fill
        sizes="(max-width: 767px) 110px, 180px"
        draggable={false}
        className="select-none object-contain"
      />
    </motion.div>
  );
}

interface PerspectiveTunnelHeroProps {
  progress: MotionValue<number>;
  pointer: TunnelPointer;
  stage: StageDimensions;
  reducedMotion: boolean;
}

export default function PerspectiveTunnelHero({
  progress,
  pointer,
  stage,
  reducedMotion,
}: PerspectiveTunnelHeroProps) {
  const positions = stage.isMobile
    ? MOBILE_POSITIONS
    : DESKTOP_POSITIONS;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10"
      style={{
        perspective: `${PERSPECTIVE}px`,
        perspectiveOrigin: "50% 50%",
        transformStyle: "preserve-3d",
      }}
      aria-hidden="true"
    >
      {HERO_PRODUCTS.map((item, index) => (
        <ProductImage
          key={item.src}
          item={item}
          position={positions[index]}
          progress={progress}
          pointer={pointer}
          stage={stage}
          reducedMotion={reducedMotion}
        />
      ))}
    </div>
  );
}