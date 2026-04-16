"use client"

import { Share2, Linkedin, Instagram, Facebook } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useMotionValue, useSpring, useTransform, AnimatePresence, motion, useAnimation, useInView } from "framer-motion";
import { teamMembersData } from "@/components/data/about/teammembersdata";

export default function Testominal() {
  const [hoveredCard, setHoveredCard] = useState(null)
  const [hoveredIcon, setHoveredIcon] = useState(null)

  const ref = useRef(null)
  const subControls = useAnimation()
  const mainControls = useAnimation()
  const inView = useInView(ref, { once: false, amount: 0.4 })

  // Variant for individual characters
  const charVariant = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }
  }

  // Subheading container with staggered children
  const subVariants = {
    hidden: {},
    visible: { transition: { when: 'beforeChildren', staggerChildren: 0.03 } }
  }

  // Main heading container with staggered children
  const mainVariants = {
    hidden: {},
    visible: { transition: { when: 'beforeChildren', staggerChildren: 0.03 } }
  }

  useEffect(() => {
    if (inView) {
      // Animate subheading first
      subControls.start('visible').then(() => {
        // After 1s, animate main heading
        setTimeout(() => mainControls.start('visible'), 50)
      })
    } else {
      // Reset both
      subControls.start('hidden')
      mainControls.start('hidden')
    }
  }, [inView, mainControls, subControls])

  return (
    <div ref={ref} className="py-16 bg-gray-50 bg-cover bg-center"
      style={{ backgroundImage: `url(https://html.vecurosoft.com/toddly/demo/assets/img/team/team-bg.png)` }}
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-12">
          <motion.h3
            className="text-gray-500 text-sm font-medium tracking-wider uppercase mb-2"
            variants={subVariants}
            initial="hidden"
            animate={subControls}
          >
            {"Our Team".split("").map((ch, i) => (
              <motion.span key={i} variants={charVariant} aria-hidden="true">
                {ch}
              </motion.span>
            ))}
          </motion.h3>

          {/* Main Heading */}
          <motion.h2
            className="text-4xl font-bold text-gray-800 leading-tight"
            variants={mainVariants}
            initial="hidden"
            animate={mainControls}
          >
            {"Meet Our Teachers".split("").map((ch, i) => (
              <motion.span key={i} variants={charVariant} aria-hidden="true">
                {ch}
              </motion.span>
            ))}
          </motion.h2>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembersData.map((member) => (
            <div
              key={member.id}
              className="relative group"
              onMouseEnter={() => setHoveredCard(member.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Main Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 ">
                {/* Profile Image */}
                <div className="relative mb-6">
                  <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-purple-200 to-purple-300">
                    {/* Purple Overlay on Hover */}
                    <div className="absolute inset-0 bg-secondary opacity-0 group-hover:opacity-15 transition-all duration-500 h-0 group-hover:h-full rounded-2xl z-10" />
                    <div
                      className="w-full h-full bg-cover bg-center bg-gray-200  z-[2] transition-transform duration-200"
                      style={{
                        backgroundImage: `url(${member.image})`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Member Info */}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{member.name}</h3>
                  <p className={`text-base font-medium ${member.titleColor || "text-gray-500"}`}>{member.title}</p>
                </div>

                {/* Share Icon */}
                <div className="absolute bottom-4 right-4"
                  onMouseEnter={() => setHoveredIcon(member.id)}
                  onMouseLeave={() => setHoveredIcon(null)}
                >
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center cursor-pointer hover:bg-brand transition-colors duration-300 relative z-20">
                    <Share2 className="w-4 h-4 text-white" />
                    {/* Social Media Icons - Show on Hover */}
                    <div
                      className={`absolute -top-[345%] right-0 transform -translate-y-1/2 flex flex-col gap-2 transition-all duration-300 z-10 ${hoveredIcon === member.id
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 -translate-y-4 pointer-events-none"
                        }`}
                      onMouseEnter={() => setHoveredIcon(member.id)}
                      onMouseLeave={() => setHoveredIcon(null)}
                    >
                      {/* LinkedIn */}
                      <a
                        href={member.socialLinks.linkedin}
                        className="w-10 h-10 bg-brand rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer"
                      >
                        <Linkedin className="w-5 h-5 text-white hover:rotate-y-[360deg] transition-transform duration-500" />
                      </a>

                      {/* Instagram */}
                      <a
                        href={member.socialLinks.instagram}
                        className="w-10 h-10 bg-brand rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer"
                      >
                        <Instagram className="w-5 h-5 text-white hover:rotate-[360deg] transition-transform duration-500" />
                      </a>

                      {/* Facebook */}
                      <a
                        href={member.socialLinks.facebook}
                        className="w-10 h-10 bg-brand rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer"
                      >
                        <Facebook className="w-5 h-5 text-white hover:rotate-[360deg] transition-transform duration-500" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>


            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
