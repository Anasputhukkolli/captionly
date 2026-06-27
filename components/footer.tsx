"use client";

import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap');

        .logo-fun {
          animation: logoWiggle 2s ease-in-out infinite;
          transform-origin: center bottom;
          display: inline-block;
          cursor: pointer;
        }
        @keyframes logoWiggle {
          0%   { transform: rotate(-3deg) scale(1); }
          15%  { transform: rotate(3deg) scale(1.05); }
          30%  { transform: rotate(-2deg) scale(1); }
          45%  { transform: rotate(2deg) scale(1.03); }
          60%  { transform: rotate(-1deg) scale(1); }
          75%  { transform: rotate(1deg) scale(1.02); }
          100% { transform: rotate(-3deg) scale(1); }
        }
        @keyframes logoSpin360 {
          from { transform: rotate(0deg) scale(1); }
          to   { transform: rotate(360deg) scale(1.1); }
        }
        
      `}</style>

      <footer className="border-t-2 border-black bg-white">
        {/* Powered by strip */}
        <div className="border-t-2 border-black/10">
          <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-center gap-3">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Powered by
            </span>
            <a
              href="https://anasey.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/anaslogo.png"
                alt="Kalkus Studio"
                width={65}
                height={60}
                className="logo-fun object-contain"
                priority
              />
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}