"use client";

import React from "react";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";
import { cn } from "@/lib/utils";

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return [`${hour}:00`, `${hour}:30`];
}).flat();

export default function AvailabilityCard({ dayData, onUpdate }) {
  const { day, startTime, endTime, active } = dayData;

  const handleToggle = (checked) => {
    onUpdate({ ...dayData, active: checked });
  };

  const handleTimeChange = (field, value) => {
    onUpdate({ ...dayData, [field]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-3xl p-6 transition-all duration-300 border",
        active
          ? "bg-white border-purple-100 shadow-xl shadow-purple-500/5 ring-1 ring-purple-50"
          : "bg-slate-50/50 border-slate-200 grayscale opacity-60",
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500",
              active ? "bg-purple-600 text-white rotate-3" : "bg-slate-200 text-slate-400 rotate-0",
            )}
          >
            {active ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">{day}</h3>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">
              {active ? "Available" : "Unavailable"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-xl border border-slate-200/50">
          <Checkbox
            id={`toggle-${day}`}
            checked={active}
            onCheckedChange={handleToggle}
            className="w-5 h-5 border-2 border-purple-200 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-purple-400" />
            Starts At
          </label>
          <Select
            value={startTime}
            disabled={!active}
            onValueChange={(val) => handleTimeChange("startTime", val)}
          >
            <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white/50 backdrop-blur-sm focus:ring-purple-500/20 font-bold text-sm">
              <SelectValue placeholder="Start Time" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-purple-100 shadow-2xl">
              {TIME_SLOTS.map((time) => (
                <SelectItem key={time} value={time} className="rounded-lg focus:bg-purple-50 focus:text-purple-700">
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-rose-400" />
            Ends At
          </label>
          <Select
            value={endTime}
            disabled={!active}
            onValueChange={(val) => handleTimeChange("endTime", val)}
          >
            <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white/50 backdrop-blur-sm focus:ring-purple-500/20 font-bold text-sm">
              <SelectValue placeholder="End Time" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-purple-100 shadow-2xl">
              {TIME_SLOTS.map((time) => (
                <SelectItem key={time} value={time} className="rounded-lg focus:bg-purple-50 focus:text-purple-700">
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {active && (
        <div className="mt-4 pt-4 border-t border-purple-50">
          <div className="flex items-center gap-2 text-purple-500">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Visible to parents
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
