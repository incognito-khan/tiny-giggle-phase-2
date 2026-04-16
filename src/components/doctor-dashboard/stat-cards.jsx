"use client";

import React from "react";
import { Users, Calendar, Clock, MessageSquare, ArrowUpRight, ArrowDownRight, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card.jsx";
import { motion } from "framer-motion";

const stats = [
  {
    title: "Total Patients",
    value: "1,284",
    change: "+12.5%",
    isPositive: true,
    icon: Users,
    color: "bg-blue-500",
    lightColor: "bg-blue-50",
    textColor: "text-blue-600",
  },
  {
    title: "Today's Appointments",
    value: "14",
    change: "+2 from yesterday",
    isPositive: true,
    icon: Calendar,
    color: "bg-purple-600",
    lightColor: "bg-purple-50",
    textColor: "text-purple-600",
  },
  {
    title: "Pending Reports",
    value: "8",
    change: "-3 from yesterday",
    isPositive: true,
    icon: Clock,
    color: "bg-amber-500",
    lightColor: "bg-amber-50",
    textColor: "text-amber-600",
  },
  {
    title: "New Messages",
    value: "25",
    change: "+5 today",
    isPositive: true,
    icon: MessageSquare,
    color: "bg-indigo-500",
    lightColor: "bg-indigo-50",
    textColor: "text-indigo-600",
  },
];

export default function StatCards({ data }) {
  const stats = [
    {
      title: "Total Patients",
      value: data?.totalPatients?.toLocaleString() || "0",
      change: "+2.5%",
      isPositive: true,
      icon: Users,
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
      textColor: "text-blue-600",
      sub: "total visits"
    },
    {
      title: "Appointments Today",
      value: data?.activeToday || "0",
      change: "+12%",
      isPositive: true,
      icon: Calendar,
      color: "bg-purple-600",
      lightColor: "bg-purple-50",
      textColor: "text-purple-600",
      sub: "for today"
    },
    {
      title: "Pending Requests",
      value: data?.pendingRequests || "0",
      change: "-5%",
      isPositive: true,
      icon: Clock,
      color: "bg-amber-500",
      lightColor: "bg-amber-50",
      textColor: "text-amber-600",
      sub: "awaiting"
    },
    {
      title: "Total Earnings",
      value: `$${(data?.totalEarnings || 0).toLocaleString()}`,
      change: "+8%",
      isPositive: true,
      icon: DollarSign,
      color: "bg-emerald-500",
      lightColor: "bg-emerald-50",
      textColor: "text-emerald-600",
      sub: "all time"
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -5 }}
        >
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden group">
            <CardContent className="p-6 relative">
              <div className="flex justify-between items-start mb-4">
                <div className={`${stat.lightColor} p-3 rounded-2xl transition-colors group-hover:bg-opacity-80`}>
                  <stat.icon className={`${stat.textColor} w-6 h-6`} />
                </div>
                {/* Visual badge for consistency */}
                <div className="px-2 py-1 rounded-full bg-slate-50 text-[10px] font-bold text-slate-400 border border-slate-100 uppercase tracking-tight">
                  Status
                </div>
              </div>
              
              <div>
                <p className="text-slate-500 text-sm font-medium mb-1">{stat.title}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
                  <p className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3" />
                    {stat.sub}
                  </p>
                </div>
              </div>

              {/* Decorative background element */}
              <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${stat.lightColor} opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`} />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
