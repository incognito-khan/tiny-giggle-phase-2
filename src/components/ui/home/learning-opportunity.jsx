"use client";

import { useState, useRef, useEffect } from "react";
import { Check, Rocket } from "lucide-react";
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
import { homeTabContent as tabContent } from "@/components/data/home/learning";

export default function LearningOpportunity() {
  const [activeTab, setActiveTab] = useState("Meaningful Moments");

  // const tabs = ["Growth & Milestones", "Memories", "Shopping & Music"];
  const tabs = [
    "Meaningful Moments",
    "Thoughtful Essentials",
    "Care Without Confusion",
  ];

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const springX = useSpring(rawX, { stiffness: 100, damping: 20 });
  const springY = useSpring(rawY, { stiffness: 100, damping: 20 });

  const xRocket = useTransform(springX, (v) => v * 0.1);
  const yRocket = useTransform(springY, (v) => v * 0.1);
  const xBalloon = useTransform(springX, (v) => v * 0.1);
  const yBalloon = useTransform(springY, (v) => v * 0.1);

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
      onMouseMove={(e) => {
        console.log(e.currentTarget.getBoundingClientRect());
        const rect = e.currentTarget.getBoundingClientRect();
        rawX.set(e.clientX - (rect.left + rect.width / 2));
        rawY.set(e.clientY - (rect.top + rect.height / 2));
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
          {/* Left Side - Images and Graphics */}
          <div className="relative w-full">
            {/* Top Left Small Image */}
            <div className="absolute top-0 left-0 z-10">
              <div className="w-[200px] h-[200px] rounded-2xl overflow-hidden shadow-lg">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url(https://html.vecurosoft.com/toddly/demo/assets/img/about/vs-about-h1-1.jpg)",
                  }}
                ></div>
              </div>
            </div>

            {/* Experience Badge */}
            <div className="absolute text-black top-9 flex justify-center gap-3 items-center left-[240px] z-20">
              {/* <div className="text-2xl font-bold shrink-0 bg-purple-600 text-white w-[60px] h-[60px] rounded-full shadow-lg flex justify-center items-center">
                21+
              </div> */}
              <div className="flex flex-col gap-1">
                <div className="font-semibold uppercase text-sm">
                  A proud product of Softex Solution.
                </div>
                {/* <div className="font-semibold"></div> */}
              </div>
            </div>

            {/* Main Center Image */}
            <div className="mt-[100px] ml-[150px] z-10">
              <div className="w-[400px] h-[400px] rounded-3xl overflow-hidden shadow-2xl">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url(https://html.vecurosoft.com/toddly/demo/assets/img/about/vs-about-h1-2.jpg)",
                  }}
                ></div>
              </div>
            </div>

            {/* Bottom Left Curved Section with Rocket */}
            <div className="absolute bottom-10 left-0">
              <div className="relative">
                {/* Curved Background */}
                <div className="bg-[#EFD7B3] w-[200px] h-[200px] rounded-full"></div>

                {/* Rocket */}
                <div className="absolute top-8 -left-10">
                  <motion.img
                    src="https://html.vecurosoft.com/toddly/demo/assets/img/about/vs-about-h1-ele-1.svg"
                    alt=""
                    style={{ x: xRocket, y: yRocket }}
                  />
                </div>

                {/* Ballon */}
                <div className="absolute top-12 left-20">
                  <motion.img
                    src="https://html.vecurosoft.com/toddly/demo/assets/img/about/vs-about-h1-ele-2.svg"
                    alt=""
                    style={{ x: xBalloon, y: yBalloon }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              {/* <p className="text-gray-500 text-sm font-medium tracking-wider uppercase mb-2">School Facilities</p>
              <h2 className="text-4xl font-bold text-gray-800 leading-tight">
                Learning <span className="text-orange-500">Opportunity</span>
                <br />
                For Kids
              </h2> */}

              {/* Animated Subheading */}
              <motion.h3
                className="text-gray-500 text-sm font-medium tracking-wider uppercase mb-2"
                variants={subVariants}
                initial="hidden"
                animate={subControls}
              >
                {"Why Tiny Giggle Feels Different".split(" ").map((ch, i) => (
                  <motion.span
                    key={i}
                    variants={charVariant}
                    aria-hidden="true"
                    className="inline-block mr-1"
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
                {"Not Just Tracking, it’s Understanding Your Baby"
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

            {/* Tabs */}
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeTab === tab
                      ? "bg-orange-500 text-white shadow-lg"
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
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-700 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Contact Button */}
            <div className="pt-4">
              <a href="/auth?tab=signup">
                <CustomButton
                  variant="primary"
                  size="lg"
                  className="px-8 py-4 text-base font-bold cursor-pointer"
                >
                  Start Journey
                </CustomButton>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
