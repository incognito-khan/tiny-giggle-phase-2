"use client";

import { Phone, Play } from "lucide-react";
import {
  useMotionValue,
  useSpring,
  useTransform,
  motion,
  useAnimation,
  useInView,
} from "framer-motion";
import { useEffect, useRef } from "react";

export default function PreschoolHero() {
  const ref = useRef(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const springX = useSpring(rawX, { stiffness: 100, damping: 20 });
  const springY = useSpring(rawY, { stiffness: 100, damping: 20 });

  const xRocket = useTransform(springX, (v) => v * 0.1);
  const yRocket = useTransform(springY, (v) => v * 0.1);
  const xCloud = useTransform(springX, (v) => v * 0.1);
  const yCloud = useTransform(springY, (v) => v * 0.1);

  const subControls = useAnimation();
  const mainControls = useAnimation();
  const inView = useInView(ref, { once: false, amount: 0.4 });

  const subText = "Session Times";
  const headingText = "Your kids Are 100% Safe at Our Care.";

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
      onMouseMove={(e) => {
        console.log(e.currentTarget.getBoundingClientRect());
        const rect = e.currentTarget.getBoundingClientRect();
        rawX.set(e.clientX - (rect.left + rect.width / 2));
        rawY.set(e.clientY - (rect.top + rect.height / 2));
      }}
      className="relative py-28 overflow-hidden bg-[#70197A] z-[3]"
    >
      {/* bg img */}
      <div
        className="absolute w-full h-full -z-[3] inset-0 opacity-5 top-0 left-0 right-0 bottom-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(https://html.vecurosoft.com/toddly/demo/assets/img/video/video-bg-image.jpg)`,
        }}
      ></div>
      {/* Decorative Airplane */}
      <div className="absolute top-16 left-16">
        <motion.img
          src="https://html.vecurosoft.com/toddly/demo/assets/img/video/video-h3-ele1.png"
          style={{ x: xRocket, y: yRocket }}
          alt=""
        />
      </div>

      {/* Decorative Cloud */}
      <div className="absolute top-20 right-20">
        <motion.img
          src="https://html.vecurosoft.com/toddly/demo/assets/img/video/video-h3-ele2.png"
          alt=""
          style={{ x: xCloud, y: yCloud }}
        />
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* Play Button */}
        <div className="mb-8">
          <div className="w-20 h-20 b bg-brand rounded-full flex items-center justify-center mx-auto shadow-lg">
            <Play className="w-8 h-8 text-white ml-1" fill="white" />
          </div>
        </div>

        {/* Small Text */}
        <motion.h3
          className="text-white/90 text-sm font-medium tracking-wide uppercase mb-4 letterspacing-widest"
          variants={subVariants}
          initial="hidden"
          animate={subControls}
        >
          {"Experience Tiny Giggle".split("").map((ch, i) => (
            <motion.span key={i} variants={charVariant} aria-hidden="true">
              {ch}
            </motion.span>
          ))}
        </motion.h3>

        {/* Main Heading */}
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight"
          variants={mainVariants}
          initial="hidden"
          animate={mainControls}
        >
          {"Watch how care, growth, and memories come together seamlessly"
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

        {/* Decorative Line */}
        <div className="w-full h-[2px] bg-white/30 mx-auto mb-12"></div>

        {/* Call to Action Section */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          {/* Admission Button */}
          <button className=" bg-brand text-white font-bold py-4 px-8 rounded-full border-2 border-dashed border-orange-300 hover:scale-105 transition-transform duration-300 shadow-lg uppercase tracking-wider">
            Watch Now
          </button>

          {/* Call Support */}
          <div className="flex items-center gap-4">
            {/* Phone Icon Circle */}
            <div className="w-14 h-14 bg-brand rounded-full flex items-center justify-center shadow-lg">
              <Phone className="w-6 h-6 text-white" />
            </div>

            {/* Contact Info */}
            <div className="text-left">
              <p className="text-white/90 text-sm font-medium">Call Support</p>
              <p className="text-white text-xl font-bold">+1 316-712-4886</p>
            </div>
          </div>
        </div>
      </div>

      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent pointer-events-none"></div>
    </div>
  );
}
