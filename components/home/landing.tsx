"use client";

import { useState, useEffect } from "react";

export default function ComingSoonPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const launchDate = new Date("2025-10-01T00:00:00");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const diff = launchDate.getTime() - now.getTime();
      if (diff <= 0) return;
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleSubmit = () => {
    if (email.trim()) {
      setSubmitted(true);
      setEmail("");
    }
  };

  const features = [
    {
      num: "01",
      title: "AI Caption Generator",
      desc: "Upload an image or video — get captions for Instagram, LinkedIn, Facebook & X instantly.",
    },
    {
      num: "02",
      title: "AI Hashtag Generator",
      desc: "Trending, niche, local, viral — the right hashtags for every post, every platform.",
    },
    {
      num: "03",
      title: "AI Reel Scripts",
      desc: "Hook, scenes, voice-over, CTA — a full Reel script in seconds.",
    },
    {
      num: "04",
      title: "AI Content Ideas",
      desc: "Never run out of ideas. Get 30 content ideas for your brand in one click.",
    },
    {
      num: "05",
      title: "Brand Workspace",
      desc: "Save your brand voice once. AI always writes in your tone — no repeating yourself.",
    },
  ];

  return (
    <main className="min-h-screen bg-white font-sans flex flex-col">
      

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto w-full px-6 pt-14 pb-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 border-2 border-black rounded-full px-5 py-2 mb-8 font-bold text-xs uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-[#F5C800]" />
          AI Social Media Content Studio
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-7xl font-black text-black leading-none tracking-tighter mb-4">
          One Upload.
          <br />
          <span className="relative inline-block">
            <span className="relative z-10">Every Platform.</span>
            <span
              className="absolute left-0 bottom-1 w-full h-4 sm:h-5 bg-[#F5C800] -z-0 rounded"
              aria-hidden
            />
          </span>
        </h1>

        <p className="text-gray-500 text-base sm:text-lg max-w-xl mb-10 leading-relaxed">
          Generate AI-powered captions, hashtags, reel scripts, and content
          ideas for Instagram, LinkedIn, Facebook & X — in under 10 seconds.
        </p>

        {/* Countdown */}
        <div className="grid grid-cols-4 gap-3 sm:gap-4 mb-10 w-full max-w-sm">
          {[
            { label: "Days", value: timeLeft.days },
            { label: "Hours", value: timeLeft.hours },
            { label: "Mins", value: timeLeft.minutes },
            { label: "Secs", value: timeLeft.seconds },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-[#F5C800] border-2 border-black rounded-2xl flex flex-col items-center py-4 px-2 shadow-[4px_4px_0px_0px_#000]"
            >
              <span className="text-3xl sm:text-4xl font-black text-black leading-none tabular-nums">
                {String(value).padStart(2, "0")}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-black/60 mt-1">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Email notify */}
        {!submitted ? (
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 border-2 border-black rounded-xl px-5 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#F5C800] placeholder:text-gray-400"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <button
              onClick={handleSubmit}
              className="bg-black text-[#F5C800] font-black px-7 py-3 rounded-xl uppercase tracking-widest text-xs hover:bg-[#F5C800] hover:text-black transition-all border-2 border-black shadow-[4px_4px_0px_0px_#F5C800] hover:shadow-none active:translate-y-0.5"
            >
              Notify Me
            </button>
          </div>
        ) : (
          <div className="bg-[#F5C800] border-2 border-black rounded-2xl px-8 py-4 font-black text-black text-base shadow-[4px_4px_0px_0px_#000]">
            You're on the early access list 🚀
          </div>
        )}

        <p className="text-gray-400 text-xs mt-4 font-medium">
          Be the first to know when we launch. No spam.
        </p>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto w-full px-6">
        <div className="border-t-2 border-black/10" />
      </div>

      {/* Features section */}
      <section className="max-w-5xl mx-auto w-full px-6 py-14">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-8">
          <span className="inline-flex items-center justify-center w-9 h-9 bg-black text-[#F5C800] rounded-xl text-xs font-black">
            ✦
          </span>
          <span className="font-black text-black text-lg uppercase tracking-widest">
            What's Coming
          </span>
          <div className="flex-1 h-[2px] bg-black/10" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ num, title, desc }) => (
            <div
              key={num}
              className="bg-[#F5C800] border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] hover:translate-y-[-2px] hover:shadow-[4px_6px_0px_0px_#000] transition-all"
            >
              <span className="inline-flex items-center justify-center w-8 h-8 bg-black text-[#F5C800] rounded-lg text-xs font-black mb-4">
                {num}
              </span>
              <h3 className="font-black text-black text-base mb-2">{title}</h3>
              <p className="text-black/70 text-sm leading-relaxed font-medium">
                {desc}
              </p>
            </div>
          ))}

          {/* CTA card */}
          <div className="bg-black border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#F5C800] flex flex-col justify-between">
            <p className="text-[#F5C800] font-black text-base mb-4">
              "One upload. Content for every platform. Under 10 seconds."
            </p>
            <span className="text-white/40 text-xs font-bold uppercase tracking-widest">
              — Captionly AI
            </span>
          </div>
        </div>
      </section>

    </main>
  );
}