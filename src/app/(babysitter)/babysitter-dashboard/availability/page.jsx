"use client";

import React, { useState, useEffect } from "react";
import { 
  Clock, 
  Save, 
  Calendar, 
  AlertCircle, 
  Loader2, 
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { GET, POST } from "@/lib/api";
import { Button } from "@/components/ui/button.jsx";
import AvailabilityCard from "@/components/babysitter-dashboard/availability-card.jsx";

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState(
    DAYS_OF_WEEK.map((day) => ({
      day,
      startTime: "09:00",
      endTime: "17:00",
      active: false,
    }))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const { data } = await GET("/babysitters/availability");
      if (data.success && data.data.length > 0) {
        const dbData = data.data;
        const merged = DAYS_OF_WEEK.map((day) => {
          const found = dbData.find((d) => d.day === day);
          return found
            ? { ...found, active: true }
            : { day, startTime: "09:00", endTime: "17:00", active: false };
        });
        setAvailability(merged);
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
      toast.error("Failed to load availability settings");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDay = (updatedDay) => {
    setAvailability((prev) =>
      prev.map((d) => (d.day === updatedDay.day ? updatedDay : d))
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data } = await POST("/babysitters/availability", {
        availability: availability,
      });

      if (data.success) {
        toast.success("Availability updated successfully!");
      } else {
        toast.error(data.message || "Failed to update availability");
      }
    } catch (error) {
      console.error("Error saving availability:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Clock className="w-5 h-5 text-purple-400" />
          </motion.div>
        </div>
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-[0.2em] text-xs">
          Loading Schedule...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase tracking-widest"
          >
            <Calendar className="w-4 h-4" />
            Schedule Management
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-slate-800 tracking-tight"
          >
            Set Your <span className="bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">Availability</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 font-medium"
          >
            Manage your weekly working hours and let parents know when you're ready to giggle!
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={handleSave}
            disabled={saving}
            className="h-14 px-8 rounded-2xl bg-[#70197a] hover:bg-[#5a1463] text-white font-bold shadow-xl shadow-purple-500/20 transition-all hover:scale-105 active:scale-95 gap-3"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {saving ? "Saving Changes..." : "Save Availability"}
          </Button>
        </motion.div>
      </div>

      {/* Info Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-purple-50/50 border border-purple-100 rounded-[2rem] p-6 flex flex-col md:flex-row items-center gap-6"
      >
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
           <ShieldCheck className="w-8 h-8 text-purple-600" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="text-lg font-bold text-slate-800">Recurring Schedule</h4>
          <p className="text-sm text-slate-500 font-medium">
            The hours you set below will repeat every week. Parents can only book sessions within these timeframes.
          </p>
        </div>
        <div className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl border border-purple-100 shadow-sm">
           <AlertCircle className="w-4 h-4 text-amber-500" />
           <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Auto-synced with bookings</span>
        </div>
      </motion.div>

      {/* Availability Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {availability.map((dayData, index) => (
            <AvailabilityCard
              key={dayData.day}
              dayData={dayData}
              onUpdate={handleUpdateDay}
            />
          ))}
        </AnimatePresence>
        
        {/* Helper Card */}
        <div className="relative group overflow-hidden rounded-[2rem] border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center gap-4 hover:border-purple-300 transition-colors cursor-help">
           <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-purple-50 transition-colors">
              <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-purple-400 -rotate-45" />
           </div>
           <p className="text-sm font-bold text-slate-400 group-hover:text-purple-500">
             Need to block a specific date?<br/>
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Coming Soon</span>
           </p>
        </div>
      </div>
    </div>
  );
}
