"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  MessageSquare, 
  Heart, 
  Eye, 
  Clock, 
  Share2,
  Send,
  Loader2,
  Stethoscope,
  ShieldCheck,
  User,
  ShoppingBag,
  Music
} from "lucide-react";
import { Button } from "@/components/ui/button.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { GET, POST } from "@/lib/api";
import AnswerItem from "@/components/community/AnswerItem";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { toast } from "react-toastify";

const ROLE_ICONS = {
  DOCTOR: { icon: Stethoscope, color: "text-blue-500", bg: "bg-blue-50" },
  PARENT: { icon: User, color: "text-purple-500", bg: "bg-purple-50" },
  ADMIN: { icon: ShieldCheck, color: "text-red-500", bg: "bg-red-50" },
  BABYSITTER: { icon: Heart, color: "text-pink-500", bg: "bg-pink-50" },
  SUPPLIER: { icon: ShoppingBag, color: "text-orange-500", bg: "bg-orange-50" },
  ARTIST: { icon: Music, color: "text-indigo-500", bg: "bg-indigo-50" },
};

export default function QuestionDetailPage({ params }) {
  const { id } = params;
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [ansPagination, setAnsPagination] = useState({ page: 1, totalPages: 1 });
  const [newAnswer, setNewAnswer] = useState("");
  const [posting, setPosting] = useState(false);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const { data } = await GET(`/community/questions/${id}`);
      if (data.success) {
        setQuestion(data.data);
      }
    } catch (error) {
      console.error("Fetch question error:", error);
      toast.error("Failed to load question");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnswers = async (isLoadMore = false) => {
    try {
      const nextPage = isLoadMore ? ansPagination.page + 1 : 1;
      setLoadingAnswers(true);
      const { data } = await GET(`/community/questions/${id}/answers?page=${nextPage}&limit=5`);
      if (data.success) {
        if (isLoadMore) {
          setAnswers([...answers, ...data.data.answers]);
        } else {
          setAnswers(data.data.answers);
        }
        setAnsPagination({
          page: data.data.pagination.page,
          totalPages: data.data.pagination.totalPages,
        });
      }
    } catch (error) {
      console.error("Fetch answers error:", error);
    } finally {
      setLoadingAnswers(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
    fetchAnswers();
  }, [id]);

  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;

    try {
      setPosting(true);
      const { data } = await POST(`/community/questions/${id}/answers`, { content: newAnswer });
      if (data.success) {
        toast.success("Answer posted successfully!");
        setNewAnswer("");
        setAnswers([data.data, ...answers]);
      }
    } catch (error) {
      console.error("Post answer error:", error);
      toast.error(error.response?.data?.message || "Failed to post answer");
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (targetId, type = "question") => {
    // Keep reference for eventual rollback
    const originalQuestion = JSON.parse(JSON.stringify(question));
    
    // Optimistic Logic
    if (type === "question") {
      setQuestion(prev => ({
        ...prev,
        isLiked: !prev.isLiked,
        _count: {
          ...prev._count,
          likes: (prev._count.likes || 0) + (prev.isLiked ? -1 : 1)
        }
      }));
    } else {
      setAnswers(prev => prev.map(ans => {
        if (ans.id === targetId) {
          return {
            ...ans,
            isLiked: !ans.isLiked,
            _count: {
              ...ans._count,
              likes: (ans._count?.likes || 0) + (ans.isLiked ? -1 : 1)
            }
          };
        }
        return ans;
      }));
    }

    try {
      const payload = type === "question" ? { questionId: targetId } : { answerId: targetId };
      const { data } = await POST("/community/like", payload);
      if (!data.success) {
        setQuestion(originalQuestion);
        toast.error("Could not process like");
      }
    } catch (error) {
      console.error("Like error:", error);
      setQuestion(originalQuestion);
      toast.error("Network error while liking");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-4">
        <h2 className="text-2xl font-black text-slate-800">Question not found</h2>
        <Link href="/community">
          <Button className="rounded-xl bg-purple-600">Return to Community</Button>
        </Link>
      </div>
    );
  }

  const roleInfo = ROLE_ICONS[question.authorType] || ROLE_ICONS.PARENT;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Header / Navigation */}
      <div className="bg-white/70 backdrop-blur-lg sticky top-0 z-20 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/community">
            <Button variant="ghost" className="rounded-xl gap-2 hover:bg-slate-100 font-bold transition-all">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <Share2 className="w-4 h-4 text-slate-400" />
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 pt-10 space-y-10">
        {/* Main Question Card */}
        <section className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-purple-500/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full blur-[80px] -z-10 translate-x-1/2 -translate-y-1/2 opacity-50" />
          
          <div className="space-y-8">
            {/* Question Author Meta */}
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14 ring-4 ring-purple-50">
                <AvatarImage src={question.authorAvatar} />
                <AvatarFallback className={roleInfo.bg + " " + roleInfo.color}>
                  {question.authorName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-lg font-black text-slate-900 leading-none">{question.authorName}</h4>
                  <Badge className={`${roleInfo.bg} ${roleInfo.color} border-none font-black text-[10px] uppercase px-3`}>
                    {question.authorType}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-slate-400 text-xs font-semibold">
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {formatDistanceToNow(new Date(question.createdAt))} ago</span>
                  <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {question.views} views</span>
                </div>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {question.title}
            </h1>

            <div className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap font-medium">
              {question.content}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
              <div className="flex items-center gap-8">
                <button 
                  onClick={() => handleLike(question.id, "question")}
                  className={`flex items-center gap-2 group transition-all ${question.isLiked ? "scale-105" : ""}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${question.isLiked ? "bg-rose-50 shadow-inner" : "bg-slate-50 group-hover:bg-rose-50"}`}>
                    <Heart className={`w-6 h-6 transition-colors ${question.isLiked ? "fill-rose-500 text-rose-500" : "text-slate-400 group-hover:text-rose-500"}`} />
                  </div>
                  <span className={`text-lg font-black transition-colors ${question.isLiked ? "text-rose-600" : "text-slate-800"}`}>
                    {question._count?.likes || 0}
                  </span>
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-slate-400" />
                  </div>
                  <span className="text-lg font-black text-slate-800">{question._count?.answers || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Answers List */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest flex items-center gap-3">
              Solutions & Answers
              <div className="h-[2px] w-20 bg-purple-200" />
            </h2>
          </div>

          <div className="space-y-0">
             {answers.length > 0 ? (
               answers.map((answer) => (
                 <AnswerItem 
                   key={answer.id} 
                   answer={answer} 
                   onLike={(id) => handleLike(id, "answer")}
                 />
               ))
             ) : (
               <div className="bg-slate-50 rounded-[2.5rem] p-12 text-center border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No answers yet. Be the first to help!</p>
               </div>
             )}

             {ansPagination.page < ansPagination.totalPages && (
               <div className="pt-6 flex justify-center">
                 <Button
                   variant="ghost"
                   disabled={loadingAnswers}
                   onClick={() => fetchAnswers(true)}
                   className="text-purple-600 font-black hover:text-purple-700 hover:bg-purple-50 rounded-2xl px-8 h-12 transition-all group"
                 >
                   {loadingAnswers ? (
                     <Loader2 className="w-5 h-5 animate-spin mr-2" />
                   ) : (
                     <MessageSquare className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                   )}
                   Show {question._count.answers - answers.length} more answers
                 </Button>
               </div>
             )}
          </div>
        </section>

        {/* Post Answer Sticky */}
        <section className="sticky bottom-8 z-10 w-full max-w-4xl mx-auto px-4">
          <form 
            onSubmit={handlePostAnswer}
            className="bg-white p-4 rounded-[2.5rem] shadow-2xl shadow-purple-900/10 border border-purple-100 flex items-center gap-4 group focus-within:ring-4 ring-purple-100 transition-all overflow-hidden"
          >
            <div className="flex-1">
              <Textarea 
                placeholder="Write your insightful answer here..."
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                className="w-full min-h-[56px] py-3 px-4 border-none bg-transparent focus-visible:ring-0 text-slate-800 font-bold placeholder:text-slate-300 resize-none"
              />
            </div>
            <Button
              type="submit"
              disabled={posting || !newAnswer.trim()}
              className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-200 relative overflow-hidden group/btn"
            >
              {posting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Send className="w-6 h-6 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
              )}
            </Button>
          </form>
        </section>
      </main>
    </div>
  );
}
