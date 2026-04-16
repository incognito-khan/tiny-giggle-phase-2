import { PinIcon as Pinwheel, Shield, Home, Heart } from "lucide-react";

export const cardsData = [
  {
    id: 1,
    title: "Doctors",
    description:
      "Provide trusted care and support parents with expert guidance and health services.",
    icon: <Shield className="w-6 h-6 text-white" />,
    iconBg: "#FFA69E",
  },
  {
    id: 2,
    title: "Babysitters",
    description:
      "Offer safe, reliable childcare support for families when they need it most.",
    icon: <Home className="w-6 h-6 text-white" />,
    iconBg: "#A8E6CF",
  },
  {
    id: 3,
    title: "Musicians",
    description:
      "Share calming and engaging music created for babies and young children.",
    icon: <Heart className="w-6 h-6 text-white" />,
    iconBg: "#FFD93D",
  },
];
