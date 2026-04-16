"use client";

import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { 
  Plus, 
  MessageSquarePlus, 
  HelpCircle,
  Sparkles,
  Loader2
} from "lucide-react";
import { POST } from "@/lib/api";
import { toast } from "react-toastify";

export default function AskQuestionModal({ isOpen, setIsOpen, onQuestionPosted }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const { data } = await POST("/community/questions", formData);
      if (data.success) {
        toast.success("Question posted successfully!");
        setFormData({ title: "", content: "" });
        setIsOpen(false);
        if (onQuestionPosted) onQuestionPosted(data.data);
      }
    } catch (error) {
      console.error("Post question error:", error);
      toast.error(error.response?.data?.message || "Failed to post question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] border-none shadow-2xl rounded-[2.5rem] bg-white p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-8 text-white relative overflow-hidden">
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <MessageSquarePlus className="w-8 h-8" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight text-white mb-1">
                Ask the Community
              </DialogTitle>
              <DialogDescription className="text-purple-100 font-medium">
                Reach out to experts, parents, and babysitters for help.
              </DialogDescription>
            </div>
          </div>
          <Sparkles className="absolute right-[-20px] top-[-20px] w-40 h-40 opacity-10 rotate-12" />
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">
                Question Title
              </Label>
              <Input
                placeholder="e.g., How do I manage sleep schedules for twins?"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold focus:ring-purple-500 transition-all text-slate-800"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">
                Detailed Content
              </Label>
              <Textarea
                placeholder="Provide more context so the community can give better answers..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="min-h-[150px] rounded-2xl border-slate-100 bg-slate-50 font-medium focus:ring-purple-500 transition-all text-slate-800 p-4 resize-none"
              />
            </div>
          </div>

          <div className="bg-indigo-50/50 p-4 rounded-2xl flex gap-3">
             <HelpCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
             <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
               <span className="font-bold text-indigo-600 uppercase mr-1">Pro-Tip:</span> 
               Be specific and clear. Doctors and experts are more likely to answer well-structured questions!
             </p>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="rounded-2xl h-14 font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl px-10 h-14 font-black text-lg shadow-xl shadow-purple-200 transition-all group"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Post Question
                  <Sparkles className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
