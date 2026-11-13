"use client";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  MessageCircle,
  Package,
  Search,
  ArrowUpRight,
  Boxes,
  Factory,
  Truck,
  Coffee,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import styles from "./hero-section.module.css";
gsap.registerPlugin(ScrollTrigger, useGSAP, SplitText);
const vertexShader = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;
const fragmentShader = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_resolution;
uniform float u_time;
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(
    mix(a, b, f.x),
    mix(c, d, f.x),
    f.y
  );
}
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p = p * 2.02 + vec2(17.2, 9.7);
    amplitude *= 0.5;
  }
  return value;
}
float ridgedFbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 3; i++) {
    float n = noise(p);
    float ridge = 1.0 - abs(n * 2.0 - 1.0);
    value += ridge * amplitude;
    p = p * 2.04 + vec2(11.7, 8.3);
    amplitude *= 0.5;
  }
  return value / 0.875;
}
vec3 bluePalette(float density) {
  vec3 iceBlue = vec3(0.965, 0.978, 0.990);
  vec3 paleBlue = vec3(0.835, 0.905, 0.955);
  vec3 powderBlue = vec3(0.635, 0.785, 0.895);
  vec3 royalBlue = vec3(0.365, 0.565, 0.755);
  vec3 deepBlue = vec3(0.235, 0.405, 0.610);
  vec3 color = mix(
    iceBlue,
    paleBlue,
    smoothstep(0.18, 0.48, density)
  );
  color = mix(
    color,
    powderBlue,
    smoothstep(0.40, 0.67, density) * 0.88
  );
  color = mix(
    color,
    royalBlue,
    smoothstep(0.60, 0.82, density) * 0.72
  );
  color = mix(
    color,
    deepBlue,
    smoothstep(0.76, 0.96, density) * 0.48
  );
  return color;
}
vec3 renderSmoke(vec2 p, vec2 uv, float time) {
  float warpX = fbm(
    p * 1.12 + vec2(time * 0.035, 2.7)
  );
  float warpY = fbm(
    p * 1.12 + vec2(4.2, -time * 0.028)
  );
  vec2 warped = p + (
    vec2(warpX, warpY) - 0.5
  ) * 0.92;
  float cloud = fbm(
    warped * 1.55 +
    vec2(time * 0.018, -time * 0.014)
  );
  float secondary = fbm(
    warped * 2.75 +
    vec2(-time * 0.022, time * 0.016)
  );
  float ridges = ridgedFbm(
    warped * 4.15 +
    vec2(time * 0.012, 5.4)
  );
  float fine = fbm(
    warped * 7.0 +
    vec2(-time * 0.018, 8.1)
  );
  float flow = 0.5 + 0.5 * sin(
    (
      warped.x * 2.15 +
      warped.y * 1.55 +
      cloud * 2.2 +
      secondary
    ) * 3.14159
  );
  float density = clamp(
    cloud * 0.48 +
    secondary * 0.22 +
    ridges * 0.20 +
    flow * 0.07 +
    fine * 0.03,
    0.0,
    1.0
  );
  float edgeDistance = length(
    (uv - 0.5) * vec2(1.0, 0.92)
  );
  float edgeWeight = smoothstep(
    0.28,
    0.92,
    edgeDistance
  );
  density = clamp(
    density + edgeWeight * 0.13,
    0.0,
    1.0
  );
  vec3 color = bluePalette(density);
  float ribbon = smoothstep(
    0.56,
    0.84,
    ridges * 0.62 + secondary * 0.38
  );
  color = mix(
    color,
    vec3(0.255, 0.445, 0.665),
    ribbon * 0.24 * edgeWeight
  );
  float highlight = smoothstep(
    0.67,
    0.92,
    fine * 0.55 + ridges * 0.45
  );
  color = mix(
    color,
    vec3(0.875, 0.950, 0.985),
    highlight * 0.18
  );
  color *= 0.975 + cloud * 0.055;
  return color;
}
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (
    gl_FragCoord.xy -
    0.5 * u_resolution.xy
  ) / min(
    u_resolution.x,
    u_resolution.y
  );
  p *= 1.42;
  float time = u_time * 0.62;
  vec3 color = renderSmoke(p, uv, time);
  vec2 centerPoint = (
    uv - vec2(0.50, 0.49)
  ) * vec2(1.0, 0.88);
  float centerMask = 1.0 - smoothstep(
    0.12,
    0.78,
    length(centerPoint)
  );
  color = mix(
    color,
    vec3(0.975, 0.984, 0.992),
    centerMask * 0.88
  );
  vec2 logoPoint = (
    uv - vec2(0.145, 0.885)
  ) / vec2(0.25, 0.15);
  float logoMask = 1.0 - smoothstep(
    0.32,
    1.18,
    length(logoPoint)
  );
  color = mix(
    color,
    vec3(0.978, 0.986, 0.993),
    logoMask * 0.94
  );
  float grain = hash21(gl_FragCoord.xy);
  color += (grain - 0.5) * 0.010;
  gl_FragColor = vec4(
    clamp(color, 0.0, 1.0),
    1.0
  );
}
`;
function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(
      "Blue smoke shader compilation failed:",
      gl.getShaderInfoLog(shader)
    );
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}
function SmokeShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
    if (!gl) {
      canvas.style.display = "none";
      return;
    }
    const vertex = compileShader(
      gl,
      gl.VERTEX_SHADER,
      vertexShader
    );
    const fragment = compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShader
    );
    if (!vertex || !fragment) {
      canvas.style.display = "none";
      if (vertex) gl.deleteShader(vertex);
      if (fragment) gl.deleteShader(fragment);
      return;
    }
    const program = gl.createProgram();
    if (!program) {
      canvas.style.display = "none";
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      return;
    }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(
        "Blue smoke shader linking failed:",
        gl.getProgramInfoLog(program)
      );
      canvas.style.display = "none";
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      return;
    }
    gl.useProgram(program);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    const positionLocation = gl.getAttribLocation(
      program,
      "a_position"
    );
    const resolutionLocation = gl.getUniformLocation(
      program,
      "u_resolution"
    );
    const timeLocation = gl.getUniformLocation(
      program,
      "u_time"
    );
    if (
      positionLocation < 0 ||
      resolutionLocation === null ||
      timeLocation === null
    ) {
      canvas.style.display = "none";
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      return;
    }
    const buffer = gl.createBuffer();
    if (!buffer) {
      canvas.style.display = "none";
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
        3, -1,
        -1, 3,
      ]),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(
      positionLocation,
      2,
      gl.FLOAT,
      false,
      0,
      0
    );
    let frameId: number | null = null;
    let running = false;
    let contextLost = false;
    let elapsedSeconds = 0;
    let previousFrameTime = 0;
    let lastRenderTime = 0;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height || contextLost) return;
      const pixelArea = rect.width * rect.height;
      const budgetScale = Math.sqrt(
        1500000 / Math.max(pixelArea, 1)
      );
      const dpr = Math.min(
        window.devicePixelRatio || 1,
        1.15,
        budgetScale
      );
      const width = Math.max(
        1,
        Math.round(rect.width * dpr)
      );
      const height = Math.max(
        1,
        Math.round(rect.height * dpr)
      );
      if (
        canvas.width !== width ||
        canvas.height !== height
      ) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const draw = () => {
      if (contextLost || gl.isContextLost()) return;
      gl.useProgram(program);
      gl.uniform2f(
        resolutionLocation,
        canvas.width,
        canvas.height
      );
      gl.uniform1f(
        timeLocation,
        elapsedSeconds
      );
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const stopAnimation = () => {
      running = false;
      previousFrameTime = 0;
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
        frameId = null;
      }
    };
    const render = (timestamp: number) => {
      frameId = null;
      if (!running || document.hidden || contextLost) return;
      if (timestamp - lastRenderTime < 1000 / 24) {
        frameId = window.requestAnimationFrame(render);
        return;
      }
      if (previousFrameTime !== 0) {
        const delta = Math.min(
          (timestamp - previousFrameTime) / 1000,
          0.05
        );
        elapsedSeconds += delta;
      }
      previousFrameTime = timestamp;
      lastRenderTime = timestamp;
      draw();
      if (running && !document.hidden && !contextLost) {
        frameId = window.requestAnimationFrame(render);
      }
    };
    const startAnimation = () => {
      if (
        running ||
        document.hidden ||
        contextLost ||
        prefersReducedMotion
      ) {
        return;
      }
      running = true;
      previousFrameTime = 0;
      lastRenderTime = 0;
      frameId = window.requestAnimationFrame(render);
    };
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      stopAnimation();
      canvas.style.display = "none";
    };
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAnimation();
      } else if (!contextLost) {
        resizeCanvas();
        draw();
        startAnimation();
      }
    };
    const handleResize = () => {
      resizeCanvas();
      if (!document.hidden && !contextLost) {
        draw();
      }
    };
    canvas.addEventListener(
      "webglcontextlost",
      handleContextLost,
      false
    );
    resizeCanvas();
    draw();
    startAnimation();
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(canvas);
    }
    window.addEventListener(
      "resize",
      handleResize,
      { passive: true }
    );
    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );
    return () => {
      stopAnimation();
      resizeObserver?.disconnect();
      window.removeEventListener(
        "resize",
        handleResize
      );
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
      canvas.removeEventListener(
        "webglcontextlost",
        handleContextLost
      );
      if (!gl.isContextLost()) {
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
        gl.deleteShader(vertex);
        gl.deleteShader(fragment);
      }
    };
  }, []);
  return (
    <div
      className={styles.aurora}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
const PRODUCTS = [
  { file: "produk-2.png", title: "Custom Poly Mailer" },
  { file: "produk-3.png", title: "Beverage Cup" },
  { file: "produk-4.png", title: "Kraft Food Box" },
  { file: "produk-5.png", title: "Food Container" },
  { file: "produk-6.png", title: "Produk 6" },
  { file: "produk-7.png", title: "Produk 7" },
  { file: "produk-8.png", title: "Produk 8" },
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
function BrandIntroduction() {
  const sectionRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const experience = section.querySelector<HTMLElement>(
        "[data-brand-experience]"
      );
      const copy = section.querySelector<HTMLElement>(
        "[data-brand-copy]"
      );
      const headlineLines = gsap.utils.toArray<HTMLElement>(
        "[data-brand-line]",
        section
      );
      const description = section.querySelector<HTMLElement>(
        "[data-brand-description]"
      );
      const cta = section.querySelector<HTMLElement>(
        "[data-brand-cta]"
      );
      const visual = visualRef.current;
      const boxAssembly = section.querySelector<HTMLElement>(
        "[data-brand-box-assembly]"
      );
      const boxBase = section.querySelector<HTMLElement>(
        '[data-brand-box="base"]'
      );
      const boxBack = section.querySelector<HTMLElement>(
        '[data-brand-box="back"]'
      );
      const boxFront = section.querySelector<HTMLElement>(
        '[data-brand-box="front"]'
      );
      const boxLeft = section.querySelector<HTMLElement>(
        '[data-brand-box="left"]'
      );
      const boxRight = section.querySelector<HTMLElement>(
        '[data-brand-box="right"]'
      );
      const boxLid = section.querySelector<HTMLElement>(
        '[data-brand-box="lid"]'
      );
      const boxTuck = section.querySelector<HTMLElement>(
        '[data-brand-box="tuck"]'
      );
      const boxFlaps = gsap.utils.toArray<HTMLElement>(
        "[data-brand-box-flap]",
        section
      );
      const boxShadow = section.querySelector<HTMLElement>(
        "[data-brand-box-shadow]"
      );
      const story = section.querySelector<HTMLElement>(
        "[data-company-story]"
      );
      const storyHeading = section.querySelector<HTMLElement>(
        "[data-story-heading]"
      );
      const storyCopy = section.querySelector<HTMLElement>(
        "[data-story-copy]"
      );
      if (
        !experience ||
        !copy ||
        !headlineLines.length ||
        !description ||
        !cta ||
        !visual ||
        !boxAssembly ||
        !boxBase ||
        !boxBack ||
        !boxFront ||
        !boxLeft ||
        !boxRight ||
        !boxLid ||
        !boxTuck ||
        !story ||
        !storyHeading ||
        !storyCopy
      ) {
        console.warn(
          "BrandIntroduction: Required elements not found."
        );
        return;
      }
      const panels = [
        boxBack,
        boxFront,
        boxLeft,
        boxRight,
        boxLid,
        boxTuck,
        ...boxFlaps,
      ];
      gsap.set(panels, {
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        z: 0,
      });
      const media = gsap.matchMedia();
      media.add(
        {
          reduce: "(prefers-reduced-motion: reduce)",
          mobile: "(max-width: 767px)",
          desktop: "(min-width: 768px)",
        },
        (context) => {
          const {
            reduce,
            mobile,
          } = context.conditions as {
            reduce: boolean;
            mobile: boolean;
            desktop: boolean;
          };
          const storySplits: SplitText[] = [];
          const storyTimelines: gsap.core.Timeline[] = [];
          if (reduce) {
            gsap.set(
              [
                copy,
                headlineLines,
                description,
                cta,
                visual,
                boxAssembly,
                storyHeading,
                storyCopy,
              ],
              {
                autoAlpha: 1,
                y: 0,
              }
            );
            gsap.set(panels, {
              rotationX: 0,
              rotationY: 0,
              rotationZ: 0,
              z: 0,
            });
            return;
          }
          const entrance = gsap.timeline({
            scrollTrigger: {
              trigger: experience,
              start: "top 76%",
              toggleActions: "play none none reverse",
            },
          });
          entrance.fromTo(
            headlineLines,
            {
              yPercent: 112,
              autoAlpha: 0,
              immediateRender: false,
            },
            {
              yPercent: 0,
              autoAlpha: 1,
              duration: 0.95,
              stagger: 0.12,
              ease: "power4.out",
            },
            0
          );
          entrance.fromTo(
            description,
            {
              y: 24,
              autoAlpha: 0,
              immediateRender: false,
            },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.75,
              ease: "power3.out",
            },
            0.38
          );
          entrance.fromTo(
            cta,
            {
              y: 18,
              autoAlpha: 0,
              immediateRender: false,
            },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.7,
              ease: "power3.out",
            },
            0.5
          );
          entrance.fromTo(
            visual,
            {
              y: 22,
              scale: 0.96,
              autoAlpha: 0,
              immediateRender: false,
            },
            {
              y: 0,
              scale: 1,
              autoAlpha: 1,
              duration: 1.1,
              ease: "power3.out",
            },
            0.15
          );
          if (boxShadow) {
            entrance.fromTo(
              boxShadow,
              {
                scale: 0.78,
                autoAlpha: 0,
                immediateRender: false,
              },
              {
                scale: 1,
                autoAlpha: 1,
                duration: 1,
                ease: "power2.out",
              },
              0.22
            );
          }
          const folding = gsap.timeline({
            defaults: {
              ease: "none",
            },
            scrollTrigger: {
              trigger: experience,
              start: mobile ? "top bottom" : "top top",
              end: mobile ? "bottom top" : "bottom bottom",
              scrub: mobile ? 0.45 : 0.85,
              invalidateOnRefresh: true,
            },
          });
          folding.to(
            boxBack,
            {
              rotationX: 90,
              z: 1,
              duration: 0.18,
            },
            0.08
          );
          folding.to(
            boxFront,
            {
              rotationX: -90,
              z: 2,
              duration: 0.18,
            },
            0.20
          );
          folding
            .to(
              boxLeft,
              {
                rotationY: -90,
                z: 2,
                duration: 0.20,
              },
              0.34
            )
            .to(
              boxRight,
              {
                rotationY: 90,
                z: 2,
                duration: 0.20,
              },
              0.39
            );
          if (boxFlaps[0]) {
            folding.to(
              boxFlaps[0],
              {
                rotationY: -90,
                z: 4,
                duration: 0.16,
              },
              0.57
            );
          }
          if (boxFlaps[1]) {
            folding.to(
              boxFlaps[1],
              {
                rotationY: 90,
                z: 4,
                duration: 0.16,
              },
              0.61
            );
          }
          folding.to(
            boxLid,
            {
              rotationX: 90,
              z: 8,
              duration: 0.22,
            },
            0.76
          );
          folding.to(
            boxTuck,
            {
              rotationX: -90,
              z: 10,
              duration: 0.10,
            },
            0.94
          );
          folding.to(
            boxAssembly,
            {
              y: mobile ? -5 : -16,
              rotationX: mobile ? 10 : 15,
              rotationY: mobile ? -5 : -11,
              rotation: -2,
              scale: mobile ? 1.015 : 1.035,
              duration: 0.3,
            },
            0.72
          );
          if (boxShadow) {
            folding.to(
              boxShadow,
              {
                scaleX: 1.12,
                scaleY: 0.9,
                autoAlpha: 0.72,
                duration: 0.3,
              },
              0.72
            );
          }
          if (headlineLines[0]) {
            folding.to(
              headlineLines[0],
              {
                x: mobile ? -2 : -8,
              },
              0.05
            );
          }
          if (headlineLines[1]) {
            folding.to(
              headlineLines[1],
              {
                x: mobile ? 2 : 7,
              },
              0.1
            );
          }
          if (headlineLines[2]) {
            folding.to(
              headlineLines[2],
              {
                x: mobile ? 3 : 12,
              },
              0.15
            );
          }
          if (headlineLines[3]) {
            folding.to(
              headlineLines[3],
              {
                x: mobile ? -2 : -7,
              },
              0.2
            );
          }
          folding.to(
            copy,
            {
              y: mobile ? -3 : -14,
              duration: 0.45,
            },
            0.22
          );
          folding.to(
            visual,
            {
              autoAlpha: 0,
              y: mobile ? -12 : -28,
              scale: 0.96,
              duration: 0.10,
              ease: "power2.in",
            },
            0.90
          );
          const createStoryBlockReveal = (
            element: HTMLElement,
            delay = 0
          ) => {
            const split = SplitText.create(element, {
              type: "lines",
              linesClass: styles.brandStoryRevealLine,
              mask: "lines",
              autoSplit: true,
              onSplit(self) {
                const lineItems = self.lines.map((line) => {
                  const lineElement = line as HTMLElement;
                  const content = document.createElement("span");
                  content.className =
                    styles.brandStoryRevealContent;
                  const block = document.createElement("span");
                  block.className =
                    styles.brandStoryRevealBlock;
                  block.setAttribute("aria-hidden", "true");
                  while (lineElement.firstChild) {
                    content.appendChild(lineElement.firstChild);
                  }
                  lineElement.append(content, block);
                  gsap.set(content, {
                    autoAlpha: 0,
                  });
                  gsap.set(block, {
                    scaleX: 0,
                    transformOrigin: "left center",
                  });
                  return { content, block };
                });
                const timeline = gsap.timeline({
                  scrollTrigger: {
                    trigger: story,
                    start: "top 82%",
                    toggleActions: "play none none reverse",
                  },
                });
                lineItems.forEach(({ content, block }, index) => {
                  const position = delay + index * 0.12;
                  timeline
                    .to(
                      block,
                      {
                        scaleX: 1,
                        duration: 0.34,
                        ease: "power3.inOut",
                      },
                      position
                    )
                    .set(
                      content,
                      {
                        autoAlpha: 1,
                      },
                      position + 0.34
                    )
                    .set(
                      block,
                      {
                        transformOrigin: "right center",
                      },
                      position + 0.34
                    )
                    .to(
                      block,
                      {
                        scaleX: 0,
                        duration: 0.42,
                        ease: "power3.inOut",
                      },
                      position + 0.34
                    );
                });
                storyTimelines.push(timeline);
                return timeline;
              },
            });
            storySplits.push(split);
          };
          createStoryBlockReveal(storyHeading, 0);
          const storyParagraphs =
            storyCopy.querySelectorAll<HTMLElement>("p");
          storyParagraphs.forEach((paragraph, index) => {
            createStoryBlockReveal(
              paragraph,
              0.22 + index * 0.16
            );
          });
          return () => {
            storyTimelines.forEach((timeline) => {
              timeline.scrollTrigger?.kill();
              timeline.kill();
            });
            storySplits.forEach((split) => {
              split.revert();
            });
            [entrance, folding].forEach((timeline) => {
              timeline.scrollTrigger?.kill();
              timeline.kill();
            });
          };
        }
      );
      return () => media.revert();
    },
    {
      scope: sectionRef,
    }
  );
  const handleStoryClick = (
    event: MouseEvent<HTMLAnchorElement>
  ) => {
    event.preventDefault();
    document
      .getElementById("company-story")
      ?.scrollIntoView({
        behavior: window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches
          ? "auto"
          : "smooth",
        block: "start",
      });
  };
  return (
    <section
      ref={sectionRef}
      id="brand-introduction"
      className={styles.brandSection}
      aria-labelledby="brand-intro-heading"
    >
      <div
        className={styles.brandExperience}
        data-brand-experience
      >
        <div className={styles.brandIntroHero}>
          <div className={styles.brandGrid}>
            <div
              className={styles.brandCopy}
              data-brand-copy
            >
              <h2
                id="brand-intro-heading"
                className={styles.brandHeadline}
              >
                <span className={styles.brandLineMask}>
                  <span data-brand-line>
                    More Than
                  </span>
                </span>
                <span className={styles.brandLineMask}>
                  <strong
                    data-brand-line
                    className={styles.brandHeadlineBold}
                  >
                    PACKAGING.
                  </strong>
                </span>
                <span className={styles.brandLineMask}>
                  <em
                    data-brand-line
                    className={styles.brandHeadlineItalic}
                  >
                    We Create
                  </em>
                </span>
                <span className={styles.brandLineMask}>
                  <strong
                    data-brand-line
                    className={styles.brandHeadlineAccent}
                  >
                    Possibilities.
                  </strong>
                </span>
              </h2>
              <p
                className={styles.brandDescription}
                data-brand-description
              >
                Bungkus Indonesia menghadirkan solusi
                kemasan untuk membantu bisnis menampilkan
                produk dengan lebih baik dan memperkuat
                karakter brand.
              </p>
              <a
                href="#company-story"
                className={styles.brandCta}
                data-brand-cta
                onClick={handleStoryClick}
                aria-label="Discover Our Story"
              >
                <ArrowUpRight
                  size={21}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                <span>
                  Discover Our Story
                </span>
              </a>
            </div>

            <div
              ref={visualRef}
              className={styles.brandVisual}
              aria-label="3D packaging folding animation"
            >
              <div className={styles.brandVisualGlow} />
              <div
                className={styles.brandBoxAssembly}
                data-brand-box-assembly
              >
                <div
                  className={styles.brandBoxShadow}
                  data-brand-box-shadow
                />

                <div
                  className={`${styles.brandBoxPanel} ${styles.brandBoxBase}`}
                  data-brand-box="base"
                />

                <div
                  className={`${styles.brandBoxPanel} ${styles.brandBoxBack}`}
                  data-brand-box="back"
                >
                  <span className={styles.brandBoxScore} />
                  <div
                    className={styles.brandBoxLid}
                    data-brand-box="lid"
                  >
                    <div
                      className={styles.brandBoxTuck}
                      data-brand-box="tuck"
                    >
                      <span />
                    </div>
                  </div>
                </div>

                <div
                  className={`${styles.brandBoxPanel} ${styles.brandBoxFront}`}
                  data-brand-box="front"
                >
                  <span className={styles.brandBoxScore} />
                </div>

                <div
                  className={`${styles.brandBoxPanel} ${styles.brandBoxLeft}`}
                  data-brand-box="left"
                >
                  <span className={styles.brandBoxSideLine} />
                  <div
                    className={styles.brandBoxSideFlap}
                    data-brand-box-flap="left"
                  >
                    <span />
                  </div>
                </div>

                <div
                  className={`${styles.brandBoxPanel} ${styles.brandBoxRight}`}
                  data-brand-box="right"
                >
                  <span className={styles.brandBoxSideLine} />
                  <div
                    className={styles.brandBoxSideFlap}
                    data-brand-box-flap="right"
                  >
                    <span />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        id="company-story"
        data-company-story
        className={styles.brandStory}
      >
        <div className={styles.brandStoryGrid}>
          <h3
            className={styles.brandStoryHeading}
            data-story-heading
          >
            Every product has a story.
            <em className={styles.brandStoryItalic}>
              Let its packaging tell it.
            </em>
          </h3>
          <div
            className={styles.brandStoryCopy}
            data-story-copy
          >
            <p>
              Kami percaya bahwa kemasan merupakan
              bagian penting dari pengalaman sebuah
              produk. Ia menjadi salah satu hal pertama
              yang dilihat dan dikenali pelanggan.
            </p>
            <p>
              Karena itu, kami ingin membantu bisnis
              menemukan solusi kemasan yang sesuai
              dengan kebutuhan produk dan karakter
              brand mereka.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
type CharacterV1Props = {
  char: string;
  index: number;
  centerIndex: number;
  progress: MotionValue<number>;
  reducedMotion: boolean;
};
function CharacterV1({
  char,
  index,
  centerIndex,
  progress,
  reducedMotion,
}: CharacterV1Props) {
  const distance = index - centerIndex;
  const x = useTransform(
    progress,
    [0, 0.62, 1],
    [distance * 34, 0, 0]
  );
  const rotateX = useTransform(
    progress,
    [0, 0.62, 1],
    [distance * 5, 0, 0]
  );
  const rotateY = useTransform(
    progress,
    [0, 0.62, 1],
    [distance * -2.5, 0, 0]
  );
  const opacity = useTransform(
    progress,
    [0, 0.25, 0.62, 1],
    [0.55, 0.85, 1, 1]
  );
  return (
    <motion.span
      className={styles.statsCharacter}
      style={
        reducedMotion
          ? undefined
          : {
              x,
              rotateX,
              rotateY,
              opacity,
            }
      }
      aria-hidden="true"
    >
      {char === " " ? "\u00A0" : char}
    </motion.span>
  );
}
type IconCharacterProps = {
  Icon: LucideIcon;
  index: number;
  centerIndex: number;
  progress: MotionValue<number>;
  reducedMotion: boolean;
};
function CharacterV3({
  Icon,
  index,
  centerIndex,
  progress,
  reducedMotion,
}: IconCharacterProps) {
  const distance = index - centerIndex;
  const x = useTransform(
    progress,
    [0, 0.65, 1],
    [distance * 82, 0, 0]
  );
  const y = useTransform(
    progress,
    [0, 0.65, 1],
    [Math.abs(distance) * 22, 0, 0]
  );
  const rotateX = useTransform(
    progress,
    [0, 0.65, 1],
    [distance * -13, 0, 0]
  );
  const rotateY = useTransform(
    progress,
    [0, 0.65, 1],
    [distance * 38, 0, 0]
  );
  const scale = useTransform(
    progress,
    [0, 0.65, 1],
    [0.68, 1, 1]
  );
  const opacity = useTransform(
    progress,
    [0, 0.35, 0.65, 1],
    [0.25, 0.75, 1, 1]
  );
  return (
    <motion.div
      className={styles.statsIcon}
      style={
        reducedMotion
          ? undefined
          : {
              x,
              y,
              rotateX,
              rotateY,
              scale,
              opacity,
            }
      }
      aria-hidden="true"
    >
      <Icon strokeWidth={1.35} />
    </motion.div>
  );
}
type StatsMetricProps = {
  eyebrow: string;
  label: string;
  target: number;
  suffix: string;
  index: number;
  progress: MotionValue<number>;
  reducedMotion: boolean;
};
function StatsMetric({
  eyebrow,
  label,
  target,
  suffix,
  index,
  progress,
  reducedMotion,
}: StatsMetricProps) {
  const revealStart = 0.38 + index * 0.045;
  const count = useTransform(
    progress,
    [revealStart, revealStart + 0.38],
    [0, target]
  );
  const y = useTransform(
    progress,
    [revealStart, revealStart + 0.2],
    [28, 0]
  );
  const opacity = useTransform(
    progress,
    [revealStart, revealStart + 0.16],
    [0, 1]
  );
  const [displayValue, setDisplayValue] = useState(
    reducedMotion ? target : 0
  );
  useEffect(() => {
    if (reducedMotion) {
      setDisplayValue(target);
      return;
    }
    setDisplayValue(Math.round(count.get()));
    return count.on("change", (latest) => {
      setDisplayValue(Math.round(latest));
    });
  }, [count, reducedMotion, target]);
  return (
    <motion.article
      className={styles.statsMetric}
      style={
        reducedMotion
          ? undefined
          : {
              y,
              opacity,
            }
      }
    >
      <p className={styles.statsMetricEyebrow}>
        {eyebrow}
      </p>
      <div className={styles.statsMetricNumber}>
        <span>
          {displayValue.toLocaleString("id-ID")}
        </span>
        <span className={styles.statsMetricSuffix}>
          {suffix}
        </span>
      </div>
      <p className={styles.statsMetricLabel}>
        {label}
      </p>
    </motion.article>
  );
}
function Bracket({
  className,
}: {
  className: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 27 78"
      className={className}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M26.52 77.21h-5.75c-6.83 0-12.38-5.56-12.38-12.38V48.38C8.39 43.76 4.63 40 .01 40v-4c4.62 0 8.38-3.76 8.38-8.38V12.4C8.38 5.56 13.94 0 20.77 0h5.75v4h-5.75c-4.62 0-8.38 3.76-8.38 8.38V27.6c0 4.34-2.25 8.17-5.64 10.38 3.39 2.21 5.64 6.04 5.64 10.38v16.45c0 4.62 3.76 8.38 8.38 8.38h5.75v4.02Z"
      />
    </svg>
  );
}
const STATISTICS_ICONS: LucideIcon[] = [
  Package,
  Boxes,
  Factory,
  Truck,
  Coffee,
  ShoppingBag,
];
const COMPANY_METRICS = [
  {
    eyebrow: "PARTNERSHIP",
    target: 100,
    suffix: "+",
    label: "Brand Bermitra",
  },
  {
    eyebrow: "PRODUCTION",
    target: 10,
    suffix: "Juta+",
    label: "Kapasitas Produksi Bulanan",
  },
  {
    eyebrow: "EXPERIENCE",
    target: 11,
    suffix: "+",
    label: "Pengalaman Manufaktur",
  },
  {
    eyebrow: "SPECIFICATIONS",
    target: 50,
    suffix: "+",
    label: "Varian Spesifikasi",
  },
];
function CompanyStatistics() {
  const textSectionRef = useRef<HTMLDivElement>(null);
  const metricsSectionRef = useRef<HTMLDivElement>(null);
  const reducedMotion = Boolean(useReducedMotion());
  const { scrollYProgress: textProgress } = useScroll({
    target: textSectionRef,
    offset: ["start start", "end end"],
  });
  const { scrollYProgress: metricsProgress } = useScroll({
    target: metricsSectionRef,
    offset: ["start start", "end end"],
  });
  const headline = "lebih dari kemasan";
  const headlineCharacters = Array.from(headline);
  const headlineCenterIndex = Math.floor(
    headlineCharacters.length / 2
  );
  const iconCenterIndex = Math.floor(
    STATISTICS_ICONS.length / 2
  );
  return (
    <section
      id="company-statistics"
      className={styles.statsSection}
      aria-label="Statistik perusahaan Bungkus Indonesia"
    >
      <div
        ref={textSectionRef}
        className={styles.statsScroll}
      >
        <div
          className={`${styles.statsStage} ${styles.statsStageText}`}
        >
          <h2
            id="stats-heading"
            className={styles.statsText}
            aria-label="Lebih dari kemasan"
          >
            {headlineCharacters.map((char, index) => (
              <CharacterV1
                key={`${index}-${char}`}
                char={char}
                index={index}
                centerIndex={headlineCenterIndex}
                progress={textProgress}
                reducedMotion={reducedMotion}
              />
            ))}
          </h2>
        </div>
      </div>

      <div
        ref={metricsSectionRef}
        className={styles.statsScroll}
      >
        <div
          className={`${styles.statsStage} ${styles.statsStageMetrics}`}
        >
          <p className={styles.statsPrompt}>
            <Bracket className={styles.statsBracket} />
            <span>
              Dari produksi hingga distribusi
            </span>
            <Bracket
              className={`${styles.statsBracket} ${styles.statsBracketReverse}`}
            />
          </p>
          <div className={styles.statsIconRow}>
            {STATISTICS_ICONS.map((Icon, index) => (
              <CharacterV3
                key={`icon-v3-${index}`}
                Icon={Icon}
                index={index}
                centerIndex={iconCenterIndex}
                progress={metricsProgress}
                reducedMotion={reducedMotion}
              />
            ))}
          </div>
          <div className={styles.statsMetrics}>
            {COMPANY_METRICS.map((metric, index) => (
              <StatsMetric
                key={metric.eyebrow}
                eyebrow={metric.eyebrow}
                target={metric.target}
                suffix={metric.suffix}
                label={metric.label}
                index={index}
                progress={metricsProgress}
                reducedMotion={reducedMotion}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


function ProductShowcase() {
  const outerRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const wrappersRef = useRef<(HTMLDivElement | null)[]>([]);
  const visualsRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      const outer = outerRef.current;
      const stage = stageRef.current;
      const track = trackRef.current;

      if (!outer || !stage || !track) return;

      const getTravel = () =>
        Math.max(track.scrollWidth - window.innerWidth, 0);

      const updateHeight = () => {
        outer.style.height = `${
          getTravel() + window.innerHeight
        }px`;
      };

      updateHeight();

      const resizeObserver =
        typeof ResizeObserver !== "undefined"
          ? new ResizeObserver(() => {
              updateHeight();
              ScrollTrigger.refresh();
            })
          : null;

      resizeObserver?.observe(track);

      const handleResize = () => {
        updateHeight();
        ScrollTrigger.refresh();
      };

      window.addEventListener("resize", handleResize, {
        passive: true,
      });

      const media = gsap.matchMedia();

      media.add(
        {
          reduce: "(prefers-reduced-motion: reduce)",
          mobile: "(max-width: 639px)",
          tablet:
            "(min-width: 640px) and (max-width: 1024px)",
          desktop: "(min-width: 1025px)",
        },
        (context) => {
          const { reduce, mobile, tablet } =
            context.conditions as {
              reduce: boolean;
              mobile: boolean;
              tablet: boolean;
              desktop: boolean;
            };

          const rotationScale = reduce ? 0.15 : 1;

          const step =
            (mobile ? 2 : tablet ? 6 : 10) * 1.2;

          const rotateIn =
            (mobile ? -60 : tablet ? -80 : -100) *
            rotationScale *
            1.1;

          const rotateOut =
            (mobile ? 50 : tablet ? 65 : 80) *
            rotationScale *
            1.1;

          gsap.set(stage, {
            perspective: reduce ? "4800px" : "1000px",
          });

          const horizontalTween = gsap.to(track, {
            x: () => -getTravel(),
            ease: "none",
            scrollTrigger: {
              trigger: outer,
              start: "top top",
              end: () => `+=${getTravel()}`,
              scrub: reduce ? true : 1,
              invalidateOnRefresh: true,
            },
          });

          visualsRef.current.forEach((visual, index) => {
            const wrapper = wrappersRef.current[index];

            if (!visual || !wrapper) return;

            const total = PRODUCTS.length;
            const mid = Math.floor(total / 2);

            let offset: number;

            if (index < mid) {
              offset = -((mid - index) * step);
            } else {
              offset = (index - mid + 1) * step;
            }

            const rotateXValue =
              (offset < 0 ? 5 : -5) * rotationScale;

            const timeline = gsap.timeline({
              scrollTrigger: {
                trigger: wrapper,
                containerAnimation: horizontalTween,
                start: "left 100%",
                end: "right 0%",
                scrub: true,
              },
            });

            timeline
              .fromTo(
                visual,
                {
                  rotateY: rotateIn,
                  rotateX: rotateXValue,
                  opacity: 0.8,
                  y: `${offset}vh`,
                },
                {
                  rotateY: 0,
                  rotateX: 0,
                  opacity: 1,
                  y: 0,
                  ease: "none",
                }
              )
              .to(visual, {
                rotateY: rotateOut,
                opacity: 0.9,
                y: `${-offset}vh`,
                ease: "none",
              });
          });

          ScrollTrigger.refresh();
        }
      );

      return () => {
        media.revert();
        resizeObserver?.disconnect();

        window.removeEventListener(
          "resize",
          handleResize
        );
      };
    },
    {
      scope: outerRef,
    }
  );

  return (
    <section
      ref={outerRef}
      id="produk"
      className={styles.productShowcase}
      aria-labelledby="product-showcase-heading"
    >
      <div
        ref={stageRef}
        className={styles.productShowcaseStage}
      >
        <header className={styles.productShowcaseHeader}>
          <h2
            id="product-showcase-heading"
            className={styles.productShowcaseHeading}
          >
            <span>Temukan kemasan</span>
            <em>untuk setiap cerita.</em>
          </h2>

          <p className={styles.productShowcaseDescription}>
            Jelajahi pilihan kemasan yang dirancang untuk
            mendukung produk dan karakter brand Anda.
          </p>
        </header>

        <div
          ref={trackRef}
          className={styles.productShowcaseTrack}
          role="list"
          aria-label="Koleksi produk kemasan"
        >
          {PRODUCTS.map((product, index) => (
            <div
              key={product.file}
              ref={(element) => {
                wrappersRef.current[index] = element;
              }}
              className={styles.productShowcaseItem}
              role="listitem"
            >
              <div
                ref={(element) => {
                  visualsRef.current[index] = element;
                }}
                className={styles.productShowcaseVisual}
              >
                <Image
                  src={`/images/hero/products/${product.file}`}
                  alt={product.title}
                  fill
                  sizes="(max-width: 639px) 75vw, (max-width: 1024px) 55vw, 38vw"
                  draggable={false}
                  className={styles.productShowcaseImage}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const stage = section.querySelector<HTMLElement>(
        "[data-stage]"
      );
      const logo = section.querySelector<HTMLElement>(
        "[data-logo]"
      );
      const title = section.querySelector<HTMLElement>(
        "[data-title]"
      );
      const cue = section.querySelector<HTMLElement>(
        "[data-cue]"
      );
      const cta = section.querySelector<HTMLElement>(
        "[data-cta]"
      );
      const products = gsap.utils.toArray<HTMLElement>(
        "[data-product]",
        section
      );
      const planes = gsap.utils.toArray<HTMLElement>(
        "[data-parallax]",
        section
      );
      if (!stage || !logo || !title || !cue || !cta) {
        console.error(
          "HeroSection: Required elements not found."
        );
        return;
      }
      const media = gsap.matchMedia();
      media.add(
        {
          reduce: "(prefers-reduced-motion: reduce)",
          mobile: "(max-width: 767px)",
          desktop: "(min-width: 768px)",
        },
        (context) => {
          const {
            reduce,
            mobile,
          } = context.conditions as {
            reduce: boolean;
            mobile: boolean;
            desktop: boolean;
          };
          gsap.set(title, {
            scale: 1,
            opacity: 1,
            autoAlpha: 1,
            transformOrigin: "center center",
          });
          gsap.set(logo, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
          });
          gsap.set(cue, {
            autoAlpha: 1,
          });
          gsap.set(cta, {
            autoAlpha: 1,
            y: 0,
          });
          if (reduce) {
            gsap.set(products, {
              autoAlpha: 0,
            });
            return;
          }
          gsap.fromTo(
            logo,
            {
              y: -18,
              scale: 0.92,
              filter: "blur(6px)",
            },
            {
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              duration: 1.2,
              delay: 0.1,
              ease: "power3.out",
              clearProps: "filter",
            }
          );
          const farZ = mobile ? -1200 : -1700;
          const nearZ = mobile ? 350 : 500;
          const setPositions = () => {
            const rect = stage.getBoundingClientRect();
            products.forEach((product, index) => {
              const angle =
                index * 137.5 * Math.PI / 180;
              const radiusX =
                rect.width *
                (0.28 + (index % 3) * 0.08);
              const radiusY =
                rect.height *
                (0.26 + (index % 2) * 0.09);
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
          gsap.set(products, {
            z: farZ,
            autoAlpha: 0,
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
          timeline
            .to(
              title,
              {
                scale: 1.35,
                duration: 0.5,
              },
              0.5
            )
            .to(
              title,
              {
                autoAlpha: 0,
                duration: 0.15,
              },
              0.85
            )
            .to(
              cue,
              {
                autoAlpha: 0,
                duration: 0.12,
              },
              0
            )
            .to(
              cta,
              {
                autoAlpha: 0,
                y: -18,
                duration: 0.22,
              },
              0.06
            );
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
                start
              )
              .to(
                product,
                {
                  autoAlpha: 1,
                  duration: duration * 0.18,
                },
                start
              )
              .to(
                product,
                {
                  autoAlpha: 0,
                  duration: duration * 0.16,
                },
                start + duration * 0.82
              );
          });
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
            event: PointerEvent
          ) => {
            if (
              mobile ||
              event.pointerType === "touch"
            ) {
              return;
            }
            const rect = stage.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            const x =
              (
                (event.clientX - rect.left) /
                rect.width - 0.5
              ) * -90;
            const y =
              (
                (event.clientY - rect.top) /
                rect.height - 0.5
              ) * -90;
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
            { passive: true }
          );
          stage.addEventListener(
            "pointerleave",
            resetPointer
          );
          return () => {
            stage.removeEventListener(
              "pointermove",
              handlePointerMove
            );
            stage.removeEventListener(
              "pointerleave",
              resetPointer
            );
          };
        }
      );
      return () => media.revert();
    },
    {
      scope: sectionRef,
    }
  );
  return (
    <div className={styles.landingPage}>
      <div
        className={styles.sharedBackground}
        aria-hidden="true"
      >
        <SmokeShaderBackground />
      </div>
      <div className={styles.landingContent}>
        <section
          ref={sectionRef}
          id="beranda"
          className={styles.section}
          aria-label="Hero Bungkus Indonesia"
        >
          <div
            data-stage
            className={styles.stage}
          >
            <a
              href="#beranda"
              data-logo
              className={styles.logo}
              aria-label="Bungkus Indonesia"
            >
              <Image
                src="/images/brand/logo_bungkus.png"
                alt="Bungkus Indonesia"
                width={2000}
                height={1000}
                priority
              />
            </a>

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

            <div className={styles.content}>
              <div
                data-title
                className={styles.titleBlock}
              >
                <p className={styles.eyebrow}>
                  Solusi Kemasan untuk Bisnis
                </p>

<h1 className={styles.heading}>
  <span className={styles.headingLine}>
    <motion.span
      className={styles.headingText}
      initial={
        prefersReducedMotion
          ? false
          : { opacity: 0, y: "-110%" }
      }
      animate={{ opacity: 1, y: "0%" }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : {
              type: "spring",
              stiffness: 50,
              damping: 18,
              delay: 0.1,
            }
      }
    >
      Kemasan yang
    </motion.span>
  </span>

  <span className={styles.headingLine}>
    <motion.span
      className={styles.headingText}
      initial={
        prefersReducedMotion
          ? false
          : { opacity: 0, y: "-110%" }
      }
      animate={{ opacity: 1, y: "0%" }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : {
              type: "spring",
              stiffness: 50,
              damping: 18,
              delay: 0.24,
            }
      }
    >
      <strong className={styles.headingBold}>
        Menguatkan
      </strong>
    </motion.span>
  </span>

  <span className={styles.headingLine}>
    <motion.span
      className={styles.headingText}
      initial={
        prefersReducedMotion
          ? false
          : { opacity: 0, y: "-110%" }
      }
      animate={{ opacity: 1, y: "0%" }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : {
              type: "spring",
              stiffness: 50,
              damping: 18,
              delay: 0.38,
            }
      }
    >
     <em className={styles.headingItalic}>
  Identitas
</em>{" "}
<em className={`${styles.headingItalic} ${styles.headingItalicNavy}`}>
  Brand Anda.
</em>
    </motion.span>
  </span>
</h1>
                <p className={styles.description}>
                  Kemasan untuk produk makanan, minuman,
                  dan pengiriman yang dirancang mengikuti
                  kebutuhan bisnis Anda.
                </p>
              </div>

              <nav
                data-cta
                className={styles.actions}
                aria-label="Aksi utama"
              >
                {ACTIONS.map(
                  ({ href, label, Icon }) => (
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
                  )
                )}
              </nav>
            </div>

            <div
              data-cue
              className={styles.cue}
            >
              Gulir untuk melihat lebih banyak
              <span />
            </div>
          </div>
        </section>

<BrandIntroduction />
<CompanyStatistics />
<ProductShowcase />
      </div>
    </div>
  );
}