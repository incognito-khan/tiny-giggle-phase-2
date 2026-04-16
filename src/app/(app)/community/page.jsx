"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  MessageCircle,
  Users,
  Sparkles,
  SearchX,
  Plus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { GET, POST } from "@/lib/api";
import QuestionCard from "@/components/community/QuestionCard";
import AskQuestionModal from "@/components/community/AskQuestionModal";
import { motion, AnimatePresence } from "framer-motion";

export default function CommunityPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchQuestions = async (isLoadMore = false) => {
    try {
      const currentPage = isLoadMore ? pagination.page + 1 : 1;
      if (!isLoadMore) setLoading(true);
      else setLoadingMore(true);

      const { data } = await GET(
        `/community/questions?search=${search}&type=${filter !== "all" ? filter : ""}&page=${currentPage}&limit=10`,
      );
      if (data.success) {
        if (isLoadMore) {
          setQuestions([...questions, ...data.data.questions]);
        } else {
          setQuestions(data.data.questions);
        }
        setPagination({
          page: data.data.pagination.page,
          totalPages: data.data.pagination.totalPages,
        });
      }
    } catch (error) {
      console.error("Fetch questions error:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLike = async (questionId) => {
    // Find the question to get current state for potential rollback
    const originalQuestions = [...questions];
    const questionIndex = questions.findIndex((q) => q.id === questionId);
    if (questionIndex === -1) return;

    const question = questions[questionIndex];
    const isLiked = question.isLiked;

    // Optimistic Update
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex] = {
      ...question,
      isLiked: !isLiked,
      _count: {
        ...question._count,
        likes: (question._count.likes || 0) + (isLiked ? -1 : 1),
      },
    };
    setQuestions(updatedQuestions);

    try {
      const { data } = await POST("/community/like", { questionId });
      if (!data.success) {
        setQuestions(originalQuestions);
      }
    } catch (error) {
      console.error("Like error:", error);
      setQuestions(originalQuestions);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [filter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchQuestions();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-50 to-white -z-10" />
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-400/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-400/10 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto px-6 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-purple-100 shadow-sm text-purple-600 font-black text-xs uppercase tracking-widest">
              <Sparkles className="w-4 h-4" />
              Empowering Connection
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[0.9]">
              Community{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                Circle
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Where curious minds meet expert care. Ask questions, share
              insights, and grow together with our professional network.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSearch}
            className="max-w-3xl mx-auto relative group"
          >
            <div className="relative flex items-center">
              <div className="absolute left-6 text-slate-400 group-focus-within:text-purple-600 transition-colors">
                <Search className="w-6 h-6" />
              </div>
              <Input
                placeholder="Search questions by keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-20 pl-16 pr-32 rounded-[2rem] border-none bg-white shadow-2xl shadow-purple-500/10 text-lg font-bold placeholder:text-slate-300 focus-visible:ring-purple-500 transition-all"
              />
              <div className="absolute right-3">
                <Button
                  type="submit"
                  className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-black text-white font-black"
                >
                  Search
                </Button>
              </div>
            </div>
          </motion.form>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 -mt-16 pb-20">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Sidebar: Filters */}
          <aside className="w-full lg:w-72 space-y-6">
            <div className="bg-white/70 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 space-y-6 sticky top-24 border border-white/50">
              <div className="flex items-center gap-3 mb-2">
                <Filter className="w-5 h-5 text-purple-600" />
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">
                  Filter By Role
                </h3>
              </div>

              <div className="flex flex-wrap lg:flex-col gap-2">
                {[
                  { label: "All Topics", value: "all" },
                  { label: "Doctors", value: "DOCTOR" },
                  { label: "Parents", value: "PARENT" },
                  { label: "Babysitters", value: "BABYSITTER" },
                  { label: "Suppliers", value: "SUPPLIER" },
                  { label: "Artists", value: "ARTIST" },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setFilter(item.value)}
                    className={`flex items-center justify-between px-5 py-4 rounded-2xl transition-all font-black text-sm text-left group
                      ${
                        filter === item.value
                          ? "bg-purple-600 text-white shadow-lg shadow-purple-200"
                          : "bg-slate-50 text-slate-600 hover:bg-white hover:shadow-md hover:text-purple-600"
                      }`}
                  >
                    {item.label}
                    <div
                      className={`w-2 h-2 rounded-full transition-all ${filter === item.value ? "bg-white scale-100" : "bg-slate-300 scale-0 group-hover:scale-100"}`}
                    />
                  </button>
                ))}
              </div>

              <div className="pt-6 border-t border-slate-100">
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black shadow-xl shadow-purple-200 group"
                >
                  <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                  Ask Question
                </Button>
              </div>
            </div>

            {/* Stats Card */}
            {/* <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white overflow-hidden relative group">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-xl">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                  <h4 className="font-black text-sm uppercase tracking-widest">Active Members</h4>
                </div>
                <div className="text-4xl font-black tabular-nums">1.2k+</div>
                <p className="text-xs text-slate-400 font-medium">Join 500+ parents and 200+ doctors interacting daily.</p>
              </div>
              <MessageCircle className="absolute -right-8 -bottom-8 w-40 h-40 opacity-10 group-hover:scale-110 transition-transform" />
            </div> */}
          </aside>

          {/* Feed Content */}
          <div className="flex-1 space-y-6">
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-64 bg-slate-100 rounded-[2.5rem] animate-pulse"
                  />
                ))}
              </div>
            ) : questions.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                <AnimatePresence>
                  {questions.map((q) => (
                    <QuestionCard key={q.id} question={q} onLike={handleLike} />
                  ))}
                </AnimatePresence>

                {pagination.page < pagination.totalPages && (
                  <div className="pt-8 flex justify-center">
                    <Button
                      onClick={() => fetchQuestions(true)}
                      disabled={loadingMore}
                      className="h-14 px-10 rounded-2xl bg-white border border-purple-100 text-purple-600 font-black hover:bg-purple-50 shadow-xl shadow-purple-500/5 transition-all group"
                    >
                      {loadingMore ? (
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      ) : (
                        <Sparkles className="w-5 h-5 mr-2 group-hover:scale-125 transition-transform" />
                      )}
                      Load More Stories
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-[3rem] p-20 text-center space-y-6 shadow-xl shadow-slate-200/50">
                <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto">
                  <SearchX className="w-12 h-12 text-slate-300" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                    No questions found
                  </h3>
                  <p className="text-slate-400 font-medium max-w-sm mx-auto">
                    Try adjusting your search or filters to find what you're
                    looking for.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setFilter("all");
                  }}
                  className="rounded-xl border-slate-200 text-slate-600 font-bold"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <AskQuestionModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        onQuestionPosted={(newQ) => setQuestions([newQ, ...questions])}
      />
    </div>
  );
}
