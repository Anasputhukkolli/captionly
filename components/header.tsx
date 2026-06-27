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
        <Link href="/" className="text-black font-black text-2xl tracking-tight">
          Captionly<span className="text-[#F5C800]">.</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden sm:flex items-center gap-6">
          {navLinks.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-sm font-bold text-gray-500 hover:text-black transition-colors uppercase tracking-widest"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <span className="inline-flex items-center gap-2 bg-black text-[#F5C800] font-bold text-xs px-4 py-2 rounded-full uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-[#F5C800] animate-pulse" />
            Coming Soon
          </span>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden flex flex-col gap-[5px] p-2"
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-[2.5px] bg-black rounded transition-all duration-300 ${
              menuOpen ? "rotate-45 translate-y-[7.5px]" : ""
            }`}
          />
          <span
            className={`block w-6 h-[2.5px] bg-black rounded transition-all duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-[2.5px] bg-black rounded transition-all duration-300 ${
              menuOpen ? "-rotate-45 -translate-y-[7.5px]" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="sm:hidden border-t-2 border-black bg-[#F5C800] px-6 py-5 flex flex-col gap-4">
          {navLinks.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="text-black font-black text-sm uppercase tracking-widest"
            >
              {label}
            </Link>
          ))}
          <span className="inline-flex items-center gap-2 bg-black text-[#F5C800] font-bold text-xs px-4 py-2 rounded-full uppercase tracking-widest w-fit mt-2">
            <span className="w-2 h-2 rounded-full bg-[#F5C800] animate-pulse" />
            Coming Soon
          </span>
        </div>
      )}
    </header>
  );
}