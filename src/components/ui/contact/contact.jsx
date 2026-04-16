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
            <motion.div
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
            </motion.div>

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
                    href="#"
                    className="w-8 h-8 text-gray-600 hover:text-secondary transition-colors duration-300 cursor-pointer"
                  >
                    <Facebook className="w-full h-full" />
                  </a>
                  {/* Instagram */}
                  <a
                    href="#"
                    className="w-8 h-8 text-gray-600 hover:text-secondary transition-colors duration-300 cursor-pointer"
                  >
                    <Instagram className="w-full h-full" />
                  </a>

                  {/* Vimeo */}
                  {/* <a
                    href="#"
                    className="w-8 h-8 text-gray-600 hover:text-secondary transition-colors duration-300 cursor-pointer"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-full h-full"
                    >
                      <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z" />
                    </svg>
                  </a> */}
                  {/* Youtube */}
                  <a
                    href="#"
                    className="w-8 h-8 text-gray-600 hover:text-secondary transition-colors duration-300 cursor-pointer"
                  >
                    <Youtube className="w-full h-full" />
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
