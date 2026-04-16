"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Stethoscope, 
  ChevronLeft, 
  ChevronRight, 
  SearchX, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import axios from "axios";
import { GET } from "@/lib/api";

import DoctorCard from "@/components/dashboard/doctor-card";
import DoctorFilters from "@/components/dashboard/doctor-filters";
import { Button } from "@/components/ui/button.jsx";

export default function ParentDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });

  const [filters, setFilters] = useState({
    search: "",
    specialty: "all",
    mode: "all",
    city: ""
  });

  const fetchDoctors = useCallback(async (pageNumber = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pageNumber.toString(),
        limit: "9",
        ...(filters.search && { search: filters.search }),
        ...(filters.specialty !== "all" && { specialty: filters.specialty }),
        ...(filters.mode !== "all" && { mode: filters.mode }),
        ...(filters.city && { city: filters.city }),
      });

      const { data } = await GET(`/parents/doctors?${params.toString()}`);
      
      if (data.success) {
        setDoctors(data.data.doctors);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDoctors(1);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchDoctors(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="space-y-2">
             <div className="flex items-center gap-2 mb-1">
              <span className="p-1 px-3 bg-purple-100 text-purple-700 text-[10px] font-black uppercase rounded-lg tracking-widest">Medical Care</span>
              <Sparkles className="w-4 h-4 text-purple-500 fill-current" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none">
              Find the <span className="text-purple-600 font-outline-2">Best Doctors</span>
            </h1>
            <p className="text-slate-500 font-semibold max-w-xl">
              Connect with top-rated medical professionals specialized in child healthcare and family wellness.
            </p>
          </div>

          <div className="bg-white/80 p-4 rounded-3xl border border-slate-100 shadow-sm hidden lg:flex items-center gap-4">
             <div className="text-right">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Total Experts</p>
                <p className="text-2xl font-black text-slate-900 leading-none">{pagination?.total || 0}</p>
             </div>
             <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-200">
                <Stethoscope className="w-6 h-6" />
             </div>
          </div>
        </motion.div>

        {/* Filters Section */}
        <DoctorFilters 
          filters={filters} 
          setFilters={setFilters} 
          onSearch={() => fetchDoctors(1)} 
        />

        {/* Results Section */}
        <div className="relative min-h-[400px]">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-72 bg-slate-100/50 rounded-[2rem] animate-pulse border border-slate-100" />
              ))}
            </div>
          ) : doctors.length > 0 ? (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } }
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {doctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-[3rem] border border-dashed border-slate-200"
            >
              <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6">
                 <SearchX className="w-12 h-12 text-slate-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">No doctors found</h3>
              <p className="text-slate-500 font-medium mt-2 mb-8">Try adjusting your filters or search terms.</p>
              <Button 
                onClick={() => {
                  setFilters({ search: "", specialty: "all", mode: "all", city: "" });
                  fetchDoctors(1);
                }}
                className="bg-purple-600 text-white rounded-2xl px-8 h-12 font-bold"
              >
                Clear all filters
              </Button>
            </motion.div>
          )}
        </div>

        {/* Pagination Section */}
        {!loading && (pagination?.totalPages || 0) > 1 && (
          <div className="flex items-center justify-center gap-2 pt-10">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination?.page === 1}
              className="rounded-2xl border-slate-200 h-12 w-12 hover:bg-purple-50 hover:text-purple-600 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-2 bg-white px-6 h-12 rounded-2xl border border-slate-100 shadow-sm mx-2">
              {[...Array(pagination?.totalPages || 0)].map((_, i) => {
                const pageNum = i + 1;
                const isActive = pagination?.page === pageNum;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                      isActive 
                        ? "bg-purple-600 text-white shadow-md shadow-purple-200" 
                        : "text-slate-400 hover:bg-purple-50 hover:text-purple-600"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination?.page === pagination?.totalPages}
              className="rounded-2xl border-slate-200 h-12 w-12 hover:bg-purple-50 hover:text-purple-600 disabled:opacity-30 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Footer Promotion */}
        <div className="bg-indigo-600 rounded-[3rem] p-12 text-white relative overflow-hidden mt-10">
            <div className="relative z-10 max-w-2xl">
               <h2 className="text-4xl font-black tracking-tight mb-4">Can't find the right specialist?</h2>
               <p className="text-indigo-100 font-medium text-lg mb-8">
                 Our dedicated support team can help you find the perfect match for your family's needs. We have over 500+ verified professionals ready to help.
               </p>
               <Button className="bg-white text-indigo-600 hover:bg-indigo-50 rounded-2xl h-14 px-10 font-black text-lg group">
                  Talk to Advisor
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
               </Button>
            </div>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" 
            />
        </div>
      </div>
    </main>
  );
}
