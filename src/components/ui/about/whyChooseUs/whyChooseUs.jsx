"use client";

import { cardsData } from "@/components/data/about/why-choose-us/why-choose-us-data";
import { ArrowRight, Volume2, Home, PinIcon as Pinwheel } from "lucide-react";
import {
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
  motion,
  useAnimation,
  useInView,
} from "framer-motion";
import { useState, useRef, useEffect } from "react";

export default function WhyChooseUs() {
  const ref = useRef(null);
  const subControls = useAnimation();
  const mainControls = useAnimation();
  const inView = useInView(ref, { once: false, amount: 0.4 });

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
    <div ref={ref} className="min-h-screen py-16 px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-16">
          <div className="flex-1">
            {/* Logo */}
            <div className="mb-8">
              <div className="relative w-[80px] h-[80px]">
                {/* Airplane icon */}
                <div className="absolute inset-0 flex items-center justify-center w-full h-full">
                  <img
                    className="w-full h-full"
                    src="https://html.vecurosoft.com/toddly/demo/assets/img/why/why-choose-us-ele1.png"
                    alt=""
                  />
                </div>
              </div>
            </div>
            <div className="flex space-between w-full items-end">
              <div className="mb-4 w-full">
                <motion.p
                  className="text-[#8B7355] font-medium tracking-wider uppercase mb-2 title text-xl"
                  variants={subVariants}
                  initial="hidden"
                  animate={subControls}
                >
                  {"Grow With Tiny Giggle".split("").map((ch, i) => (
                    <motion.span
                      key={i}
                      variants={charVariant}
                      aria-hidden="true"
                    >
                      {ch}
                    </motion.span>
                  ))}
                </motion.p>

                <motion.h1
                  className="text-5xl font-bold text-[#2C3E50] leading-tight"
                  variants={mainVariants}
                  initial="hidden"
                  animate={mainControls}
                >
                  {"A platform designed for professionals to connect, contribute, and grow while supporting families and children."
                    .split("")
                    .map((ch, i) => (
                      <motion.span
                        key={i}
                        variants={charVariant}
                        aria-hidden="true"
                      >
                        {ch}
                      </motion.span>
                    ))}
                </motion.h1>
              </div>
              <div className="w-1/2">
                <div className="p-6">
                  <p className="text-gray-600 font-semibold text-base leading-relaxed border-l-2 border-brand pl-3">
                    Tiny Giggle brings together doctors, babysitters, musicians,
                    creators, and service providers into one trusted ecosystem.
                    Whether you provide care, share knowledge, or offer
                    services, this platform helps you reach families, build
                    trust, and make a meaningful impact.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cardsData.map((card) => (
            <div
              key={card.id}
              className={`relative bg-white rounded-2xl p-8 transition-shadow shadow-[15px_0px_rgba(194,123,12,1)] hover:shadow-[15px_0px_rgba(112,25,122,1)]`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: card.iconBg }}
                >
                  {card.icon}
                </div>
                <h2 className="text-2xl font-bold text-[#2C3E50]">
                  {card.title}
                </h2>
              </div>

              <p className="text-[#4b4f57] font-semibold text-base leading-relaxed mb-6 font-roboto">
                {card.description}
              </p>

              <button className="flex items-center gap-2 text-[#8B7355] font-medium text-sm hover:text-[#F39C12] transition-colors">
                READ MORE
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
