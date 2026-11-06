"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { MessageCircle, Package, Search } from "lucide-react";

import styles from "./hero-section.module.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const PRODUCTS = [
  {
    file: "produk-2.png",
    title: "Custom Poly Mailer",
  },
  {
    file: "produk-3.png",
    title: "Beverage Cup",
  },
  {
    file: "produk-4.png",
    title: "Kraft Food Box",
  },
  {
    file: "produk-5.png",
    title: "Food Container",
  },
  {
    file: "produk-6.png",
    title: "Produk 6",
  },
  {
    file: "produk-7.png",
    title: "Produk 7",
  },
  {
    file: "produk-8.png",
    title: "Produk 8",
  },
];

const ACTIONS = [
  {
    href: "#kontak",
    label: "Konsultasi Sekarang",
    Icon: MessageCircle,
  },
  {
    href: "#produk",
    label: "Jelajahi Produk",
    Icon: Package,
  },
  {
    href: "#tracking",
    label: "Cek Pesananmu",
    Icon: Search,
  },
];

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;

      if (!section) return;

      const stage =
        section.querySelector<HTMLElement>("[data-stage]")!;

      const title =
        section.querySelector<HTMLElement>("[data-title]")!;

      const cue =
        section.querySelector<HTMLElement>("[data-cue]")!;

      const cta =
        section.querySelector<HTMLElement>("[data-cta]")!;

      const products = gsap.utils.toArray<HTMLElement>(
        "[data-product]",
        section,
      );

      const planes = gsap.utils.toArray<HTMLElement>(
        "[data-parallax]",
        section,
      );

      const media = gsap.matchMedia();

      media.add(
        {
          reduce: "(prefers-reduced-motion: reduce)",
          mobile: "(max-width: 767px)",
          desktop: "(min-width: 768px)",
        },
        (context) => {
          const { reduce, mobile } = context.conditions!;

          if (reduce) {
            gsap.set(title, {
              scale: 1,
              opacity: 1,
            });

            gsap.set(products, {
              autoAlpha: 0,
            });

            return;
          }

          const farZ = mobile ? -1200 : -1700;
          const nearZ = mobile ? 350 : 500;

          // Posisi menyebar mengikuti pola referensi.
          const setPositions = () => {
            const { width, height } =
              stage.getBoundingClientRect();

            products.forEach((product, index) => {
              const angle =
                index * 137.5 * (Math.PI / 180);

              const radiusX =
                width * (0.28 + (index % 3) * 0.08);

              const radiusY =
                height * (0.26 + (index % 2) * 0.09);

              const rotation =
                (index % 2 === 0 ? 1 : -1) *
                (3 + (index % 5) * 2);

              gsap.set(product, {
                xPercent: -50,
                yPercent: -50,
                x: Math.cos(angle) * radiusX,
                y: Math.sin(angle) * radiusY,
                rotation,
              });
            });
          };

          setPositions();

          // Semua produk tersembunyi sebelum scroll.
          gsap.set(products, {
            z: farZ,
            autoAlpha: 0,
          });

          gsap.set(title, {
            scale: 0.7,
            opacity: 0.25,
          });

          const timeline = gsap.timeline({
            defaults: {
              ease: "none",
            },
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.65,
              invalidateOnRefresh: true,
              onRefreshInit: setPositions,
            },
          });

          // Animasi teks mengikuti nilai pada referensi.
          timeline
            .to(
              title,
              {
                scale: 1,
                duration: 0.5,
              },
              0,
            )
            .to(
              title,
              {
                scale: 1.35,
                duration: 0.5,
              },
              0.5,
            )
            .to(
              title,
              {
                opacity: 1,
                duration: 0.12,
              },
              0,
            )
            .to(
              title,
              {
                opacity: 0,
                duration: 0.15,
              },
              0.85,
            )
            .to(
              cue,
              {
                autoAlpha: 0,
                duration: 0.12,
              },
              0,
            )
            .to(
              cta,
              {
                autoAlpha: 0,
                y: -18,
                duration: 0.22,
              },
              0.06,
            );

          // Produk muncul bergantian dari kedalaman.
          products.forEach((product, index) => {
            const start =
              (index / products.length) * 0.45;

            const duration = 0.55;

            timeline
              .to(
                product,
                {
                  z: nearZ,
                  duration,
                },
                start,
              )
              .to(
                product,
                {
                  autoAlpha: 1,
                  duration: duration * 0.18,
                },
                start,
              )
              .to(
                product,
                {
                  autoAlpha: 0,
                  duration: duration * 0.16,
                },
                start + duration * 0.82,
              );
          });

          // Parallax memakai pembungkus terpisah agar
          // tidak menimpa transformasi animasi tunnel.
          const setters = planes.map((plane) => ({
            x: gsap.quickTo(plane, "x", {
              duration: 0.65,
              ease: "power3.out",
            }),
            y: gsap.quickTo(plane, "y", {
              duration: 0.65,
              ease: "power3.out",
            }),
          }));

          const handlePointerMove = (
            event: PointerEvent,
          ) => {
            if (
              mobile ||
              event.pointerType === "touch"
            ) {
              return;
            }

            const rect = stage.getBoundingClientRect();

            const x =
              ((event.clientX - rect.left) /
                rect.width -
                0.5) *
              -90;

            const y =
              ((event.clientY - rect.top) /
                rect.height -
                0.5) *
              -90;

            setters.forEach((setter) => {
              setter.x(x);
              setter.y(y);
            });
          };

          const resetPointer = () => {
            setters.forEach((setter) => {
              setter.x(0);
              setter.y(0);
            });
          };

          stage.addEventListener(
            "pointermove",
            handlePointerMove,
          );

          stage.addEventListener(
            "pointerleave",
            resetPointer,
          );

          return () => {
            stage.removeEventListener(
              "pointermove",
              handlePointerMove,
            );

            stage.removeEventListener(
              "pointerleave",
              resetPointer,
            );
          };
        },
      );

      return () => media.revert();
    },
    {
      scope: sectionRef,
    },
  );

  return (
    <>
      <section
        ref={sectionRef}
        id="beranda"
        className={styles.section}
        aria-label="Hero Bungkus Indonesia"
      >
        <div data-stage className={styles.stage}>
          <div
            className={styles.aurora}
            aria-hidden="true"
          />

          {/* Logo perusahaan */}
          <a
            href="#beranda"
            className={styles.logo}
            aria-label="Bungkus Indonesia — Beranda"
          >
            <Image
              src="/images/brand/logo_bungkus.png"
              alt="Bungkus Indonesia"
              width={2000}
              height={1000}
              priority
            />
          </a>

          {/* Scene produk */}
          <div
            className={styles.scene}
            aria-hidden="true"
          >
            {PRODUCTS.map((product) => (
              <div
                key={product.file}
                data-parallax
                className={styles.plane}
              >
                <div
                  data-product
                  className={styles.product}
                >
                  <Image
                    src={`/images/hero/products/${product.file}`}
                    alt=""
                    fill
                    sizes="(max-width: 767px) 180px, 270px"
                    draggable={false}
                    className={styles.productImage}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Judul dan deskripsi */}
          <div className={styles.content}>
            <div
              data-title
              className={styles.titleBlock}
            >
              <p className={styles.eyebrow}>
                Solusi Kemasan untuk Bisnis
              </p>

              <h1 className={styles.heading}>
                Kemasan yang
                <br />
                Menguatkan
                <br />
                <span>Identitas Brand Anda.</span>
              </h1>

              <p className={styles.description}>
                Kemasan untuk produk makanan, minuman,
                dan pengiriman yang dirancang mengikuti
                kebutuhan bisnis Anda.
              </p>
            </div>

            {/* Tombol aksi */}
            <nav
              data-cta
              className={styles.actions}
              aria-label="Aksi utama"
            >
              {ACTIONS.map(({ href, label, Icon }) => (
                <a
                  key={href}
                  href={href}
                  aria-label={label}
                  title={label}
                >
                  <Icon
                    size={21}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                  <span>{label}</span>
                </a>
              ))}
            </nav>
          </div>

          <div data-cue className={styles.cue}>
            Gulir untuk melihat lebih banyak
            <span />
          </div>
        </div>
      </section>

      {/* Konten sementara bagian produk */}
      <section
        id="produk"
        className="flex min-h-[48svh] scroll-mt-8 items-center justify-center bg-[#F0F3F3] px-6 py-20 text-center"
      >
        <div className="max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#2787A4]">
            Pilihan Produk
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#142D55] sm:text-4xl">
            Temukan Kemasan untuk Produk Anda
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#607187] sm:text-base">
            Katalog produk Bungkus Indonesia akan
            ditampilkan di bagian ini.
          </p>
        </div>
      </section>

      {/* Konten sementara bagian kontak */}
      <section
        id="kontak"
        className="flex min-h-[34svh] scroll-mt-8 items-center justify-center bg-[#142D55] px-6 py-16 text-center text-white"
      >
        <div className="max-w-xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8DD7E8]">
            Hubungi Kami
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Diskusikan Kebutuhan Kemasan Anda.
          </h2>

          <p className="mt-4 text-sm leading-7 text-white/70">
            Tim Bungkus Indonesia siap membantu
            membahas kebutuhan kemasan bisnis Anda.
          </p>
        </div>
      </section>

      {/* Konten sementara bagian pelacakan */}
      <section
        id="tracking"
        className="flex min-h-[30svh] scroll-mt-8 items-center justify-center bg-[#F7F8F6] px-6 py-16 text-center"
      >
        <div className="max-w-xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#2787A4]">
            Pelacakan Pesanan
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#142D55] sm:text-4xl">
            Cek Pesananmu
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#607187]">
            Fitur pelacakan pesanan akan diaktifkan
            setelah sistem tracking tersedia.
          </p>
        </div>
      </section>
    </>
  );
}