"use client";

import React, { useState } from "react";
import { 
  Star, 
  MapPin, 
  Clock, 
  ChevronRight, 
  Baby, 
  Heart,
  CalendarCheck,
  ShieldCheck,
  Languages
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import BookingModal from "./booking-modal";

export default function BabysitterCard({ babysitter }) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const {
    id,
    name,
    city,
    experience,
    hourlyRate,
    profilePictureUrl,
    bio,
    ageGroups,
    languages,
    isVerified
  } = babysitter;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -5 }}
        className="bg-white rounded-[2rem] p-6 shadow-xl shadow-purple-500/5 border border-slate-50 group transition-all"
      >
        <div className="flex gap-6">
          {/* Avatar Section */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-3xl overflow-hidden ring-4 ring-purple-50 group-hover:ring-purple-100 transition-all shadow-lg">
              {profilePictureUrl ? (
                <img 
                  src={profilePictureUrl} 
                  alt={name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                  <Baby className="w-10 h-10 text-purple-400 opacity-50" />
                </div>
              )}
            </div>
            {isVerified && (
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-xl shadow-lg border-2 border-white">
                <Badge className="bg-transparent hover:bg-transparent p-0 text-[10px] font-black uppercase tracking-tight">Verified</Badge>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-xl font-black text-slate-800 truncate leading-tight">{name}</h3>
                <div className="flex items-center gap-2 mt-1">
                   <Badge variant="secondary" className="bg-purple-100 text-purple-600 border-none text-[8px] font-black uppercase tracking-widest px-2">Expert Babysitter</Badge>
                </div>
              </div>
              <button className="text-slate-300 hover:text-rose-500 transition-colors">
                <Heart className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-wrap gap-y-2 gap-x-4 mt-3">
               <div className="flex items-center gap-1.5 text-slate-500 font-medium text-xs">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {city}
               </div>
               <div className="flex items-center gap-1.5 text-slate-500 font-medium text-xs">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {experience} yrs exp.
               </div>
               {languages && languages.length > 0 && (
                 <div className="flex items-center gap-1.5 text-slate-500 font-medium text-xs">
                    <Languages className="w-3.5 h-3.5 text-slate-400" />
                    {languages[0]} {languages.length > 1 && `+${languages.length - 1}`}
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Bio Preview */}
        {bio && (
          <p className="mt-4 text-slate-500 text-sm line-clamp-2 font-medium leading-relaxed">
            {bio}
          </p>
        )}

        <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
          <div>
             <p className="text-[10px] items-center gap-1.5 text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Hourly Rate</p>
             <p className="text-2xl font-black text-slate-900 leading-none">${hourlyRate || 0}<span className="text-sm text-slate-400 font-bold">/hr</span></p>
          </div>
          <Button 
            onClick={() => setIsBookingOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl px-6 h-12 font-bold shadow-lg shadow-purple-200 group-hover:px-8 transition-all"
          >
            Book Now
            <CalendarCheck className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>

      <BookingModal 
        isOpen={isBookingOpen}
        onOpenChange={setIsBookingOpen}
        professional={babysitter}
        type="babysitter"
      />
    </>
  );
}
