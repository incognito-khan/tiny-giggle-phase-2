"use client"

import { useRef } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import CustomButton from "@/components/ui/button/button"
import '@/app/(app)/globals.css'
// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import "swiper/css/effect-fade"
import { bannerData } from "@/components/data/home/bannerdata"



export default function BannerSliderHome() {
    const swiperRef = useRef(null)

    return (
        <div className="relative h-[700px] overflow-hidden">
            <Swiper
                ref={swiperRef}
                modules={[Navigation, Pagination, Autoplay, EffectFade]}
                effect="fade"
                fadeEffect={{
                    crossFade: true,
                }}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                }}
                loop={true}
                speed={1000}
                className="h-full w-full"
            >
                {bannerData.map((slide) => (
                    <SwiperSlide key={slide.id}>
                        <div className="relative h-full w-full">
                            {/* Background Image with Zoom Animation */}
                            <div
                                className="absolute inset-0 bg-cover bg-center animate-slow-zoom"
                                style={{
                                    backgroundImage: `url(${slide.backgroundImage})`,
                                    animation: "slowZoom 5s ease-in-out infinite alternate",
                                }}
                            >
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/20"></div>
                            </div>

                            {/* Content */}
                            <div className="relative h-full flex items-center justify-start py-8">
                                <div className="max-w-[710px] mx-14 w-full px-4">
                                    <div className="relative flex  rounded-[32px] shadow-2xl p-6 sm:p-10 lg:p-12 w-full animate-slide-in-left"
                                        style={{
                                            backgroundImage:
                                                "url('https://html.vecurosoft.com/toddly/demo/assets/img/hero/hero-shape-1.svg')",
                                            backgroundSize: "cover",
                                            backgroundPosition: "center",
                                        }}
                                        effect="fade"
                                        fadeEffect={{
                                            crossFade: true,
                                        }}
                                    >
                                        {/* Fun Happens Badge */}
                                        <div className="w-1/2 pr-4 z-10 text-left">
                                            {/* Badge */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                                                    <Star className="w-4 h-4 text-white fill-white" />
                                                </div>
                                                <span className="text-secondary font-semibold text-sm">{slide.tagline}</span>
                                            </div>

                                            {/* Heading */}
                                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-snug w-full leading-[]">
                                                {slide.title}
                                            </h1>

                                            {/* Subheading */}
                                            <p className="text-base text-gray-600 mb-6">{slide.subtitle}</p>

                                            {/* CTA Button */}
                                            <CustomButton
                                                variant="primary"
                                                size="md"
                                                className="bg-brand hover:bg-secondary text-white rounded-full px-6 py-3 mb-4"
                                            >
                                                KNOW MORE
                                            </CustomButton>
                                        </div>

                                        {/* Illustration */}
                                        <div className="w-1/2 relative">
                                            <img
                                                src="https://html.vecurosoft.com/toddly/demo/assets/img/hero/hero-character-1.png"
                                                alt="Kids characters"
                                                className="absolute bottom-32 right-0 h-[65%] max-h-[250px] pointer-events-none"
                                            />
                                        </div>

                                    </div>

                                    {/* Spacer */}
                                    <div className="flex-1"></div>
                                </div>
                            </div>
                        </div>


                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Custom Navigation Buttons */}
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

            {/* Curved Bottom Border */}
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
        </div >
    )
}
