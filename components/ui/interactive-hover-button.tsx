
"use client";

import Link from "next/link";
import type { ReactNode } from "react";

interface InteractiveHoverButtonProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export function InteractiveHoverButton({
  href,
  children,
  className = "",
}: InteractiveHoverButtonProps) {
  return (
    <Link
      href={href}
      className={`group relative isolate inline-flex min-h-12 items-center justify-center overflow-hidden rounded-full border border-[#173B66]/20 bg-white/20 px-6 py-3 text-sm font-semibold text-[#173B66] backdrop-blur-md transition-colors duration-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#29A9C5] ${className}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-[7%] top-1/2 z-0 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[#153D70] transition-all duration-500 ease-out group-hover:left-0 group-hover:top-0 group-hover:h-full group-hover:w-full group-hover:translate-y-0 group-hover:rounded-full motion-reduce:transition-none"
      />

      <span className="relative z-10 inline-flex items-center gap-2 transition-transform duration-300 group-hover:translate-x-1">
        {children}
      </span>

      <span
        aria-hidden="true"
        className="relative z-10 ml-2 transition-transform duration-300 group-hover:translate-x-1"
      >
        →
      </span>
    </Link>
  );
}
