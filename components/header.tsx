"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Generate", href: "/generate" },
    { label: "Pricing", href: "/pricing" },
  ];

  return (
    <header className="border-b-2 border-black bg-white sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="relative inline-block">
          <span className="inline-flex text-black font-black text-2xl tracking-tight">
            {"Captiondoo".split("").map((letter, i) => (
              <span
                key={i}
                className="inline-block animate-[logoBounce_2.4s_ease-in-out_infinite]"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                {letter}
              </span>
            ))}
            <span className="inline-block text-[#F5C800] animate-[dotBounce_2.4s_ease-in-out_infinite]" style={{ animationDelay: "0.54s" }}>
              .
            </span>
          </span>

          <svg
            className="absolute -bottom-1 left-0 w-full animate-[underlineWave_3s_ease-in-out_infinite]"
            height="8"
            viewBox="0 0 120 8"
            preserveAspectRatio="none"
          >
            <path
              d="M1 4 Q 15 0, 30 4 T 60 4 T 90 4 T 119 4"
              stroke="#F5C800"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden sm:flex items-center gap-6">
          {navLinks.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-sm font-bold text-gray-500 hover:text-black transition-colors uppercase tracking-widest cursor-pointer"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <span className="inline-flex items-center gap-2 bg-black text-[#F5C800] font-bold text-xs px-4 py-2 rounded-full uppercase tracking-widest">
            <svg
              className="w-3 h-3 animate-[spin_2.5s_linear_infinite]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 8a4 4 0 100 8 4 4 0 000-8zm9.4 4a7.4 7.4 0 01-.12 1.3l2.03 1.59a.5.5 0 01.12.63l-1.92 3.32a.5.5 0 01-.6.22l-2.39-.96a7.5 7.5 0 01-2.25 1.3l-.36 2.54a.5.5 0 01-.5.42h-3.84a.5.5 0 01-.5-.42l-.36-2.54a7.5 7.5 0 01-2.25-1.3l-2.39.96a.5.5 0 01-.6-.22L1.65 15.5a.5.5 0 01.12-.63L3.8 13.3a7.4 7.4 0 010-2.6L1.77 9.1a.5.5 0 01-.12-.63l1.92-3.32a.5.5 0 01.6-.22l2.39.96c.68-.55 1.44-.99 2.25-1.3l.36-2.54a.5.5 0 01.5-.42h3.84a.5.5 0 01.5.42l.36 2.54c.81.31 1.57.75 2.25 1.3l2.39-.96a.5.5 0 01.6.22l1.92 3.32a.5.5 0 01-.12.63L21.28 10.7c.08.42.12.85.12 1.3z" />
            </svg>
            Work in Progress
          </span>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden relative z-50 flex flex-col gap-[5px] p-2 cursor-pointer"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span
            className={`block w-6 h-[2.5px] bg-black rounded transition-transform duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] origin-center ${
              menuOpen ? "rotate-45 translate-y-[7.5px]" : ""
            }`}
          />
          <span
            className={`block w-6 h-[2.5px] bg-black rounded transition-all duration-200 ease-out ${
              menuOpen ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100"
            }`}
          />
          <span
            className={`block w-6 h-[2.5px] bg-black rounded transition-transform duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] origin-center ${
              menuOpen ? "-rotate-45 -translate-y-[7.5px]" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu — always mounted, animated via grid-template-rows so
          both open AND close transitions are smooth (no abrupt unmount). */}
      <div
        className={`sm:hidden grid overflow-hidden border-black transition-[grid-template-rows,border-top-width] duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] ${
          menuOpen ? "grid-rows-[1fr] border-t-2" : "grid-rows-[0fr] border-t-0"
        } bg-[#F5C800]`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="px-6 py-5 flex flex-col gap-4">
            {navLinks.map(({ label, href }, i) => (
              <Link
                key={label}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="text-black font-black text-sm uppercase tracking-widest transition-all duration-300 ease-out cursor-pointer"
                style={{
                  transitionDelay: menuOpen ? `${80 + i * 60}ms` : "0ms",
                  opacity: menuOpen ? 1 : 0,
                  transform: menuOpen ? "translateY(0)" : "translateY(-6px)",
                }}
              >
                {label}
              </Link>
            ))}
            <span
              className="inline-flex items-center gap-2 bg-black text-[#F5C800] font-bold text-xs px-4 py-2 rounded-full uppercase tracking-widest w-fit mt-2 transition-all duration-300 ease-out"
              style={{
                transitionDelay: menuOpen ? `${80 + navLinks.length * 60}ms` : "0ms",
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? "translateY(0)" : "translateY(-6px)",
              }}
            >
              <svg
                className="w-3 h-3 animate-[spin_2.5s_linear_infinite]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 8a4 4 0 100 8 4 4 0 000-8zm9.4 4a7.4 7.4 0 01-.12 1.3l2.03 1.59a.5.5 0 01.12.63l-1.92 3.32a.5.5 0 01-.6.22l-2.39-.96a7.5 7.5 0 01-2.25 1.3l-.36 2.54a.5.5 0 01-.5.42h-3.84a.5.5 0 01-.5-.42l-.36-2.54a7.5 7.5 0 01-2.25-1.3l-2.39.96a.5.5 0 01-.6-.22L1.65 15.5a.5.5 0 01.12-.63L3.8 13.3a7.4 7.4 0 010-2.6L1.77 9.1a.5.5 0 01-.12-.63l1.92-3.32a.5.5 0 01.6-.22l2.39.96c.68-.55 1.44-.99 2.25-1.3l.36-2.54a.5.5 0 01.5-.42h3.84a.5.5 0 01.5.42l.36 2.54c.81.31 1.57.75 2.25 1.3l2.39-.96a.5.5 0 01.6.22l1.92 3.32a.5.5 0 01-.12.63L21.28 10.7c.08.42.12.85.12 1.3z" />
              </svg>
              Work in Progress
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes logoBounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes dotBounce {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-7px) scale(1.2);
          }
        }

        @keyframes underlineWave {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(3px);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </header>
  );
}