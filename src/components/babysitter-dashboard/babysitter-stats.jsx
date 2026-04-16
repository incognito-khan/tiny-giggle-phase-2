"use client";

import React from "react";
import { Calendar, UserPlus, Clock, DollarSign, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card.jsx";
import { motion } from "framer-motion";

const STAT_CONFIG = [
  {
    key: "activeBookings",
    title: "Active Bookings",
    icon: Calendar,
    lightColor: "bg-purple-50",
    textColor: "text-purple-600",
    format: v => String(v),
    sub: v => `${v} accepted`,
  },
  {
    key: "pendingRequests",
    title: "New Requests",
    icon: UserPlus,
    lightColor: "bg-purple-50",
    textColor: "text-purple-500",
    format: v => String(v),
    sub: v => `${v} awaiting`,
  },
  {
    key: "completedSessions",
    title: "Sessions Done",
    icon: Clock,
    lightColor: "bg-rose-50",
    textColor: "text-rose-600",
    format: v => String(v),
    sub: v => `${v} completed`,
  },
  {
    key: "totalEarnings",
    title: "Total Earnings",
    icon: DollarSign,
    lightColor: "bg-emerald-50",
    textColor: "text-emerald-600",
    format: v => `$${Number(v).toLocaleString()}`,
    sub: () => "all time",
  },
];

export default function BabysitterStats({ stats, loading }) {
  const totalEarnings      = stats?.totalEarnings      ?? 0;
  const tinyGiggleEarnings = stats?.tinyGiggleEarnings ?? 0;
  const selfEarnings       = stats?.selfEarnings       ?? 0;

  const tgPct   = totalEarnings > 0 ? Math.round((tinyGiggleEarnings / totalEarnings) * 100) : 0;
  const selfPct = totalEarnings > 0 ? Math.round((selfEarnings / totalEarnings) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* ── 4 equal stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STAT_CONFIG.map((cfg, index) => {
          const rawValue = stats?.[cfg.key] ?? 0;
          return (
            <motion.div
              key={cfg.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white rounded-3xl overflow-hidden group relative">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`${cfg.lightColor} p-3 rounded-2xl transition-all group-hover:scale-110`}>
                      <cfg.icon className={`${cfg.textColor} w-6 h-6`} />
                    </div>
                    <div className="p-1 px-2 rounded-full bg-slate-50 text-[10px] font-bold text-slate-400 border border-slate-100 uppercase tracking-tight">
                      Summary
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm font-semibold mb-1">{cfg.title}</p>
                    {loading ? (
                      <div className="h-9 w-20 bg-slate-100 animate-pulse rounded-xl mt-1" />
                    ) : (
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-black text-slate-800">{cfg.format(rawValue)}</h3>
                        <p className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
                          <ArrowUpRight className="w-2.5 h-2.5" />
                          {cfg.sub(rawValue)}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className={`absolute -right-6 -bottom-6 w-24 h-24 ${cfg.lightColor} opacity-30 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`} />
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ── Earnings breakdown strip ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Label */}
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 shrink-0">
                Earnings Breakdown
              </p>

              {/* Stacked bar */}
              <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
                {loading ? (
                  <div className="h-full w-full bg-slate-200 animate-pulse" />
                ) : (
                  <>
                    <motion.div
                      className="h-full bg-purple-500 rounded-l-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${tgPct}%` }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                    />
                    <motion.div
                      className="h-full bg-emerald-400 rounded-r-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${selfPct}%` }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                    />
                  </>
                )}
              </div>

              {/* Two pill legends */}
              <div className="flex items-center gap-4 shrink-0">
                {loading ? (
                  <>
                    <div className="h-4 w-28 bg-slate-100 animate-pulse rounded-lg" />
                    <div className="h-4 w-28 bg-slate-100 animate-pulse rounded-lg" />
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                      <span className="text-xs font-semibold text-slate-500">Tiny Giggle Pay</span>
                      <span className="text-xs font-black text-slate-700">
                        ${tinyGiggleEarnings.toLocaleString()}
                        <span className="text-slate-400 font-medium ml-1">({tgPct}%)</span>
                      </span>
                    </div>
                    <div className="w-px h-4 bg-slate-200 hidden sm:block" />
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                      <span className="text-xs font-semibold text-slate-500">Self / Direct Pay</span>
                      <span className="text-xs font-black text-slate-700">
                        ${selfEarnings.toLocaleString()}
                        <span className="text-slate-400 font-medium ml-1">({selfPct}%)</span>
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
