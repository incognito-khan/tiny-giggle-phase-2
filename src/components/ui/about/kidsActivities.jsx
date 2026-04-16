"use client";

import { Play, TreePine, Backpack, Headphones, Coffee } from "lucide-react";
import {
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
  motion,
  useAnimation,
  useInView,
} from "framer-motion";
import { useEffect, useRef } from "react";
import { AnimatedCounter } from "./counter";
import { activitiesData } from "@/components/data/about/kidsactivitydata";

export default function KidsActivities() {
  const ref = useRef(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const springX = useSpring(rawX, { stiffness: 100, damping: 20 });
  const springY = useSpring(rawY, { stiffness: 100, damping: 20 });

  const xTurtle = useTransform(springX, (v) => v * 0.1);
  const yTurtle = useTransform(springY, (v) => v * 0.1);
  const xCharacter = useTransform(springX, (v) => v * 0.1);
  const yCharacter = useTransform(springY, (v) => v * 0.1);

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
      className="py-16 bg-gray-50 relative overflow-hidden bg-cover bg-center"
      onMouseMove={(e) => {
        console.log(e.currentTarget.getBoundingClientRect());
        const rect = e.currentTarget.getBoundingClientRect();
        rawX.set(e.clientX - (rect.left + rect.width / 2));
        rawY.set(e.clientY - (rect.top + rect.height / 2));
      }}
      style={{
        backgroundImage: `url(https://html.vecurosoft.com/toddly/demo/assets/img/rooms/room-bg.png)`,
      }}
    >
      {/* Dotted Border Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-4">
        <div className="w-full h-1 border-b-2 border-dotted border-gray-300"></div>
      </div>

      {/* Character Decoration */}
      <div className="absolute -bottom-8 right-8 z-10">
        <motion.img
          src="https://html.vecurosoft.com/toddly/demo/assets/img/rooms/room-ele2.png"
          className="w-[86%]"
          alt=""
          style={{ x: xCharacter, y: yCharacter }}
        />
      </div>
      {/* Turtle Decoration */}
      <div className="absolute top-10 left-8 z-10">
        <motion.img
          src="https://html.vecurosoft.com/toddly/demo/assets/img/rooms/room-ele1.png"
          className="w-[86%]"
          alt=""
          style={{ x: xTurtle, y: yTurtle }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Top Section */}
        <div className="flex gap-12 items-center mb-16">
          {/* Left Content */}
          <div className="space-y-6">
            <motion.h3
              className="text-gray-500 text-sm font-medium tracking-wider uppercase"
              variants={subVariants}
              initial="hidden"
              animate={subControls}
            >
              {"What Makes Us Different".split("").map((ch, i) => (
                <motion.span key={i} variants={charVariant} aria-hidden="true">
                  {ch}
                </motion.span>
              ))}
            </motion.h3>

            {/* Main Heading */}
            <motion.h2
              className="text-4xl font-bold text-gray-800 leading-tight"
              variants={mainVariants}
              initial="hidden"
              animate={mainControls}
            >
              {"Where parenting is simplified and every moment matters"
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

            {/* Description */}
            <p className="text-gray-600 leading-relaxed">
              Tiny Giggle brings together all the tools, resources, and
              experiences a parent needs, tracking growth, preserving memories,
              managing health, and exploring curated essentials. Every feature
              is designed to make parenting easier, meaningful, and joyful.
            </p>
          </div>

          {/* Right Content */}
          <div className="relative w-full">
            <div
              className="flex items-stretch gap-1  h-[230px] rounded-2xl"
              style={{
                backgroundImage: `url(https://html.vecurosoft.com/toddly/demo/assets/img/rooms/room-video-bg.jpg)`,
              }}
            >
              {/* Purple Experience Card */}
              {/* <motion.div className="bg-secondary rounded-2xl p-8 text-white flex-shrink-0 w-[210px] shadow-[0_0_0px_7px_#ffffff] border-2 border-dashed border-gray-400">
                <div className="text-center" ref={ref}>
                  <AnimatedCounter from={1} to={20} duration={1} />+
                  <p className="text-sm font-semibold my-6">
                    Years Of Experience
                  </p>
                  <div className="w-8 h-8 bg-white transform rotate-45 mx-auto"></div>
                </div>
              </motion.div> */}

              {/* Image with Play Button */}
              <div className="flex-1 relative rounded-2xl overflow-hidden">
                <div className="w-full h-[200px] bg-cover bg-center">
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform duration-300">
                      <Play
                        className="w-6 h-6 text-gray-700 ml-1"
                        fill="currentColor"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activities Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {activitiesData.map((activity) => (
            <div
              key={activity.id}
              className={`rounded-2xl p-8 py-12 text-white text-center cursor-pointer transition-all duration-300 hover:shadow-2xl ${activity.bgColor} border-2 border-dashed border-gray-300`}
            >
              {/* Icon */}
              <div className="mb-6">
                <activity.icon
                  className="w-12 h-12 text-white mx-auto"
                  strokeWidth={1.5}
                />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-4">
                {activity.title}
              </h3>

              {/* Description */}
              <p className="text-white/90 text-sm leading-relaxed">
                {activity.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
