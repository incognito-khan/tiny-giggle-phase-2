"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Trash2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Post?",
  description = "Are you sure you want to delete this? This action cannot be undone.",
  loading = false,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-none p-0 bg-transparent shadow-none">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
            >
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 opacity-60" />
              
              <div className="flex flex-col items-center text-center space-y-6">
                {/* Icon Circle */}
                <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center relative group">
                  <div className="absolute inset-0 bg-rose-100 rounded-[2rem] scale-0 group-hover:scale-100 transition-transform duration-500 opacity-50" />
                  <Trash2 className="w-10 h-10 text-rose-500 relative z-10 transition-transform group-hover:rotate-12" />
                </div>

                <div className="space-y-2">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-slate-800 text-center tracking-tight">
                      {title}
                    </DialogTitle>
                  </DialogHeader>
                  <DialogDescription className="text-slate-500 font-medium text-lg leading-relaxed">
                    {description}
                  </DialogDescription>
                </div>

                <DialogFooter className="w-full flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    variant="ghost"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 h-14 rounded-2xl font-black text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={onConfirm}
                    disabled={loading}
                    className="flex-1 h-14 rounded-2xl bg-rose-500 hover:bg-rose-600 shadow-xl shadow-rose-200 text-white font-black transition-all group"
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                        Delete Forever
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
