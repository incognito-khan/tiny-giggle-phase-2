"use client";

import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ToyBrick, ChevronLeft, ChevronRight } from "lucide-react";
import { useMotionValue, useSpring, useTransform, motion } from "framer-motion";

import "swiper/css";
import "swiper/css/navigation";
import { gradeData } from "@/components/data/home/gradedata";

export default function GradePrograms() {
  const swiperRef = useRef(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 100, damping: 20 });
  const springY = useSpring(rawY, { stiffness: 100, damping: 20 });

  const configs = {
    airplane: 0.1,
    green: 0.08,
    children: 0.07,
  };

  const xPlane = useTransform(springX, (v) => v * configs.airplane);
  const yPlane = useTransform(springY, (v) => v * configs.airplane);
  const xGreen = useTransform(springX, (v) => v * configs.green);
  const yGreen = useTransform(springY, (v) => v * configs.green);
  const xKids = useTransform(springX, (v) => v * configs.children);
  const yKids = useTransform(springY, (v) => v * configs.children);

  return (
    <div
      className="relative overflow-hidden"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        rawX.set(e.clientX - (rect.left + rect.width / 2));
        rawY.set(e.clientY - (rect.top + rect.height / 2));
      }}
    >
      {/* Main Orange Section */}
      <div
        className=" pt-[190px] pb-[170px] relative bg-cover bg-center h-[550px] w-full"
        style={{
          backgroundImage:
            "url(https://html.vecurosoft.com/toddly/demo/assets/img/bg/program-bg.png)",
        }}
      >
        {/* Curved Bottom Border */}
        <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
          <svg
            className="w-full h-full"
            viewBox="0 0 1200 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M0 0C200 40 400 40 600 20C800 0 1000 30 1200 10V60H0V0Z"
              fill="#fef3e2"
            />
          </svg>
        </div>

        {/* Decorative Airplane- moveable */}
        <div className="absolute top-8 left-16">
          <motion.img
            src="https://html.vecurosoft.com/toddly/demo/assets/img/pro/pro-ele-1.png"
            alt=""
            style={{ x: xPlane, y: yPlane }}
          />
        </div>

        {/* Decorative Green Element- moveable */}
        <div className="absolute top-8 right-16">
          <motion.img
            src="https://html.vecurosoft.com/toddly/demo/assets/img/pro/pro-ele-2.png"
            alt=""
            style={{ x: xGreen, y: yGreen }}
          />
        </div>
        {/* Children- moveable */}
        <div className="absolute right-0 -bottom-20 z-50">
          <motion.img
            src="https://html.vecurosoft.com/toddly/demo/assets/img/pro/pro-ele-3.png"
            alt=""
            style={{ x: xKids, y: yKids }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white">
              <p className="text-sm font-medium tracking-wider uppercase mb-2 opacity-90">
                Our Ecosystem
              </p>
              <h2 className="text-5xl font-bold mb-4 leading-tight">
                What We Offer
              </h2>
              <p className="text-lg mb-8 opacity-90">
                Want to join our ecosystem as a doctor, babysitter, musician, or
                more?
              </p>

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => swiperRef.current?.slidePrev()}
                  className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={() => swiperRef.current?.slideNext()}
                  className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Right Side - Grade Cards Carousel */}
            <div className="relative">
              <Swiper
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                }}
                modules={[Navigation]}
                loop={true}
                speed={400}
                spaceBetween={30}
                slidesPerView={1}
                centeredSlides={true}
                breakpoints={{
                  640: {
                    slidesPerView: 1,
                    spaceBetween: 20,
                  },
                  768: {
                    slidesPerView: 2,
                    spaceBetween: 30,
                  },
                  1024: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                  },
                }}
                className="grade-swiper"
              >
                {gradeData.map((item) => (
                  <SwiperSlide key={item.id}>
                    <div className="bg-white rounded-full px-6 py-5 border-4 border-dashed border-orange-300 text-center shadow-lg">
                      {/* Grade Badge */}
                      <div className="mb-4">
                        <div
                          className={`inline-block ${item.badgeColor} text-white px-4 py-1 rounded-full text-xs font-bold`}
                        >
                          {item.badgeText}
                        </div>
                      </div>

                      {/* Grade Title */}
                      <h3 className="text-xs font-bold text-gray-800 mb-2">
                        {item.grade}
                      </h3>

                      {/* Age Range */}
                      {/* <p className="text-gray-600 font-medium">{item.age}</p> */}
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Light Section */}
      <div className="bg-orange-50 py-16 relative">
        {/* Child with Blocks Image */}
        <div className="absolute bottom-0 right-16">
          <div className="w-48 h-32 relative">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: "url(/placeholder.svg?height=128&width=192)",
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
