"use client"
import '@/app/(app)/globals.css'
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import "swiper/css/effect-fade"
import { MdDoubleArrow } from "react-icons/md";
import { useRef } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';

export default function Banner({ name }) {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start center', 'end center']
  });

  // Map scroll progress to background-position-y from 0% to 50%
  const posY = useTransform(scrollYProgress, [0, 1], ['70%', '0%']);

  return (
    <motion.div ref={container} className="relative h-[500px] overflow-hidden">
      <div className="relative h-full w-full">
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(https://html.vecurosoft.com/toddly/demo/assets/img/hero/banner-1-1.jpg)`,
            backgroundPositionY: posY,
          }}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 flex flex-col items-center justify-center" >
            <h1 className='text-4xl font-bold mb-1 text-white'>{name}</h1>
            <p className='text-brand font-semibold flex gap-1 items-center text-md'>
              Home
              <MdDoubleArrow />
              <span className='text-white'>{name}</span>
            </p>
          </div>
        </motion.div>
      </div>

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
    </motion.div>
  )
}
