"use client";

import {
  Phone,
  Facebook,
  Linkedin,
  Mail,
  Eye,
  Plus,
  Instagram,
  Youtube,
} from "lucide-react";

export default function Footer() {
  // const instagramPhotos = [
  //   "	https://html.vecurosoft.com/toddly/demo/assets/img/feedback/feedback-image-1-1.jpg",
  //   "	https://html.vecurosoft.com/toddly/demo/assets/img/gallery/gallery-h1-1-1.jpg",
  //   "	https://html.vecurosoft.com/toddly/demo/assets/img/gallery/gallery-h1-1-1.jpg",
  //   "	https://html.vecurosoft.com/toddly/demo/assets/img/gallery/gallery-h1-1-3.jpg",
  //   "	https://html.vecurosoft.com/toddly/demo/assets/img/feedback/feedback-image-1-1.jpg",
  //   "	https://html.vecurosoft.com/toddly/demo/assets/img/gallery/gallery-h1-1-4.jpg",
  // ];
  const instagramPhotos = [
    "/footer/1.png",
    "/footer/2.png",
    "/footer/3.png",
    "/footer/4.png",
    "/footer/5.png",
    "/footer/6.png",
  ];

  const exploreLinks = [
    // "Blog",
    // "About Us",
    // "Contact Us",
    // "Help center",
    // "Become A Guide",
    {
      name: "Blog",
      link: "/blogs",
    },
    {
      name: "Contact Us",
      link: "/contact",
    },
    {
      name: "About Us",
      link: "/about",
    },
    {
      name: "Download",
      link: "/download",
    },
    {
      name: "Privacy Policy",
      link: "/privacy-policy",
    },
    {
      name: "For Professionals",
      link: "/for-professionals",
    },
  ];

  const membershipLinks = [
    "Join or Renew",
    "Membership",
    "Options",
    "Families",
  ];

  return (
    <footer className="relative">
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

      {/* Main Footer */}
      <div className="bg-slate-800 text-white pt-16 pb-8 relative">
        {/* School Bus Decoration */}
        <div className="absolute -bottom-1 right-8">
          <img
            src="https://html.vecurosoft.com/toddly/demo/assets/img/footer/footer-element-3.png"
            alt=""
          />
        </div>

        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Left Section - Logo and Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Logo */}
              <div className="flex items-center gap-2">
                {/* <div className="w-12 h-12 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-purple-500 to-blue-500 rounded-lg"></div>
                  <div className="absolute inset-1 bg-white rounded-md flex items-center justify-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 via-purple-500 to-blue-500 rounded-sm flex items-center justify-center">
                      <div className="text-white text-xs font-bold">B</div>
                    </div>
                  </div>
                </div> */}
                <img
                  src="/logo.png"
                  alt=""
                  className="h-20 bg-cover bg-center object-center"
                />
                <span className="text-2xl font-bold">
                  {/* <span className="text-white">To</span>
                  <span className="text-brabg-brand">dd</span>
                  <span className="text-white">ly</span> */}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-300 leading-relaxed">
                Supporting your child’s journey from the first moment to every
                milestone that follows.
              </p>

              {/* Call Support */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-brand rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Call Support</p>
                    <p className="text-white font-bold text-lg">
                      +1 316-712-4886
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <p className="text-gray-400 mb-3">Follow Us :</p>
                <div className="flex gap-3">
                  <a
                    href="https://www.facebook.com/share/1DvrnHfAYc"
                    target="_blank"
                  >
                    <div className="w-10 h-10 bg-gray-700 hover:bg-brand rounded-full flex items-center justify-center cursor-pointer transition-colors duration-300">
                      <Facebook className="w-5 h-5 text-white" />
                    </div>
                  </a>
                  <a
                    href="https://www.instagram.com/tinyg_iggle?igsh=MXRyZzJidmQxNjVkMA=="
                    target="_blank"
                  >
                    <div className="w-10 h-10 bg-gray-700 hover:bg-brand rounded-full flex items-center justify-center cursor-pointer transition-colors duration-300">
                      <Instagram className="w-5 h-5 text-white" />
                    </div>
                  </a>
                  <div className="w-10 h-10 bg-gray-700 hover:bg-brand rounded-full flex items-center justify-center cursor-pointer transition-colors duration-300">
                    <Youtube className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Decorative Grass */}
              <div className="relative top-[33px]">
                <img
                  src="https://html.vecurosoft.com/toddly/demo/assets/img/footer/footer-element-1.png"
                  alt=""
                />
              </div>
            </div>

            {/* Explore Links */}
            <div className="space-y-4 relative">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Explore</h3>
                <div className="w-16 h-[2px] bg-brand mb-6 absolute z-10"></div>
                <div className="w-[90%] h-[2px] bg-gray-500 mb-6 absolute"></div>
              </div>
              <ul className="space-y-3 mt-10">
                {exploreLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.link}
                      className="text-gray-300 hover:text-brabg-brand transition-colors duration-300 flex items-center gap-2"
                    >
                      <span className="text-brabg-brand">»</span>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Membership Links */}
            {/* <div className="space-y-4">
              <div className="opacity-0">
                <h3 className="text-xl font-bold text-white mb-2">Hidden</h3>
                <div className="w-16 h-1 bg-brand mb-6"></div>
              </div>
              <ul className="space-y-3">
                {membershipLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="text-gray-300 hover:text-brabg-brand transition-colors duration-300 flex items-center gap-2"
                    >
                      <span className="text-brabg-brand">»</span>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div> */}

            {/* Instagram Section */}
            <div className="space-y-4 relative">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Instagram</h3>
                <div className="w-16 h-[2px] bg-brand mb-6 absolute z-10"></div>
                <div className="w-[90%] h-[2px] bg-gray-500 mb-6 absolute"></div>
              </div>

              {/* Instagram Photo Grid */}
              <div className="grid grid-cols-3 gap-2 mt-10">
                {instagramPhotos.map((photo, index) => (
                  <div
                    key={index}
                    className="relative aspect-square object-center bg-center bg-cover rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300 border-2 border-gray-400 hover:border-orange-600 group"
                  >
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${photo})`,
                      }}
                    ></div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-[#70167E]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center">
                      <Plus />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Section */}
      <div className="bg-purple-700 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            {/* Copyright */}
            <div className="text-white text-sm">
              Copyright © 2025{" "}
              <span className="text-brabg-brand font-bold">Tiny Giggle</span>.
              All Rights Reserved By{" "}
              <span className="text-brabg-brand font-bold">SOFTEXSOLUTION</span>
              .
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
