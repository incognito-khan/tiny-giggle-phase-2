"use client";

import { useState, useRef, useEffect } from "react";
import {
  Phone,
  Mail,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  Youtube,
} from "lucide-react";
import {
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
  motion,
  useAnimation,
  useInView,
  delay,
} from "framer-motion";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Handle form submission here
  };

  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut", delay: 0.8 },
    },
  };

  const listVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, delay: 1 } },
  };

  const ref = useRef(null);
  const subControls = useAnimation();
  const mainControls = useAnimation();
  const inView = useInView(ref, { once: false, amount: 0.1 });

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
        setTimeout(() => mainControls.start("visible"), 0);
      });
    } else {
      // Reset both
      subControls.start("hidden");
      mainControls.start("hidden");
    }
  }, [inView, mainControls, subControls]);

  return (
    <div ref={ref} className="pt-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Contact Information */}
          <motion.div
            className="space-y-8"
            variants={listVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
          >
            {/* Header */}
            <div>
              {/* Animated Subheading */}
              <motion.h3
                className="text-gray-600 text-sm font-medium tracking-wider uppercase mb-2"
                variants={subVariants}
                initial="hidden"
                animate={subControls}
              >
                {"CONTACT US".split("").map((ch, i) => (
                  <motion.span
                    key={i}
                    variants={charVariant}
                    aria-hidden="true"
                  >
                    {ch}
                  </motion.span>
                ))}
              </motion.h3>

              {/* Animated Main Heading */}
              <motion.h2
                className="text-4xl font-bold text-gray-800 leading-tight"
                variants={mainVariants}
                initial="hidden"
                animate={mainControls}
              >
                {"Get In Touch".split("").map((ch, i) => (
                  <motion.span
                    key={i}
                    variants={charVariant}
                    aria-hidden="true"
                  >
                    {ch}
                  </motion.span>
                ))}
              </motion.h2>
            </div>

            {/* Description */}
            <motion.div className="space-y-2" variants={childVariants}>
              <p className="text-gray-600">
                We’d love to hear from you! Whether you have a question,
                suggestion, or just want to say hello, we’re here to help.
              </p>
            </motion.div>

            {/* Address */}
            <motion.div className="space-y-2" variants={childVariants}>
              <p className="text-gray-600">
                <span className="text-brand font-bold">Address:</span>{" "}
                Manhattan, Kansas 66506, USA
              </p>
            </motion.div>

            {/* Customer Service */}
            <motion.div
              className="flex items-start gap-4"
              variants={childVariants}
            >
              <div className="w-16 h-16 border-2 border-dashed border-gray-400 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-secondary mb-2">
                  Customer Service :
                </h3>
                <p className="text-gray-600">+1 316-712-4886</p>
              </div>
            </motion.div>

            {/* Careers */}
            {/* <motion.div
              className="flex items-start gap-4"
              variants={childVariants}
            >
              <div className="w-16 h-16 border-2 border-dashed border-gray-400 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-secondary mb-2">
                  Careers :
                </h3>
                <p className="text-gray-600">softexsolution.com</p>
              </div>
            </motion.div> */}

            <img
              className="w-full"
              src="https://html.vecurosoft.com/toddly/demo/assets/img/elements/divider-contact.svg"
              alt=""
            />

            {/* Social Media */}
            <div>
              <div className="flex items-center gap-4">
                <span className="text-gray-800 font-bold text-sm">
                  FOLLOW US :
                </span>
                <div className="flex gap-3">
                  {/* Facebook */}
                  <a
                    href="https://www.facebook.com/share/1DvrnHfAYc"
                    target="_blank"
                    className="w-8 h-8 text-gray-600 hover:text-secondary transition-colors duration-300 cursor-pointer"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-full h-full"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  {/* Instagram */}
                  <a
                    target="_blank"
                    href="https://www.instagram.com/tinyg_iggle?igsh=MXRyZzJidmQxNjVkMA=="
                    className="w-8 h-8 text-gray-600 hover:text-secondary transition-colors duration-300 cursor-pointer"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-full h-full"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  </a>
                  {/* Youtube */}
                  <a
                    href="#"
                    className="w-8 h-8 text-gray-600 hover:text-secondary transition-colors duration-300 cursor-pointer"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-full h-full"
                    >
                      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Contact Form */}
          <motion.div
            className="rounded-2xl p-8"
            variants={formVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-500">
                <div>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="Your Name *"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-brand placeholder-gray-500 bg-[#F6F1E4] font-semibold"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name *"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-brand placeholder-gray-500 bg-[#F6F1E4] font-semibold"
                  />
                </div>
              </div>

              {/* Email and Phone Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address *"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-brand placeholder-gray-500 bg-[#F6F1E4] font-semibold"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone *"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-brand placeholder-gray-500 bg-[#F6F1E4] font-semibold"
                  />
                </div>
              </div>

              {/* Message Field */}
              <div>
                <textarea
                  name="message"
                  placeholder="Type Your Message *"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-brand placeholder-gray-500 bg-[#F6F1E4] font-semibold resize-none"
                ></textarea>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  className="bg-brand text-white font-bold py-3 px-8 rounded-4xl hover:bg-secondary transition-colors duration-300 uppercase tracking-wider border-2 border-dashed border-gray-300"
                >
                  SEND MESSAGE
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
      {/* Map Section */}
      <div className="bg-gray-200 h-[500px] mt-20 ">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d24736.796194116818!2d-96.58491777204469!3d39.19518725458388!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x87bdcd8b1e33f52b%3A0xa041902477938bef!2sManhattan%2C%20KS%2066506%2C%20USA!5e0!3m2!1sen!2s!4v1740492993302!5m2!1sen!2s"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="grayscale"
        ></iframe>
      </div>
    </div>
  );
}
