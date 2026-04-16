"use client";

import { useState, useRef, useEffect } from "react";
import { Check } from "lucide-react";
import CustomButton from "@/components/ui/button/button";
import {
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
  motion,
  useAnimation,
  useInView,
} from "framer-motion";
import {
  homeTabContent,
  professionalTabContent,
} from "@/components/data/home/learning";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Learning() {
  const pathname = usePathname();

  const isHomePage = pathname === "/";
  const isAboutPage = pathname === "/about";
  const isForProfessionalsPage = pathname === "/for-professionals";

  const homeTabs = [
    "Meaningful Moments",
    "Thoughtful Essentials",
    "Care Without Confusion",
  ];

  const professionalTabs = ["Doctors", "Babysitters", "Musicians", "Sellers"];

  const tabs = isHomePage
    ? homeTabs
    : isForProfessionalsPage
      ? professionalTabs
      : [];

  const tabContent = isHomePage
    ? homeTabContent
    : isForProfessionalsPage
      ? professionalTabContent
      : {};

  const [activeTab, setActiveTab] = useState(
    isHomePage
      ? "Meaningful Moments"
      : isAboutPage
        ? ""
        : isForProfessionalsPage
          ? "Doctors"
          : "",
  );

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
    <div
      ref={ref}
      className="py-16 bg-gray-50 relative overflow-hidden"
      style={{
        backgroundImage: `url(https://html.vecurosoft.com/toddly/demo/assets/img/about/vs-about-h1-bg.png)`,
      }}
    >
      {/* Dotted Border Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-4">
        <div className="w-full h-1 border-b-2 border-dotted border-gray-300"></div>
      </div>

      {/* Palm Tree Decoration */}
      <div className="absolute bottom-8 right-12">
        <img
          src="https://html.vecurosoft.com/toddly/demo/assets/img/about/vs-about-h1-ele-4.png"
          alt=""
        />
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-5 items-center">
          <div className="relative w-full">
            <img
              className=""
              src="https://html.vecurosoft.com/toddly/demo/assets/img/about/vs-about-h3-1.png"
              alt=""
            />
          </div>

          {/* Right Side - Content */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              {/* Animated Subheading */}
              <motion.h3
                className="text-gray-500 text-xl font-medium tracking-wider uppercase mb-2 title"
                variants={subVariants}
                initial="hidden"
                animate={subControls}
              >
                {isHomePage &&
                  "Explore Our Platform Features".split("").map((ch, i) => (
                    <motion.span
                      key={i}
                      variants={charVariant}
                      aria-hidden="true"
                    >
                      {ch}
                    </motion.span>
                  ))}
                {isForProfessionalsPage &&
                  "Join & Contribute".split("").map((ch, i) => (
                    <motion.span
                      key={i}
                      variants={charVariant}
                      aria-hidden="true"
                    >
                      {ch}
                    </motion.span>
                  ))}
                {isAboutPage &&
                  "Founder’s Message".split("").map((ch, i) => (
                    <motion.span
                      key={i}
                      variants={charVariant}
                      aria-hidden="true"
                    >
                      {ch}
                    </motion.span>
                  ))}
              </motion.h3>

              {/* Animated Main Heading */}
              <motion.h2
                className="text-4xl font-bold text-gray-800 leading-tight"
                variants={mainVariants}
                initial="hidden"
                animate={mainControls}
              >
                {isHomePage &&
                  "Digital Spaces for Growing Memories"
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
                {isForProfessionalsPage &&
                  "Become a part of Tiny Giggle and offer your skills, services, and creativity to families who value trust and quality."
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
                {isAboutPage &&
                  "A note from the heart of Tiny Giggle"
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
              </motion.h2>
            </div>

            {!isAboutPage && (
              <>
                {/* Tabs */}
                <div className="flex gap-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        activeTab === tab
                          ? "bg-brand text-white shadow-lg"
                          : "bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 border border-gray-200"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Content Text with Animation */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-4 shrink-0 w-[600px]"
                  >
                    <p className="text-gray-600 leading-relaxed">
                      {tabContent[activeTab].text}
                    </p>

                    {/* Checklist */}
                    <div className="space-y-3">
                      {tabContent[activeTab].checklist.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-brand rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-gray-700 font-medium">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </>
            )}

            {isAboutPage && (
              <div className="space-y-4">
                <p>
                  A simple idea that grew into a space for care, connection, and
                  every small moment that matters.
                </p>
                <p>
                  Tiny Giggle was created with one belief, parenting should feel
                  supported, not overwhelming. Every feature is thoughtfully
                  designed to bring clarity, care, and ease into a parent’s
                  daily life.
                </p>
                <p>
                  From tracking growth to preserving memories, our purpose is to
                  make every moment meaningful and easy to manage. We believe
                  every child’s journey deserves attention, and every parent
                  deserves a space they can trust.
                </p>
                <p>
                  Tiny Giggle is more than a platform, it’s a companion for the
                  journey of growing up.
                </p>
              </div>
            )}

            {/* Contact Button */}
            <Link href={isForProfessionalsPage ? "/join" : "/contact"}>
              <div className="pt-4">
                <CustomButton
                  variant="primary"
                  size="lg"
                  className="px-8 py-4 text-base font-bold cursor-pointer"
                >
                  {isForProfessionalsPage ? "JOIN US" : "CONTACT US"}
                </CustomButton>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
