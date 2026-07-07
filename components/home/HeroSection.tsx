export default function HeroSection() {
  return (
    <>
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#F5C518] px-4 py-1.5 text-xs font-black uppercase tracking-wide text-black shadow-[3px_3px_0_0_#000] animate-[wobble_3s_ease-in-out_infinite]">
        <span className="inline-block animate-[spin_3s_linear_infinite]">
          ⚡
        </span>
        Captiondoo — AI Content Studio
      </div>

      <h1 className="max-w-4xl text-6xl leading-[1.05] tracking-wide text-black sm:text-7xl md:text-8xl lg:text-9xl [font-family:var(--font-bubblegum)]">
        <span className="inline-flex flex-wrap justify-center gap-x-4">
          {"One Upload.".split(" ").map((word, i) => (
            <span
              key={i}
              className="inline-block animate-[bounce-fun_2s_ease-in-out_infinite]"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              {word}
            </span>
          ))}
        </span>
        <br />
        <span className="relative inline-block">
          <span className="relative z-10 inline-flex flex-wrap justify-center gap-x-4">
            {"Every Platform".split(" ").map((word, i) => (
              <span
                key={i}
                className="inline-block animate-[bounce-fun_2s_ease-in-out_infinite]"
                style={{ animationDelay: `${0.4 + i * 0.2}s` }}
              >
                {word}
              </span>
            ))}
          </span>
          <svg
            className="absolute -bottom-2 left-0 w-full animate-[wave_2.5s_ease-in-out_infinite]"
            height="20"
            viewBox="0 0 300 14"
            preserveAspectRatio="none"
          >
            <path
              d="M2 8 Q 60 2, 120 8 T 298 7"
              stroke="#F5C518"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </h1>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes wobble {
          0%,
          100% {
            transform: rotate(-2deg);
          }
          50% {
            transform: rotate(2deg);
          }
        }

        @keyframes bounce-fun {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-10px) rotate(-3deg);
          }
          50% {
            transform: translateY(0) rotate(0deg);
          }
          75% {
            transform: translateY(-4px) rotate(3deg);
          }
        }

        @keyframes wave {
          0%,
          100% {
            transform: translateX(0) scaleY(1);
          }
          50% {
            transform: translateX(4px) scaleY(1.3);
          }
        }
      `}</style>
    </>
  );
}