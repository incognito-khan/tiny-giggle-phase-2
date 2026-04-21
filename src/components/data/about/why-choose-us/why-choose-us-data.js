import { PinIcon as Pinwheel, Shield, Home, Heart } from "lucide-react";

export const cardsData = [
  {
    id: 1,
    title: "Doctors",
    description:
      "Provide trusted care and support parents with expert guidance and health services.",
    icon: <Shield className="w-6 h-6 text-white" />,
    iconBg: "#FFA69E",
    detail: {
      heading: "Trusted Medical Professionals",
      body: "Our verified doctors specialize in pediatric care and child development. From routine checkups and vaccinations to answering late-night health concerns, they are here to give parents peace of mind. Each doctor on our platform is board-certified, background-checked, and experienced in working with infants, toddlers, and young children.",
      highlights: [
        "Board-certified pediatricians",
        "24/7 consultation availability",
        "Vaccination & growth tracking",
        "Developmental milestone guidance",
      ],
    },
  },
  {
    id: 2,
    title: "Babysitters",
    description:
      "Offer safe, reliable childcare support for families when they need it most.",
    icon: <Home className="w-6 h-6 text-white" />,
    iconBg: "#A8E6CF",
    detail: {
      heading: "Safe & Reliable Childcare",
      body: "Finding someone you truly trust with your child is never easy. Our babysitters are thoroughly vetted, trained in first aid, and matched to your family's needs and schedule. Whether you need a few hours of coverage or regular weekly support, our caregivers bring warmth, patience, and professionalism to every visit.",
      highlights: [
        "Background-verified caregivers",
        "First aid & CPR certified",
        "Flexible hourly & weekly bookings",
        "Matched to your child's age & needs",
      ],
    },
  },
  {
    id: 3,
    title: "Musicians",
    description:
      "Share calming and engaging music created for babies and young children.",
    icon: <Heart className="w-6 h-6 text-white" />,
    iconBg: "#FFD93D",
    detail: {
      heading: "Music Made for Little Ears",
      body: "Music plays a powerful role in early childhood development — from soothing a fussy newborn to sparking creativity in a curious toddler. Our musicians craft original lullabies, sensory songs, and playful tunes that are scientifically designed to support language, emotion, and cognitive growth in young children.",
      highlights: [
        "Original lullabies & sensory songs",
        "Supports language development",
        "Calming bedtime playlists",
        "Interactive music for playtime",
      ],
    },
  },
];