"use client";

import React from "react";
import { Search, Filter, X, Stethoscope, Home, Building2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input.jsx";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select.jsx";
import { Button } from "@/components/ui/button.jsx";

export default function DoctorFilters({ filters, setFilters, onSearch }) {
  const resetFilters = () => {
    setFilters({
      search: "",
      specialty: "all",
      mode: "all",
      city: ""
    });
  };

  const hasActiveFilters = filters.search || filters.specialty !== "all" || filters.mode !== "all" || filters.city;

  return (
    <div className="bg-white/50 backdrop-blur-xl border border-white rounded-[2.5rem] p-6 shadow-xl shadow-purple-500/5 sticky top-6 z-20">
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        {/* Search Bar */}
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
          <Input 
            placeholder="Search by name, specialty or bio..." 
            className="pl-12 h-14 rounded-3xl border-slate-100 bg-white/80 focus:ring-purple-500 transition-all text-sm font-medium"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        {/* Filters Grid */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Specialty Select */}
          <div className="w-full sm:w-48">
            <Select 
              value={filters.specialty} 
              onValueChange={(val) => setFilters({ ...filters, specialty: val })}
            >
              <SelectTrigger className="h-14 rounded-3xl border-slate-100 bg-white/80 font-bold text-slate-700">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-purple-500" />
                  <SelectValue placeholder="Specialty" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100">
                <SelectItem value="all" className="font-bold">All Specialties</SelectItem>
                <SelectItem value="Pediatrician">Pediatrician</SelectItem>
                <SelectItem value="Cardiologist">Cardiologist</SelectItem>
                <SelectItem value="Dermatologist">Dermatologist</SelectItem>
                <SelectItem value="General Physician">General Physician</SelectItem>
                <SelectItem value="Neurologist">Neurologist</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mode Select */}
          <div className="w-full sm:w-48">
            <Select 
              value={filters.mode} 
              onValueChange={(val) => setFilters({ ...filters, mode: val })}
            >
              <SelectTrigger className="h-14 rounded-3xl border-slate-100 bg-white/80 font-bold text-slate-700">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-indigo-500" />
                  <SelectValue placeholder="Visit Mode" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100">
                <SelectItem value="all" className="font-bold">Any Mode</SelectItem>
                <SelectItem value="HOME" className="font-bold">Home Visit</SelectItem>
                <SelectItem value="CLINIC" className="font-bold">Clinic Visit</SelectItem>
                <SelectItem value="BOTH" className="font-bold">Both Available</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* City Selection Mock - Using Input for simplicity */}
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
            Find Doctors
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
