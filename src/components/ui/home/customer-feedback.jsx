"use client";

import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import { Star, Quote } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { testimonialsData } from "@/components/data/home/testominaldata";

export default function CustomerFeedback() {
  const swiperRef = useRef(null);

  return (
    <div className="relative overflow-hidden">
      {/* Top Scalloped Border */}
      <div className="absolute top-0 left-0 right-0 h-6 overflow-hidden z-10">
        <svg
          className="w-full h-full"
          viewBox="0 0 1200 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0 24C20 12 40 12 60 24C80 12 100 12 120 24C140 12 160 12 180 24C200 12 220 12 240 24C260 12 280 12 300 24C320 12 340 12 360 24C380 12 400 12 420 24C440 12 460 12 480 24C500 12 520 12 540 24C560 12 580 12 600 24C620 12 640 12 660 24C680 12 700 12 720 24C740 12 760 12 780 24C800 12 820 12 840 24C860 12 880 12 900 24C920 12 940 12 960 24C980 12 1000 12 1020 24C1040 12 1060 12 1080 24C1100 12 1120 12 1140 24C1160 12 1180 12 1200 24V0H0V24Z"
            fill="white"
          />
        </svg>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
        {/* Left Side - Image */}
        <div className="relative overflow-hidden">
          <div
            className="w-full h-full bg-cover bg-center min-h-[600px]"
            style={{
              backgroundImage:
                // "url(https://html.vecurosoft.com/toddly/demo/assets/img/feedback/feedback-image-1-1.jpg)",
                "url(/home/reviews/main.jpeg)",
            }}
          ></div>
        </div>

        {/* Right Side - Testimonial Content */}
        <div className="bg-slate-800 text-white p-12 flex flex-col justify-center relative">
          {/* Decorative Cloud */}
          <div className="absolute top-8 right-8">
            <svg
              width="80"
              height="50"
              viewBox="0 0 80 50"
              className="text-white opacity-80"
            >
              <path
                d="M20 35C15 35 10 30 10 25C10 20 15 15 20 15C22 10 27 5 35 5C43 5 48 10 50 15C55 15 60 20 60 25C60 30 55 35 50 35H20Z"
                fill="currentColor"
              />
              <circle cx="65" cy="20" r="8" fill="currentColor" />
              <circle cx="70" cy="30" r="6" fill="currentColor" />
            </svg>
          </div>

          {/* Header */}
          <div className="mb-8">
            <p className="text-gray-400 text-sm font-medium tracking-wider uppercase mb-2">
              Parent & Family Reviews
            </p>
            {/* <h2 className="text-4xl font-bold leading-tight">
              Customer <span className="text-orange-500">Feedback</span> For
              <br />
              school
            </h2> */}
            <h2 className="text-4xl font-bold leading-tight">
              What <span className="text-orange-500">Families</span> Say About
              <br />
              Tiny Giggle
            </h2>
          </div>

          {/* Testimonial Swiper */}
          <div className="mb-8">
            <Swiper
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              modules={[Navigation, Pagination, Autoplay, EffectFade]}
              effect="fade"
              fadeEffect={{
                crossFade: true,
              }}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              loop={true}
              speed={800}
              spaceBetween={0}
              slidesPerView={1}
              pagination={{
                clickable: true,
                bulletClass: "swiper-pagination-bullet testimonial-bullet",
                bulletActiveClass:
                  "swiper-pagination-bullet-active testimonial-bullet-active",
                renderBullet: (index, className) =>
                  `<span class="${className}"></span>`,
              }}
              className="testimonial-swiper"
            >
              {testimonialsData.map((testimonial) => (
                <SwiperSlide key={testimonial.id}>
                  <div className="bg-slate-700 rounded-2xl p-8 relative">
                    {/* Quote Icon */}
                    <div className="absolute top-4 right-8">
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                        <Quote className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* Profile Section */}
                    <div className="flex items-center gap-4 mb-6">
                      {/* Profile Image */}
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-orange-500 flex-shrink-0">
                        <div
                          className="w-full h-full bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${testimonial.image})`,
                          }}
                        ></div>
                      </div>

                      {/* Name and Title */}
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {testimonial.name}
                        </h3>
                        <p className="text-orange-500 font-medium">
                          {testimonial.title}
                        </p>
                      </div>
                    </div>

                    {/* Star Rating */}
                    <div className="flex gap-1 mb-6">
                      {[...Array(testimonial.rating)].map((_, index) => (
                        <Star
                          key={index}
                          className="w-5 h-5 text-orange-500 fill-orange-500"
                        />
                      ))}
                    </div>

                    {/* Testimonial Text */}
                    <p className="text-gray-300 leading-relaxed text-lg">
                      "{testimonial.text}"
                    </p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>

      {/* Bottom Scalloped Border */}
      <div className="absolute bottom-0 left-0 right-0 h-6 overflow-hidden z-10">
        <svg
          className="w-full h-full"
          viewBox="0 0 1200 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0 0C20 12 40 12 60 0C80 12 100 12 120 0C140 12 160 12 180 0C200 12 220 12 240 0C260 12 280 12 300 0C320 12 340 12 360 0C380 12 400 12 420 0C440 12 460 12 480 0C500 12 520 12 540 0C560 12 580 12 600 0C620 12 640 12 660 0C680 12 700 12 720 0C740 12 760 12 780 0C800 12 820 12 840 0C860 12 880 12 900 0C920 12 940 12 960 0C980 12 1000 12 1020 0C1040 12 1060 12 1080 0C1100 12 1120 12 1140 0C1160 12 1180 12 1200 0V24H0V0Z"
            fill="white"
          />
        </svg>
      </div>
    </div>
  );
}
