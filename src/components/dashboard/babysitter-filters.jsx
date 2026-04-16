"use client";

import React from "react";
import { Search, Filter, X, Baby, MapPin, Sparkles, Languages } from "lucide-react";
import { Input } from "@/components/ui/input.jsx";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select.jsx";
import { Button } from "@/components/ui/button.jsx";

export default function BabysitterFilters({ filters, setFilters, onSearch }) {
  const resetFilters = () => {
    setFilters({
      search: "",
      city: "",
      ageGroup: "all",
      language: "all"
    });
  };

  const hasActiveFilters = filters.search || filters.city || filters.ageGroup !== "all" || filters.language !== "all";

  return (
    <div className="bg-white/50 backdrop-blur-xl border border-white rounded-[2.5rem] p-6 shadow-xl shadow-purple-500/5 sticky top-6 z-20">
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        {/* Search Bar */}
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
          <Input 
            placeholder="Search by name, bio or expertise..." 
            className="pl-12 h-14 rounded-3xl border-slate-100 bg-white/80 focus:ring-purple-500 transition-all text-sm font-medium"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        {/* Filters Grid */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Age Group Select */}
          <div className="w-full sm:w-48">
            <Select 
              value={filters.ageGroup} 
              onValueChange={(val) => setFilters({ ...filters, ageGroup: val })}
            >
              <SelectTrigger className="h-14 rounded-3xl border-slate-100 bg-white/80 font-bold text-slate-700">
                <div className="flex items-center gap-2">
                  <Baby className="w-4 h-4 text-purple-500" />
                  <SelectValue placeholder="Age Group" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100">
                <SelectItem value="all" className="font-bold">All Ages</SelectItem>
                <SelectItem value="0-2" className="font-bold">0-2 Years</SelectItem>
                <SelectItem value="2-5" className="font-bold">2-5 Years</SelectItem>
                <SelectItem value="5-10" className="font-bold">5-10 Years</SelectItem>
                <SelectItem value="10+" className="font-bold">10+ Years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Language Select */}
          <div className="w-full sm:w-48">
            <Select 
              value={filters.language} 
              onValueChange={(val) => setFilters({ ...filters, language: val })}
            >
              <SelectTrigger className="h-14 rounded-3xl border-slate-100 bg-white/80 font-bold text-slate-700">
                <div className="flex items-center gap-2">
                  <Languages className="w-4 h-4 text-indigo-500" />
                  <SelectValue placeholder="Language" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100">
                <SelectItem value="all" className="font-bold">Any Language</SelectItem>
                <SelectItem value="English" className="font-bold">English</SelectItem>
                <SelectItem value="Spanish" className="font-bold">Spanish</SelectItem>
                <SelectItem value="French" className="font-bold">French</SelectItem>
                <SelectItem value="German" className="font-bold">German</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* City Selection */}
          <div className="relative w-full sm:w-48 group">
             <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
             <Input 
              placeholder="City..." 
              className="pl-10 h-14 rounded-3xl border-slate-100 bg-white/80 focus:ring-indigo-500 transition-all text-sm font-bold"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            />
          </div>

          {/* Search Button */}
          <Button 
            onClick={onSearch}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-3xl h-14 px-8 font-black shadow-lg shadow-purple-200"
          >
            Find Babysitters
          </Button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              onClick={resetFilters}
              className="rounded-3xl h-14 px-4 text-slate-400 hover:text-rose-500 hover:bg-rose-50"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
