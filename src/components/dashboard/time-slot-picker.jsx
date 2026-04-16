"use client";

import React, { useEffect, useState } from "react";
import { Clock, Loader2, CalendarX } from "lucide-react";
import { format } from "date-fns";
import { GET } from "@/lib/api";
import { Button } from "@/components/ui/button.jsx";
import { motion, AnimatePresence } from "framer-motion";

export default function TimeSlotPicker({ professionalId, type, date, selectedTime, onTimeSelect }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (professionalId && date) {
      fetchAvailability();
    }
  }, [professionalId, date]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        id: professionalId,
        type: type,
        date: format(date, "yyyy-MM-dd")
      });
      const { data } = await GET(`/appointments/availability?${params.toString()}`);
      if (data.success) {
        setSlots(data.data);
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-32 flex flex-col items-center justify-center gap-2 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse">
        <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Checking Slots...</span>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="h-32 flex flex-col items-center justify-center gap-2 bg-rose-50/30 rounded-2xl border border-rose-100/50">
        <CalendarX className="w-5 h-5 text-rose-300" />
        <span className="text-[10px] font-black uppercase text-rose-400 tracking-widest text-center px-4">
          Not available on this date
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
         <Clock className="w-3.5 h-3.5 text-purple-500" />
         <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Available Hours</span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        <AnimatePresence>
          {slots.map((slot) => {
            const isSelected = selectedTime === slot.time;
            return (
              <motion.div
                key={slot.time}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Button
                  type="button"
                  variant="outline"
                  disabled={!slot.available}
                  onClick={() => onTimeSelect(slot.time)}
                  className={`w-full h-11 rounded-2xl border-slate-100 font-bold text-xs transition-all
                    ${!slot.available ? "opacity-30 bg-slate-50" : ""}
                    ${isSelected ? "bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-100" : "hover:border-purple-300 hover:bg-purple-50"}
                  `}
                >
                  {slot.time}
                </Button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
