"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Baby, 
  ChevronLeft, 
  ChevronRight, 
  SearchX, 
  Sparkles,
  ArrowRight,
  HeartHandshake
} from "lucide-react";
import { GET } from "@/lib/api";

import BabysitterCard from "@/components/dashboard/babysitter-card";
import BabysitterFilters from "@/components/dashboard/babysitter-filters";
import { Button } from "@/components/ui/button.jsx";

export default function ParentBabysittersPage() {
  const [babysitters, setBabysitters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });

  const [filters, setFilters] = useState({
    search: "",
    city: "",
    ageGroup: "all",
    language: "all"
  });

  const fetchBabysitters = useCallback(async (pageNumber = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pageNumber.toString(),
        limit: "9",
        ...(filters.search && { search: filters.search }),
        ...(filters.city && { city: filters.city }),
        // Note: Adding support for more filters in API later if needed
      });

      const { data } = await GET(`/parents/babysitters?${params.toString()}`);
      
      if (data.success) {
        setBabysitters(data.data.babysitters);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching babysitters:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchBabysitters(1);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchBabysitters(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-teal-50 to-emerald-50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="space-y-2">
             <div className="flex items-center gap-2 mb-1">
              <span className="p-1 px-3 bg-teal-100 text-teal-700 text-[10px] font-black uppercase rounded-lg tracking-widest">Child Support</span>
              <Sparkles className="w-4 h-4 text-teal-500 fill-current" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none">
              Find the <span className="text-indigo-600 font-outline-2">Trusted Babysitters</span>
            </h1>
            <p className="text-slate-500 font-semibold max-w-xl">
              Connect with verified and experienced nurturers dedicated to your child's safety and happiness.
            </p>
          </div>

          <div className="bg-white/80 p-4 rounded-3xl border border-slate-100 shadow-sm hidden lg:flex items-center gap-4">
             <div className="text-right">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Total Nurturers</p>
                <p className="text-2xl font-black text-slate-900 leading-none">{pagination?.total || 0}</p>
             </div>
             <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <HeartHandshake className="w-6 h-6" />
             </div>
          </div>
        </motion.div>

        {/* Filters Section */}
        <BabysitterFilters 
          filters={filters} 
          setFilters={setFilters} 
          onSearch={() => fetchBabysitters(1)} 
        />

        {/* Results Section */}
        <div className="relative min-h-[400px]">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-72 bg-slate-100/50 rounded-[2rem] animate-pulse border border-slate-100" />
              ))}
            </div>
          ) : babysitters.length > 0 ? (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } }
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {babysitters.map((babysitter) => (
                <BabysitterCard key={babysitter.id} babysitter={babysitter} />
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
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">No babysitters found</h3>
              <p className="text-slate-500 font-medium mt-2 mb-8">Try adjusting your filters or search terms.</p>
              <Button 
                onClick={() => {
                  setFilters({ search: "", city: "", ageGroup: "all", language: "all" });
                  fetchBabysitters(1);
                }}
                className="bg-indigo-600 text-white rounded-2xl px-8 h-12 font-bold"
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
              className="rounded-2xl border-slate-200 h-12 w-12 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-30 transition-all"
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
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
                        : "text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
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
              className="rounded-2xl border-slate-200 h-12 w-12 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-30 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Footer Promotion */}
        <div className="bg-teal-600 rounded-[3rem] p-12 text-white relative overflow-hidden mt-10 shadow-2xl shadow-teal-500/20">
            <div className="relative z-10 max-w-2xl">
               <h2 className="text-4xl font-black tracking-tight mb-4">Looking for a long-term nanny?</h2>
               <p className="text-teal-500 bg-white/90 p-1 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest w-fit mb-4">Exclusive Service</p>
               <p className="text-teal-50 font-medium text-lg mb-8">
                 We offer dedicated background-checked nannies for long-term placement. Our concierge team handles all the vetting for you.
               </p>
               <Button className="bg-white text-teal-600 hover:bg-teal-50 rounded-2xl h-14 px-10 font-black text-lg group shadow-xl">
                  Contact Support
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
               </Button>
            </div>
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/20 rounded-full blur-3xl" 
            />
        </div>
      </div>
    </main>
  );
}
