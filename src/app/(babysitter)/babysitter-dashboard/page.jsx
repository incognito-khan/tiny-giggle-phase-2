"use client";

import React, { useState, useEffect } from "react";
import { Plus, Bell, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button.jsx";
import BabysitterStats from "@/components/babysitter-dashboard/babysitter-stats";
import EarningsChart from "@/components/babysitter-dashboard/earnings-chart";
import BookingsList from "@/components/babysitter-dashboard/bookings-list";
import { motion } from "framer-motion";
import { GET } from "@/lib/api";

export default function BabysitterDashboard() {
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await GET("/babysitters/dashboard");
        if (data?.success) {
          setDashData(data.data);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const profileName = dashData?.profile?.name || "Babysitter";
  const firstName = profileName.split(" ")[0];

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 px-2 bg-purple-100 text-purple-700 text-[10px] font-black uppercase rounded-lg tracking-widest">
              Babysitter Pro
            </span>
            <Sparkles className="w-3.5 h-3.5 text-purple-500 fill-current" />
          </div>
          {loading ? (
            <div className="h-10 w-48 bg-slate-100 animate-pulse rounded-2xl" />
          ) : (
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
              Hello, <span className="text-purple-600">{firstName}!</span>
            </h1>
          )}
          <p className="text-slate-500 mt-2 font-semibold flex items-center gap-2">
            {currentDate}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          {/* Availability indicator */}
          <div className="hidden lg:flex items-center gap-3 bg-white p-2 px-4 rounded-2xl shadow-sm border border-purple-50">
            <span className="text-xs font-bold text-slate-500">Available for hire</span>
            <div className="w-10 h-5 bg-emerald-500 rounded-full relative p-0.5 cursor-pointer">
              <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm shadow-emerald-900/20" />
            </div>
          </div>

          <Button
            size="icon"
            variant="outline"
            className="rounded-2xl relative bg-white border-slate-200 shadow-sm h-12 w-12 hover:bg-purple-50 transition-colors"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-purple-500 rounded-full border-2 border-white shadow-sm" />
          </Button>

          <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl shadow-xl shadow-purple-200 px-6 h-12 font-bold group">
            <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
            Find New Gigs
          </Button>
        </motion.div>
      </section>

      {/* Stats Section */}
      <BabysitterStats stats={dashData?.stats} loading={loading} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bookings Column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <BookingsList bookings={dashData?.recentBookings} loading={loading} />
        </motion.div>

        {/* Analytics Column */}
        <div className="lg:col-span-1 space-y-8">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <EarningsChart
              data={dashData?.earnings?.weekly}
              total={dashData?.earnings?.weeklyTotal}
              loading={loading}
            />
          </motion.div>

          {/* Profile Completion Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group"
          >
            <div className="relative z-10">
              <h4 className="font-black text-xl mb-2 tracking-tight">Profile Completion</h4>
              <p className="text-sm opacity-80 mb-6 font-medium">
                Add more photos to increase your visibility by 40%!
              </p>
              <div className="w-full bg-indigo-900/40 h-3 rounded-full mb-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: dashData?.profile?.isVerified ? "100%" : "85%" }}
                  transition={{ delay: 1, duration: 2 }}
                  className="bg-white h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                />
              </div>
              <div className="flex justify-between items-center text-xs font-black tracking-widest uppercase opacity-60">
                <span>{dashData?.profile?.isVerified ? "100% COMPLETED" : "85% COMPLETED"}</span>
                <span>{dashData?.profile?.isVerified ? "VERIFIED ✓" : "15% REMAINING"}</span>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-125 transition-transform duration-500" />
            <div className="absolute bottom-4 right-4 p-3 bg-white/20 rounded-2xl backdrop-blur-md group-hover:rotate-12 transition-transform">
              <Check className="w-6 h-6" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
