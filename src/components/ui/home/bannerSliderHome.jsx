"use client";

import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import { ChevronLeft, ChevronRight, Star, X, CheckCircle2 } from "lucide-react";
import CustomButton from "@/components/ui/button/button";
import "@/app/(app)/globals.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { bannerData } from "@/components/data/home/bannerdata";

export default function BannerSliderHome() {
  const swiperRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(null);

  const openModal = (slide) => {
    setActiveSlide(slide);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setActiveSlide(null);
    document.body.style.overflow = "unset";
  };

  return (
    <>
      <div className="relative h-[700px] overflow-hidden">
        <Swiper
          ref={swiperRef}
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop={true}
          speed={1000}
          className="h-full w-full"
        >
          {bannerData.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className="relative h-full w-full">
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${slide.backgroundImage})`,
                    animation: "slowZoom 5s ease-in-out infinite alternate",
                  }}
                >
                  <div className="absolute inset-0 bg-black/20"></div>
                </div>

                {/* Content */}
                <div className="relative h-full flex items-center justify-start py-8">
                  <div className="max-w-[710px] mx-14 w-full px-4">
                    <div className="relative flex rounded-[32px] shadow-2xl p-6 sm:p-10 lg:p-12 w-full animate-slide-in-left">
                      <div className="w-1/2 pr-4 z-10 text-left">
                        {/* Badge */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                            <Star className="w-4 h-4 text-white fill-white" />
                          </div>
                          <span className="text-secondary font-semibold text-sm">
                            {slide.tagline}
                          </span>
                        </div>

                        {/* Heading */}
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-snug">
                          {slide.title}
                        </h1>

                        {/* Subheading */}
                        <p className="text-base text-gray-600 mb-6">
                          {slide.subtitle}
                        </p>

                        {/* CTA Button */}
                        <CustomButton
                          variant="primary"
                          size="md"
                          onClick={() => openModal(slide)}
                          className="bg-brand hover:bg-secondary text-white rounded-full px-6 py-3 mb-4"
                        >
                          KNOW MORE
                        </CustomButton>
                      </div>

                      {/* Card Image */}
                      <div className="w-1/2 relative">
                        <img
                          src={slide.cardImage}
                          alt="Kids characters"
                          className="w-full flex justify-center items-center rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="flex-1"></div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation Buttons */}
        <button
          onClick={() => swiperRef.current?.swiper?.slidePrev()}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>

        <button
          onClick={() => swiperRef.current?.swiper?.slideNext()}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>

        {/* Curved Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-8 overflow-hidden z-10">
          <svg
            className="w-full h-full"
            viewBox="0 0 1200 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M0 0C100 25 200 25 300 15C400 5 500 20 600 15C700 10 800 25 900 20C1000 15 1100 25 1200 5V30H0V0Z"
              fill="white"
            />
          </svg>
        </div>
      </div>

      {/* Modal */}
      {activeSlide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-in-left">
            {/* Modal Header Image */}
            <div className="relative h-52 rounded-t-3xl overflow-hidden">
              <img
                src={activeSlide.backgroundImage}
                alt={activeSlide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30" />

              {/* Tagline over image */}
              <div className="absolute bottom-4 left-6 flex items-center gap-2">
                <div className="w-7 h-7 bg-secondary rounded-full flex items-center justify-center">
                  <Star className="w-3.5 h-3.5 text-white fill-white" />
                </div>
                <span className="text-white font-semibold text-sm tracking-wide">
                  {activeSlide.tagline}
                </span>
              </div>

              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110"
              >
                <X className="w-4 h-4 text-gray-700" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8">
              {/* Heading */}
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                {activeSlide.detail.heading}
              </h2>

              {/* Description */}
              <p className="text-gray-600 text-base leading-relaxed mb-6">
                {activeSlide.detail.description}
              </p>

              {/* Highlights */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
                  What's included
                </h3>
                <ul className="flex flex-col gap-3">
                  {activeSlide.detail.highlights.map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
                      <span className="text-gray-700 text-sm leading-relaxed">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Closing Note */}
              <div className="bg-pink-50 border border-pink-100 rounded-2xl p-4 mb-6">
                <p className="text-sm text-pink-700 leading-relaxed italic">
                  {activeSlide.detail.closingNote}
                </p>
              </div>

              {/* Footer Buttons */}
              <div className="flex gap-3">
                <a href="/auth?tab=signup" className="flex-1">
                  <CustomButton
                    variant="primary"
                    size="md"
                    className="w-full bg-brand hover:bg-secondary text-white rounded-full py-3 cursor-pointer"
                  >
                    Get Started
                  </CustomButton>
                </a>
                <button
                  onClick={closeModal}
                  className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-full py-3 text-sm font-medium transition-colors duration-200 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
