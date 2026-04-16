"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card.jsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { 
  MessageSquare, 
  Heart, 
  Eye, 
  Clock, 
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Stethoscope,
  User,
  ShoppingBag,
  Music
} from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

const ROLE_ICONS = {
  DOCTOR: { icon: Stethoscope, color: "text-blue-500", bg: "bg-blue-50" },
  PARENT: { icon: User, color: "text-purple-500", bg: "bg-purple-50" },
  ADMIN: { icon: ShieldCheck, color: "text-red-500", bg: "bg-red-50" },
  BABYSITTER: { icon: Heart, color: "text-pink-500", bg: "bg-pink-50" },
  SUPPLIER: { icon: ShoppingBag, color: "text-orange-500", bg: "bg-orange-50" },
  ARTIST: { icon: Music, color: "text-indigo-500", bg: "bg-indigo-50" },
};

export default function QuestionCard({ question, onLike }) {
  const roleInfo = ROLE_ICONS[question.authorType] || ROLE_ICONS.PARENT;
  const IconComponent = roleInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/community/${question.id}`}>
        <Card className="group border-none shadow-xl shadow-slate-200/50 bg-white/70 backdrop-blur-md hover:bg-white transition-all overflow-hidden rounded-[2rem]">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              {/* Header: Author & Date */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12 ring-2 ring-white shadow-sm">
                      <AvatarImage src={question.authorAvatar} />
                      <AvatarFallback className={roleInfo.bg + " " + roleInfo.color}>
                        {question.authorName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${roleInfo.bg} flex items-center justify-center border-2 border-white shadow-sm`}>
                      <IconComponent className={`w-3 h-3 ${roleInfo.color}`} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 leading-none mb-1">
                      {question.authorName}
                    </h4>
                    <div className="flex items-center gap-2">
                       <Badge variant="secondary" className={`text-[10px] uppercase tracking-tighter font-black ${roleInfo.bg} ${roleInfo.color} border-none`}>
                         {question.authorType}
                       </Badge>
                       <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                         <Clock className="w-3 h-3" />
                         {formatDistanceToNow(new Date(question.createdAt))} ago
                       </span>
                    </div>
                  </div>
                </div>

                {question._count?.likes > 10 && (
                   <div className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                     <TrendingUp className="w-3 h-3" />
                     Trending
                   </div>
                )}
              </div>

              {/* Title & Content Snippet */}
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 group-hover:text-purple-600 transition-colors leading-tight">
                  {question.title}
                </h3>
                <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                  {question.content}
                </p>
              </div>

              {/* Footer: Stats & Interaction */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-slate-400 group/item">
                    <MessageSquare className="w-4 h-4 group-hover/item:text-blue-500 transition-colors" />
                    <span className="text-xs font-bold text-slate-600">{question._count?.answers || 0}</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (onLike) onLike(question.id);
                    }}
                    className={`flex items-center gap-1.5 transition-all hover:scale-110 active:scale-95 ${question.isLiked ? "text-rose-500" : "text-slate-400"} group/item`}
                  >
                    <Heart className={`w-4 h-4 transition-colors ${question.isLiked ? "fill-rose-500 text-rose-500" : "group-hover/item:text-rose-500"}`} />
                    <span className={`text-xs font-bold ${question.isLiked ? "text-rose-600" : "text-slate-600"}`}>
                      {question._count?.likes || 0}
                    </span>
                  </button>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Eye className="w-4 h-4" />
                    <span className="text-xs font-bold text-slate-600">{question.views || 0}</span>
                  </div>
                </div>

                <div className="bg-slate-50 group-hover:bg-purple-600 p-2 rounded-xl transition-all">
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
