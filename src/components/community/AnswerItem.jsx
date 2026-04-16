"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { 
  Heart, 
  CheckCircle,
  Stethoscope,
  ShieldCheck,
  User,
  ShoppingBag,
  Music,
  Share2,
  Flag
} from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button.jsx";

const ROLE_ICONS = {
  DOCTOR: { icon: Stethoscope, color: "text-blue-500", bg: "bg-blue-50" },
  PARENT: { icon: User, color: "text-purple-500", bg: "bg-purple-50" },
  ADMIN: { icon: ShieldCheck, color: "text-red-500", bg: "bg-red-50" },
  BABYSITTER: { icon: Heart, color: "text-pink-500", bg: "bg-pink-50" },
  SUPPLIER: { icon: ShoppingBag, color: "text-orange-500", bg: "bg-orange-50" },
  ARTIST: { icon: Music, color: "text-indigo-500", bg: "bg-indigo-50" },
};

export default function AnswerItem({ answer, onLike }) {
  const roleInfo = ROLE_ICONS[answer.authorType] || ROLE_ICONS.PARENT;
  const IconComponent = roleInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative pl-12 pb-8 border-l-2 border-slate-100 last:border-l-0 ml-6"
    >
      {/* Connector Circle */}
      <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-purple-500 shadow-sm z-10" />

      <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
        {answer.isAccepted && (
          <div className="absolute top-0 right-0 bg-emerald-500 text-white px-4 py-1.5 rounded-bl-[1.5rem] text-[10px] font-black uppercase flex items-center gap-1.5 z-10">
            <CheckCircle className="w-3.5 h-3.5" />
            Solutions
          </div>
        )}

        <div className="space-y-4">
          {/* Author Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                  <AvatarImage src={answer.authorAvatar} />
                  <AvatarFallback className={roleInfo.bg + " " + roleInfo.color}>
                    {answer.authorName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${roleInfo.bg} flex items-center justify-center border-2 border-white shadow-sm`}>
                  <IconComponent className={`w-2.5 h-2.5 ${roleInfo.color}`} />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="text-sm font-black text-slate-800">{answer.authorName}</h4>
                  <Badge variant="secondary" className={`text-[9px] uppercase tracking-tighter font-black ${roleInfo.bg} ${roleInfo.color} border-none`}>
                    {answer.authorType}
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  Replied {formatDistanceToNow(new Date(answer.createdAt))} ago
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
            {answer.content}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onLike(answer.id)}
                className={`rounded-xl hover:bg-rose-50 ${answer.isLiked ? "text-rose-500 bg-rose-50/50" : "text-slate-400"} gap-1.5 h-9 px-3 transition-all hover:scale-105 active:scale-95`}
              >
                <Heart className={`w-4 h-4 transition-colors ${answer.isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                <span className={`text-xs font-bold ${answer.isLiked ? "text-rose-600" : "text-slate-700"}`}>{answer._count?.likes || 0}</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="rounded-xl hover:bg-slate-100 gap-1.5 h-9 px-3 transition-all"
              >
                <Share2 className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-700">Share</span>
              </Button>
            </div>

            <Button 
              variant="ghost" 
              size="sm"
              className="rounded-xl hover:bg-rose-50 text-slate-300 hover:text-rose-400 h-9 w-9 p-0 transition-all opacity-0 group-hover:opacity-100"
            >
              <Flag className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
