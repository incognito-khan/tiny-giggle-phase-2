"use client";

import { Eye } from "lucide-react";
import { useRef, useEffect } from "react";
import { motion, useAnimation, useInView } from "framer-motion";

export default function Gallery() {
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
    <div ref={ref} className="bg-white py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h3
            className="text-gray-500 text-sm uppercase tracking-wider font-medium mb-4"
            variants={subVariants}
            initial="hidden"
            animate={subControls}
          >
            {"Experience Tiny Giggle".split(" ").map((ch, i) => (
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
            className="text-gray-800 text-4xl lg:text-5xl font-bold"
            variants={mainVariants}
            initial="hidden"
            animate={mainControls}
          >
            {"Designed for clarity, built for experience, preview it here."
              .split(" ")
              .map((ch, i) => (
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

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 grid-row-2 gap-4 max-w-6xl mx-auto">
          {/* Top Left - Child with beads */}
          <div className="col-span-1 md:col-span-2 row-span-1 border-[3px] border-gray-300 border-dashed group relative overflow-hidden rounded-2xl cursor-pointer">
            <div className="aspect-square">
              <img
                src="https://html.vecurosoft.com/toddly/demo/assets/img/gallery/gallery-h1-1-1.jpg"
                alt="Young girl drawing and coloring"
                width={300}
                height={300}
                className="w-full h-full object-cover transition-transform duration-300 scale-110 group-hover:scale-105"
              />
            </div>
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-[#CC8016]/80 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-gray-800 hover:bg-[#70167E] transition-all duration-300 rounded-full flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div className="text-white text-center ">
                <div className="text-sm uppercase tracking-wider mb-1 hover:text-[#70167E] transition-all duration-300">
                  Growth Tracker
                </div>
                <div className="text-xl font-bold hover:text-[#70167E] transition-all duration-300">
                  Track height, weight & milestones
                </div>
              </div>
            </div>
          </div>

          {/* Top Middle - Girl drawing */}
          <div className="col-span-1 md:col-span-2 border-[3px] border-gray-300 border-dashed row-span-1 group relative overflow-hidden rounded-2xl cursor-pointer">
            <div className="aspect-square">
              <img
                src="https://html.vecurosoft.com/toddly/demo/assets/img/gallery/gallery-h1-1-1.jpg"
                alt="Young girl drawing and coloring"
                width={300}
                height={300}
                className="w-full h-full object-cover transition-transform duration-300 scale-110 group-hover:scale-105"
              />
            </div>
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-[#CC8016]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div className="text-white text-center">
                <div className="text-sm uppercase tracking-wider mb-1">
                  Memories
                </div>
                <div className="text-xl font-bold">Upload photos & videos</div>
              </div>
            </div>
          </div>

          {/* Bottom - Large image of girl with painted hands */}
          <div className="col-span-1 md:col-span-2 border-[3px] border-gray-300 border-dashed row-span-2 group relative overflow-hidden rounded-2xl cursor-pointer">
            <div className="">
              <img
                src="https://html.vecurosoft.com/toddly/demo/assets/img/gallery/gallery-h1-1-3.jpg"
                alt="Smiling girl with colorful painted hands"
                className="w-full h-full object-cover transition-transform duration-300 scale-110 group-hover:scale-105"
              />
            </div>
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-[#CC8016]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div className="text-white text-center">
                <div className="text-sm uppercase tracking-wider mb-1">
                  Tiny Giggle Shopping
                </div>
                <div className="text-xl font-bold">Toys, clothes & gifts</div>
              </div>
            </div>
          </div>

          {/* Bottom Right - Additional space for balance */}
          <div className="col-span-1 md:col-span-4 row-span-1 border-[3px] border-gray-300 border-dashed group relative overflow-hidden rounded-2xl cursor-pointer">
            <div className="">
              <img
                src="https://html.vecurosoft.com/toddly/demo/assets/img/gallery/gallery-h1-1-4.jpg"
                alt="Children learning activities"
                className="w-full h-full object-cover scale-110 bg-center bg-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-[#CC8016]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div className="text-white text-center">
                <div className="text-sm uppercase tracking-wider mb-1">
                  Music & Fun
                </div>
                <div className="text-xl font-bold">
                  Free & paid music for your child
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
