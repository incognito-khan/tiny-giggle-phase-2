"use client";

import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { motion, useAnimation, useInView } from "framer-motion";
import { Navigation, Autoplay, EffectFade, Pagination } from "swiper/modules";
import {
  ChevronLeft,
  ChevronRight,
  Backpack,
  Home,
  ArrowUpRight,
} from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";
import "@/app/(app)/globals.css";
import { educationData } from "@/components/data/home/educationcardsdata";

export default function EducationCards() {
  const swiperRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [animateIndex, setAnimateIndex] = useState(null);

  // const handleSlideChange = (swiper) => {
  //   const newIndex = swiper.realIndex
  //   setActiveIndex(newIndex)
  //   setAnimateIndex(newIndex)
  // }

  const handleSlideChange = (swiper) => {
    // 1) remove the class from every slide
    swiper.slides.forEach((slideEl) => {
      const target = slideEl.querySelector(".incoming-card-target");
      if (target) target.classList.remove("animate-incoming-card");
    });

    // 2) add it to the new active slide
    const activeSlideEl = swiper.slides[swiper.activeIndex];
    const incoming = activeSlideEl?.querySelector(".incoming-card-target");
    if (incoming) {
      // force reflow so the animation can replay if needed
      incoming.getBoundingClientRect();
      incoming.classList.add("animate-incoming-card");
    }
  };

  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, amount: 0.6 });

  const charVariant = {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
    },
  };

  const containerChars = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.04 } },
  };

  useEffect(() => {
    if (inView) controls.start("visible");
    else controls.start("hidden");
  }, [inView, controls]);

  useEffect(() => {
    if (animateIndex !== null) {
      const id = setTimeout(() => setAnimateIndex(null), 700); // 0.7s matches your animation duration
      return () => clearTimeout(id);
    }
  }, [animateIndex]);

  return (
    <div
      className="py-16 relative overflow-hidden"
      style={{
        backgroundImage: `url(https://html.vecurosoft.com/toddly/demo/assets/img/service/service-bg.png)`,
      }}
    >
      {/* Decorative Left Image */}
      <div className="absolute left-0 bottom-10 z-0">
        <img
          src="https://html.vecurosoft.com/toddly/demo/assets/img/elements/service-ele-1.svg"
          alt="Left Decoration"
          className="w-[300px] md:w-[190px]"
        />
      </div>

      {/* Decorative Right Image */}
      <div className="absolute right-0 top-10 z-0">
        <img
          src="https://html.vecurosoft.com/toddly/demo/assets/img/elements/service-ele-2.svg"
          alt="Right Decoration"
          className="w-[200px] md:w-[190px]"
        />
      </div>
      {/* Prev/Next Buttons */}
      <button
        onClick={() => swiperRef.current?.slidePrev()}
        className="absolute left-4 top-1/2 z-20 ..."
      >
        <ChevronLeft />
      </button>
      <button
        onClick={() => swiperRef.current?.slideNext()}
        className="absolute right-4 top-1/2 z-20 ..."
      >
        <ChevronRight />
      </button>

      <div className="max-w-7xl mx-auto px-4">
        <div ref={ref}>
          <motion.h2
            className="text-5xl font-bold text-black text-center mb-16"
            variants={containerChars}
            initial="hidden"
            animate={controls}
          >
            {/* {"Tiny Giggle Features".split("").map((ch, i) =>
                            <motion.span key={i} variants={charVariant} aria-hidden="true" >
                                {ch}
                            </motion.span>
                        )} */}
            <motion.span variants={charVariant} aria-hidden="true">
              Tiny Giggle Features
            </motion.span>
          </motion.h2>
        </div>

        <Swiper
          onSwiper={(sw) => (swiperRef.current = sw)}
          modules={[Navigation, Autoplay, Pagination]}
          onSlideChange={(swiper) => {
            setActiveIndex(swiper.realIndex);
          }}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          loop
          speed={1200}
          spaceBetween={30}
          slidesPerView={1}
          centeredSlides
          breakpoints={{
            640: { slidesPerView: 1, spaceBetween: 20 },
            768: { slidesPerView: 2, spaceBetween: 30 },
            1024: { slidesPerView: 3, spaceBetween: 30 },
          }}
          className="pb-8"
        >
          {educationData.map((item, idx) => (
            <SwiperSlide key={item.id}>
              {({ isActive }) => {
                const isAnimating = isActive && animateIndex === idx;
                return (
                  <div className="group cursor-pointer h-full">
                    <div
                      className={`
                                                relative mx-auto bg-transparent rounded-3xl overflow-hidden shadow-lg transition-all duration-700 transform `}
                    >
                      {/*  ${isActive ? "scale-105 shadow-2xl" : "hover:scale-105 hover:shadow-2xl"}
                                                ${isAnimating ? "animate-incoming-card" : ""} */}

                      {/* Image */}
                      <div className="relative h-[300px] overflow-hidden rounded-3xl">
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 group-hover:bg-amber-300"
                          style={{ backgroundImage: `url(${item.image})` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="relative bg-white w-[90%] z-20 -mt-20 mx-auto rounded-3xl">
                        <div className="p-6 mx-auto z-10">
                          <div className="flex items-center justify-between mb-4">
                            <div
                              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500
                                                                ${
                                                                  isActive
                                                                    ? "bg-orange-500 shadow-lg scale-110"
                                                                    : "bg-gray-100 group-hover:bg-orange-500 group-hover:scale-110"
                                                                }`}
                            >
                              <item.icon
                                className={`w-7 h-7 transition-colors duration-500
                                                                    ${
                                                                      isActive
                                                                        ? "text-white"
                                                                        : "text-gray-600 group-hover:text-white"
                                                                    }`}
                              />
                            </div>
                            {/* <div
                                                            className={`w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center transition-all duration-500
                                ${isActive
                                                                    ? "border-orange-400 bg-orange-50 rotate-45"
                                                                    : "border-gray-300 group-hover:border-orange-400 group-hover:bg-orange-50 group-hover:rotate-45"}`}
                                                        >
                                                            <ArrowUpRight
                                                                className={`w-5 h-5 transition-all duration-500
                                    ${isActive
                                                                        ? "text-orange-500"
                                                                        : "text-gray-400 group-hover:text-orange-500"}`}
                                                            />
                                                        </div> */}
                          </div>
                          <h3
                            className={`text-xl font-bold transition-colors duration-500
                                ${
                                  isActive
                                    ? "text-gray-800"
                                    : "text-gray-700 group-hover:text-orange-600"
                                }`}
                          >
                            {item.title}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }}
            </SwiperSlide>
          ))}
        </Swiper>
        {/* Pagination Dots */}
        <div className="flex justify-center mt-8 gap-2">
          {educationData.map((_, idx) => (
            <button
              key={idx}
              onClick={() => swiperRef.current?.slideToLoop(idx)}
              className={`w-3 h-3 rounded-full transition-all duration-300
                ${activeIndex === idx ? "bg-orange-500 scale-125" : "bg-gray-300 hover:bg-orange-300"}`}
            ></button>
          ))}
        </div>
      </div>
    </div>
  );
}
