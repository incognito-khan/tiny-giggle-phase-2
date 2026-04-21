"use client";

import { Send, Check } from "lucide-react";
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

export default function AdmissionSection() {
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
    <div ref={ref} className="relative">
      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Left Side - Image */}
        <div className="relative flex">
          {/* Image placeholder */}
          <img
            className="w-full bg-gray-200"
            // src="https://html.vecurosoft.com/toddly/demo/assets/img/feedback/feedback-image-h2-1.jpg"
            src="/professionals/questions.jpeg"
          />
        </div>

        {/* Right Side – Form */}
        <div className="bg-[#25283E] relative flex items-center justify-center ">
          {/* Paper Airplane Decoration */}
          <div className="absolute top-16 right-16">
            <Send className="w-12 h-12 text-white/20 transform rotate-45" />
          </div>

          {/* Bubble Decorations */}
          <div className="absolute bottom-16 right-8">
            <div className="flex flex-col gap-2">
              <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
              <div className="w-2 h-2 bg-pink-300 rounded-full ml-4"></div>
              <div className="w-4 h-4 bg-pink-500 rounded-full ml-2"></div>
            </div>
          </div>
          <div className="w-full max-w-md">
            {/* Section Label & Heading */}
            <div className="mb-6">
              <motion.p
                className="text-white/70 text-xl font-medium tracking-wider uppercase my-5 title"
                variants={subVariants}
                initial="hidden"
                animate={subControls}
              >
                {"Have Questions?".split("").map((ch, i) => (
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
                className="text-4xl font-bold text-white leading-tight"
                variants={mainVariants}
                initial="hidden"
                animate={mainControls}
              >
                {"We’re here to help you with any queries about joining Tiny Giggle."
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

              <p className="text-white/60 mt-4 text-sm">
                If you’re a doctor, babysitter, musician, or seller looking to
                join our platform, feel free to reach out. Our team is ready to
                guide you through the process and answer any questions you may
                have. We’ll get back to you as soon as possible to help you get
                started.
              </p>
            </div>

            <form className="space-y-4">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full bg-transparent border border-white/20 rounded-full px-6 py-3 text-white placeholder-white/60 focus:border-[#F39C12] transition-colors"
                />
                <input
                  type="text"
                  placeholder="Email"
                  className="w-full bg-transparent border border-white/20 rounded-full px-6 py-3 text-white placeholder-white/60 focus:border-[#F39C12] transition-colors"
                />
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Phone Number"
                  className="w-full bg-transparent border border-white/20 rounded-full px-6 py-3 text-white placeholder-white/60 focus:border-[#F39C12] transition-colors"
                />
                <select
                  name="profession"
                  id="profession"
                  className="w-full bg-transparent border border-white/20 rounded-full px-6 py-3 text-white placeholder-white/60 focus:border-[#F39C12] transition-colors"
                >
                  <option className="text-black" value="">
                    Select Your Role
                  </option>
                  <option className="text-black" value="doctor">
                    Doctor
                  </option>
                  <option className="text-black" value="babysitter">
                    Babysitter
                  </option>
                  <option className="text-black" value="musician">
                    Musician
                  </option>
                  <option className="text-black" value="seller">
                    Seller
                  </option>
                </select>
              </div>

              {/* Row 3 – Address */}
              <textarea
                rows={4}
                placeholder="Your Message"
                className="w-full bg-transparent border border-white/20 rounded-2xl px-6 py-3 text-white placeholder-white/60 focus:border-[#F39C12] transition-colors"
              />

              {/* Weekly Progress Checkbox */}
              <div className="flex items-center gap-3 py-2">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="notify"
                    className="sr-only"
                    defaultChecked
                  />
                  <label
                    htmlFor="notify"
                    className="flex items-center justify-center w-5 h-5 bg-[#F39C12] rounded cursor-pointer"
                  >
                    <Check className="w-3 h-3 text-white" />
                  </label>
                </div>
                <label
                  htmlFor="notify"
                  className="text-white text-sm cursor-pointer"
                >
                  Send Weekly Memory Prompts via Email
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-brand text-white font-bold py-3 px-8 rounded-full hover:bg-secondary transition-colors"
                >
                  GET STARTED
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Curved Bottom Background */}
      <div className="relative">
        <svg
          className="w-full h-24 fill-white"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path d="M0,0 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z" />
        </svg>
        <div className="bg-white"></div>
      </div>
    </div>
  );
}
