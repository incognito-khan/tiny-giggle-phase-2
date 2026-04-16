"use client";

import { useRef, useEffect } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { sessionsData } from "@/components/data/home/sessiondata";

export default function Session() {
  const ref = useRef(null);
  const subControls = useAnimation();
  const mainControls = useAnimation();
  const inView = useInView(ref, { once: false, amount: 0.4 });

  const subText = "Child Care & Moments";
  const headingText = "Everything in One Place.";

  // Variant for individual characters
  const charVariant = {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },
  };

  // Subheading container with staggered children
  const subVariants = {
    hidden: {},
    visible: { transition: { when: "beforeChildren", staggerChildren: 0.03 } },
  };

  // Main heading container with staggered children
  const mainVariants = {
    hidden: {},
    visible: { transition: { when: "beforeChildren", staggerChildren: 0.03 } },
  };

  useEffect(() => {
    if (inView) {
      // Animate subheading first
      subControls.start("visible").then(() => {
        // After 1s, animate main heading
        setTimeout(() => mainControls.start("visible"), 50);
      });
    } else {
      // Reset both
      subControls.start("hidden");
      mainControls.start("hidden");
    }
  }, [inView, mainControls, subControls]);

  return (
    <div ref={ref} className="relative bg-[#70167E] py-16 overflow-hidden">
      {/* Decorative scalloped border top */}
      <div className="absolute top-0 left-0 w-full h-4">
        <svg
          viewBox="0 0 1200 24"
          className="w-full h-full fill-white"
          preserveAspectRatio="none"
        >
          <path d="M0,24 C20,8 40,8 60,24 C80,8 100,8 120,24 C140,8 160,8 180,24 C200,8 220,8 240,24 C260,8 280,8 300,24 C320,8 340,8 360,24 C380,8 400,8 420,24 C440,8 460,8 480,24 C500,8 520,8 540,24 C560,8 580,8 600,24 C620,8 640,8 660,24 C680,8 700,8 720,24 C740,8 760,8 780,24 C800,8 820,8 840,24 C860,8 880,8 900,24 C920,8 940,8 960,24 C980,8 1000,8 1020,24 C1040,8 1060,8 1080,24 C1100,8 1120,8 1140,24 C1160,8 1180,8 1200,24 L1200,0 L0,0 Z" />
        </svg>
      </div>

      {/* Decorative scalloped border bottom */}
      <div className="absolute bottom-0 left-0 w-full h-4">
        <svg
          viewBox="0 0 1200 24"
          className="w-full h-full fill-white"
          preserveAspectRatio="none"
        >
          <path d="M0,0 C20,16 40,16 60,0 C80,16 100,16 120,0 C140,16 160,16 180,0 C200,16 220,16 240,0 C260,16 280,16 300,0 C320,16 340,16 360,0 C380,16 400,16 420,0 C440,16 460,16 480,0 C500,16 520,16 540,0 C560,16 580,16 600,0 C620,16 640,16 660,0 C680,16 700,16 720,0 C740,16 760,16 780,0 C800,16 820,16 840,0 C860,16 880,16 900,0 C920,16 940,16 960,0 C980,16 1000,16 1020,0 C1040,16 1060,16 1080,0 C1100,16 1120,16 1140,0 C1160,16 1180,16 1200,0 L1200,24 L0,24 Z" />
        </svg>
      </div>

      {/* Cloud decorations on left */}
      <div className="absolute left-8 top-12">
        <div className="relative">
          {/* String line */}
          <div className="absolute left-1/2 -translate-x-px w-0.5 h-20 bg-white/30"></div>

          {/* Top cloud */}
          <div className="relative bg-white rounded-full w-20 h-12 mb-8">
            <div className="absolute -left-2 top-2 w-6 h-6 bg-white rounded-full"></div>
            <div className="absolute -right-2 top-1 w-8 h-8 bg-white rounded-full"></div>
            <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-4 h-4 bg-white rounded-full"></div>
            {/* Small circle on cloud */}
            <div className="absolute right-2 top-3 w-2 h-2 bg-purple-300 rounded-full"></div>
          </div>

          {/* Bottom cloud */}
          <div className="relative bg-white rounded-full w-16 h-10">
            <div className="absolute -left-1 top-1 w-5 h-5 bg-white rounded-full"></div>
            <div className="absolute -right-1 top-0 w-6 h-6 bg-white rounded-full"></div>
            <div className="absolute left-1/2 -translate-x-1/2 -top-0.5 w-3 h-3 bg-white rounded-full"></div>
            {/* Small circle on cloud */}
            <div className="absolute right-1 top-2 w-1.5 h-1.5 bg-purple-300 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Paper airplane on right */}
      <div className="absolute right-8 top-16">
        <div className="relative">
          {/* Dotted trail */}
          <div className="absolute right-12 top-2 w-24 h-px border-t-2 border-dotted border-white/40 transform -rotate-12"></div>
          <div className="absolute right-20 top-6 w-16 h-px border-t-2 border-dotted border-white/40 transform rotate-12"></div>

          {/* Paper airplane */}
          <div className="w-8 h-8 relative">
            <div className="absolute inset-0 bg-white transform rotate-45 rounded-sm"></div>
            <div className="absolute top-1 right-1 w-3 h-3 bg-purple-700 transform rotate-45"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          {/* Animated Subheading */}
          <motion.h3
            className="text-white/80 text-sm uppercase tracking-wider font-medium mb-4"
            variants={subVariants}
            initial="hidden"
            animate={subControls}
          >
            {subText.split("").map((ch, i) => (
              <motion.span key={i} variants={charVariant} aria-hidden="true">
                {ch}
              </motion.span>
            ))}
          </motion.h3>

          {/* Animated Main Heading */}
          <motion.h2
            className="text-white text-4xl lg:text-5xl font-bold leading-tight"
            variants={mainVariants}
            initial="hidden"
            animate={mainControls}
          >
            {headingText.split(" ").map((ch, i) => (
              <motion.span
                key={i}
                variants={charVariant}
                aria-hidden="true"
                className="inline-block mr-1"
              >
                {ch}
              </motion.span>
            ))}
          </motion.h2>
        </div>

        {/* Session Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Brain Train */}
          {/* <div className="bg-white rounded-2xl p-6 relative border-2 border-dashed border-purple-200"> */}
          {sessionsData.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.key}
                className="rounded-2xl p-10 relative h-[125px] w-[96%] mx-auto group "
                style={{
                  backgroundImage: `url(${s.bgImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="-mt-3">
                    <h3 className="text-gray-800 text-xl font-bold mb-2">
                      {s.title}
                    </h3>
                    <p className="text-gray-600 text-sm group-hover:text-amber-700 transition-all duration-300">
                      {s.description}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-[#70167E] rounded-full flex items-center justify-center group-hover:bg-amber-700 transition-all duration-300">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
