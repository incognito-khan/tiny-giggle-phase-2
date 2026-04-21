"use client";

import { cardsData } from "@/components/data/about/why-choose-us/why-choose-us-data";
import { ArrowRight, X, CheckCircle2 } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useAnimation,
  useInView,
} from "framer-motion";
import { useState, useRef, useEffect } from "react";

function DetailModal({ card, onClose }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Modal Card */}
        <motion.div
          className="relative z-10 bg-white rounded-3xl overflow-hidden w-full max-w-lg shadow-2xl"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Colored Header Band */}
          <div
            className="relative px-8 pt-10 pb-16"
            style={{
              background: `linear-gradient(135deg, ${card.iconBg}cc, ${card.iconBg}55)`,
            }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/30 hover:bg-white/60 transition-colors flex items-center justify-center text-gray-700"
            >
              <X size={18} />
            </button>

            {/* Icon */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
              style={{ backgroundColor: card.iconBg }}
            >
              {card.icon}
            </div>

            <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-1">
              Who we work with
            </p>
            <h2 className="text-3xl font-bold text-[#2C3E50]">{card.title}</h2>
          </div>

          {/* Overlapping Content Card */}
          <div className="relative -mt-8 mx-4 bg-white rounded-2xl shadow-md px-6 pt-6 pb-4 mb-4">
            <h3 className="text-base font-bold text-[#2C3E50] mb-2">
              {card.detail.heading}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {card.detail.body}
            </p>
          </div>

          {/* Highlights */}
          <div className="px-8 pb-8">
            <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-3">
              Highlights
            </p>
            <ul className="space-y-2">
              {card.detail.highlights.map((point, i) => (
                <motion.li
                  key={i}
                  className="flex items-center gap-3 text-sm text-gray-600 font-medium"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.07, duration: 0.25 }}
                >
                  <CheckCircle2
                    size={17}
                    className="shrink-0"
                    style={{ color: card.iconBg }}
                  />
                  {point}
                </motion.li>
              ))}
            </ul>

            {/* Footer CTA */}
            <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">Tiny Giggle Platform</p>
              <button
                onClick={onClose}
                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white px-4 py-2 rounded-full transition-all duration-200 hover:opacity-90 active:scale-95 cursor-pointer"
                style={{ backgroundColor: card.iconBg }}
              >
                Got it <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function WhyChooseUs() {
  const ref = useRef(null);
  const subControls = useAnimation();
  const mainControls = useAnimation();
  const inView = useInView(ref, { once: false, amount: 0.4 });
  const [activeCard, setActiveCard] = useState(null);

  const charVariant = {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },
  };

  const subVariants = {
    hidden: {},
    visible: { transition: { when: "beforeChildren", staggerChildren: 0.03 } },
  };

  const mainVariants = {
    hidden: {},
    visible: { transition: { when: "beforeChildren", staggerChildren: 0.03 } },
  };

  useEffect(() => {
    if (inView) {
      subControls.start("visible").then(() => {
        setTimeout(() => mainControls.start("visible"), 50);
      });
    } else {
      subControls.start("hidden");
      mainControls.start("hidden");
    }
  }, [inView, mainControls, subControls]);

  return (
    <>
      {/* Modal */}
      <AnimatePresence>
        {activeCard && (
          <DetailModal card={activeCard} onClose={() => setActiveCard(null)} />
        )}
      </AnimatePresence>

      <div ref={ref} className="min-h-screen py-16 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-16">
            <div className="flex-1">
              <div className="mb-8">
                <div className="relative w-[80px] h-[80px]">
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
                      Tiny Giggle brings together doctors, babysitters,
                      musicians, creators, and service providers into one
                      trusted ecosystem. Whether you provide care, share
                      knowledge, or offer services, this platform helps you
                      reach families, build trust, and make a meaningful impact.
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
                className="relative bg-white rounded-2xl p-8 transition-shadow shadow-[15px_0px_rgba(194,123,12,1)] hover:shadow-[15px_0px_rgba(112,25,122,1)]"
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

                <button
                  onClick={() => setActiveCard(card)}
                  className="flex items-center gap-2 text-[#8B7355] font-medium text-sm hover:text-[#F39C12] transition-colors cursor-pointer"
                >
                  READ MORE
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
