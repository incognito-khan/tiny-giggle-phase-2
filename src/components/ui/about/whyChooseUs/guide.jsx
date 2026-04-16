"use client";

import {
  PlayIcon as Playground,
  Mic,
  Coffee,
  ShoppingBag,
  Lock,
  Eye,
  Shield,
  Check,
} from "lucide-react";
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

export default function GuideSection() {
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
    <div ref={ref} className="min-h-screen bg-[#faf8f5] py-16 px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            className="text-[#8B7355] text-xl font-medium tracking-wider uppercase mb-4 title"
            variants={subVariants}
            initial="hidden"
            animate={subControls}
          >
            {"How It Works".split("").map((ch, i) => (
              <motion.span key={i} variants={charVariant} aria-hidden="true">
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
            {"Join Tiny Giggle in a few simple steps and start your journey with us."
              .split("")
              .map((ch, i) => (
                <motion.span key={i} variants={charVariant} aria-hidden="true">
                  {ch}
                </motion.span>
              ))}
          </motion.h1>
        </div>

        {/* Main Content Grid */}
        <div className="relative grid grid-cols-3 gap-8">
          <div className="flex flex-col gap-10">
            {/* Top Left Service */}
            <div className="col-span-1 flex items-center justify-end gap-5 text-center">
              <div className="flex flex-col gap-1 w-[65%]">
                <h2 className="text-2xl font-bold text-gray-800">
                  Apply & Register
                </h2>
                <p className="text-[#6B7280] text-base leading-relaxed mb-6 text-right mx-auto">
                  Create your account and submit your application to join Tiny
                  Giggle.
                </p>
              </div>
              <div className="w-[90px] h-[90px] bg-brand rounded-full flex items-center justify-center border-4 border-dashed border-gray-200 shrink-0">
                <Lock className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Top Right Service */}
            <div className="col-span-1 flex items-center justify-end gap-5 text-center">
              <div className="flex flex-col gap-1 w-[65%]">
                <h2 className="text-2xl font-bold text-gray-800">
                  Application Review
                </h2>
                <p className="text-[#6B7280] text-base leading-relaxed mb-6 text-right mx-auto">
                  Our team will review your application and notify you via email
                  if you are selected to proceed.
                </p>
              </div>
              <div className="w-[90px] h-[90px] bg-brand rounded-full flex items-center justify-center border-4 border-dashed border-gray-200 shrink-0">
                <Eye className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Central Image with Badge */}
          <div className="col-span-1 flex items-center justify-center relative">
            <img
              src="https://html.vecurosoft.com/toddly/demo/assets/img/feature/feature-image-3-1.png"
              alt="Kids engaged in activities"
            />
          </div>

          <div className="flex flex-col gap-10">
            {/* Bottom Left Service */}
            <div className="col-span-1 flex items-center justify-start gap-5 text-center">
              <div className="flex flex-col gap-1 w-[65%]">
                <h2 className="text-2xl font-bold text-gray-800">
                  Submit Verification
                </h2>
                <p className="text-[#6B7280] text-base leading-relaxed mb-6 text-left mx-auto">
                  Provide your verification documents to ensure trust, safety,
                  and authenticity on the platform.
                </p>
              </div>
              <div className="w-[90px] h-[90px] bg-brand rounded-full flex items-center justify-center border-4 border-dashed border-gray-200 shrink-0">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Bottom Right Service */}
            <div className="col-span-1 flex items-center justify-start gap-5 text-center">
              <div className="flex flex-col gap-1 w-[65%]">
                <h2 className="text-2xl font-bold text-gray-800">
                  Final Submission & Approval
                </h2>
                <p className="text-[#6B7280] text-base leading-relaxed mb-6 text-left mx-auto">
                  Submit a short introduction video, and once approved, you’re
                  ready to start your journey with Tiny Giggle.
                </p>
              </div>
              <div className="w-[90px] h-[90px] bg-brand rounded-full flex items-center justify-center border-4 border-dashed border-gray-200 shrink-0">
                <Check className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
