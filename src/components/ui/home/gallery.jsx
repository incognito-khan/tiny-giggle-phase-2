"use client";

import {
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useRef, useEffect, useState, useCallback } from "react";
import {
  motion,
  useAnimation,
  useInView,
  AnimatePresence,
} from "framer-motion";

const galleryItems = [
  {
    src: "/home/gallery/mockup-1.png",
    alt: "Young girl drawing and coloring",
    label: "Growth Tracker",
    description: "Track height, weight & milestones",
    colSpan: "col-span-1 md:col-span-2 row-span-1",
    aspectClass: "aspect-square",
  },
  {
    src: "/home/gallery/mockup-3.png",
    alt: "Young girl drawing and coloring",
    label: "Memories",
    description: "Upload photos & videos",
    colSpan: "col-span-1 md:col-span-2 row-span-1",
    aspectClass: "aspect-square",
  },
  {
    src: "/home/gallery/mockup-4.png",
    alt: "Smiling girl with colorful painted hands",
    label: "Tiny Giggle Shopping",
    description: "Toys, clothes & gifts",
    colSpan: "col-span-1 md:col-span-2 row-span-2",
    aspectClass: "h-full",
  },
  {
    src: "/home/gallery/mockup-2.png",
    alt: "Children learning activities",
    label: "Music & Fun",
    description: "Free & paid music for your child",
    colSpan: "col-span-1 md:col-span-4 row-span-1",
    aspectClass: "",
  },
];

function ImageModal({ items, initialIndex, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);
  const [dragStart, setDragStart] = useState(null);

  const current = items[currentIndex];

  const goNext = useCallback(() => {
    setZoomed(false);
    setCurrentIndex((i) => (i + 1) % items.length);
  }, [items.length]);

  const goPrev = useCallback(() => {
    setZoomed(false);
    setCurrentIndex((i) => (i - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, goNext, goPrev]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Modal Container */}
        <motion.div
          className="relative z-10 flex flex-col items-center w-full max-w-5xl px-4"
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between w-full mb-4">
            <div>
              <p className="text-white/50 text-xs uppercase tracking-widest mb-0.5">
                {current.label}
              </p>
              <h3 className="text-white text-lg font-semibold leading-tight">
                {current.description}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/40 text-sm font-mono">
                {currentIndex + 1} / {items.length}
              </span>
              <button
                onClick={() => setZoomed((z) => !z)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white"
                title={zoomed ? "Zoom out" : "Zoom in"}
              >
                {zoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
              </button>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Image Frame */}
          <div
            className="relative w-full rounded-2xl overflow-hidden bg-white/5 border border-white/10"
            style={{ maxHeight: "70vh" }}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={currentIndex}
                src={current.src}
                alt={current.alt}
                className={`w-full object-contain transition-transform duration-300 ${zoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"}`}
                style={{ maxHeight: "70vh" }}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                onClick={() => setZoomed((z) => !z)}
                draggable={false}
              />
            </AnimatePresence>

            {/* Prev/Next Buttons */}
            <button
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Thumbnail Strip */}
          <div className="flex gap-3 mt-4">
            {items.map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  setZoomed(false);
                  setCurrentIndex(i);
                }}
                className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                  i === currentIndex
                    ? "border-[#CC8016] scale-110 shadow-lg shadow-[#CC8016]/30"
                    : "border-white/20 opacity-50 hover:opacity-80"
                }`}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* Keyboard hint */}
          <p className="text-white/25 text-xs mt-4 tracking-wider">
            ← → to navigate &nbsp;·&nbsp; ESC to close &nbsp;·&nbsp; click image
            to zoom
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Gallery() {
  const ref = useRef(null);
  const subControls = useAnimation();
  const mainControls = useAnimation();
  const inView = useInView(ref, { once: false, amount: 0.4 });
  const [modalIndex, setModalIndex] = useState(null);

  const charVariant = {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },
  };

  const subVariants = {
    hidden: {},
    visible: { transition: { when: "beforeChildren", staggerChildren: 0.03 } },
  };

  const mainVariants = {
    hidden: {},
    visible: { transition: { when: "beforeChildren", staggerChildren: 0.03 } },
  };

  useEffect(() => {
    if (inView) {
      subControls.start("visible").then(() => {
        setTimeout(() => mainControls.start("visible"), 50);
      });
    } else {
      subControls.start("hidden");
      mainControls.start("hidden");
    }
  }, [inView, mainControls, subControls]);

  return (
    <>
      {/* Modal */}
      {modalIndex !== null && (
        <ImageModal
          items={galleryItems}
          initialIndex={modalIndex}
          onClose={() => setModalIndex(null)}
        />
      )}

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
            {galleryItems.map((item, index) => (
              <div
                key={index}
                className={`${item.colSpan} border-[3px] border-gray-300 border-dashed group relative overflow-hidden rounded-2xl cursor-pointer`}
                onClick={() => setModalIndex(index)}
              >
                <div className={item.aspectClass || ""}>
                  <img
                    src={item.src}
                    alt={item.alt}
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
                  <div className="text-white text-center">
                    <div className="text-sm uppercase tracking-wider mb-1">
                      {item.label}
                    </div>
                    <div className="text-xl font-bold">{item.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
