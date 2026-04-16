"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Bell, Calendar as CalendarIcon, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import StatCards from "@/components/doctor-dashboard/stat-cards";
import PatientFlowChart from "@/components/doctor-dashboard/patient-flow-chart";
import AppointmentsList from "@/components/doctor-dashboard/appointments-list";
import { motion, AnimatePresence } from "framer-motion";
import { GET } from "@/lib/api";

export default function DoctorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data: response } = await GET("/doctors/dashboard");
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Error fetching doctor dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-[0.2em] text-xs">
          Loading Dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Dr. {data?.profile?.name || "Sarah"}
            </span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium">{currentDate}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="relative hidden md:block group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
            <Input 
              placeholder="Search patients..." 
              className="pl-10 pr-4 bg-white border-slate-200 rounded-xl w-64 focus-visible:ring-purple-500 transition-all shadow-sm"
            />
          </div>
          <Button size="icon" variant="outline" className="rounded-xl relative bg-white border-slate-200 shadow-sm">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg shadow-purple-100 px-6">
            <Plus className="w-5 h-5 mr-2" />
            New Appointment
          </Button>
        </motion.div>
      </section>

      {/* Stats Section */}
      <StatCards data={data?.stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Column */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <PatientFlowChart data={data?.chartData} />
          </motion.div>

          {/* Quick Stats / Mini Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 border-none shadow-sm bg-blue-600 text-white overflow-hidden relative group">
              <div className="relative z-10">
                <h4 className="font-bold text-lg mb-4">Patient Reviews</h4>
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-black">4.9</span>
                  <div className="flex flex-col">
                    <div className="flex text-amber-300">
                      {"★".repeat(5)}
                    </div>
                    <span className="text-sm opacity-80 text-blue-100">120+ reviews</span>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-110 transition-transform" />
            </Card>

            <Card className="p-6 border-none shadow-sm bg-purple-600 text-white overflow-hidden relative group">
              <div className="relative z-10">
                <h4 className="font-bold text-lg mb-4">Next Seminar</h4>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                    <CalendarIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold leading-none">Pediatric Symposium</p>
                    <p className="text-sm opacity-80 text-purple-100 mt-1">Tomorrow, 10:00 AM</p>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-110 transition-transform" />
            </Card>
          </div>
        </div>

        {/* Appointments Column */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-1"
        >
          <AppointmentsList appointments={data?.recentAppointments} />
        </motion.div>
      </div>
    </div>
  );
}

// Inline card shim for quick stats if UI card isn't enough
function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl ${className}`}>
      {children}
    </div>
  );
}
