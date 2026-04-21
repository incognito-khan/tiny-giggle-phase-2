"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ChevronRight, 
  Search, 
  Filter,
  CheckCircle2,
  Clock3,
  XCircle,
  MessageCircle,
  Loader2,
  Pill,
  ClipboardList,
  AlertCircle,
  Stethoscope,
  User,
  CreditCard,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { GET, POST, PATCH } from "@/lib/api";
import { Button } from "@/components/ui/button.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.jsx";

export default function ParentAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [chatLoading, setChatLoading] = useState(null);
  const [viewingReport, setViewingReport] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data } = await GET("/appointments");
      if (data.success) {
        setAppointments(data.data);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      const { data } = await PATCH(`/appointments/${appointmentId}/status`, { status });
      if (data.success) {
        fetchAppointments();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const isGracePeriodOver = (appTime) => {
    const appointmentTime = new Date(appTime);
    const gracePeriodMinutes = 1; // Temporarily reduced to 1 minute for testing
    const gracePeriodTime = new Date(appointmentTime.getTime() + gracePeriodMinutes * 60000);
    return new Date() > gracePeriodTime;
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleChatClick = async (app) => {
    setChatLoading(app.id);
    try {
      // Try to find existing chat with the doctor/babysitter
      const doctorOrSitterId = app.doctorId || app.babysitterId;
      const userType = app.doctorId ? "doctor" : "babysitter";

      if (!doctorOrSitterId) {
        console.error("No doctor or babysitter ID found");
        setChatLoading(null);
        return;
      }

      const professionalName = app.doctor ? `Dr. ${app.doctor.name}` : app.babysitter?.name;

      // Use POST from @/lib/api so the JWT token is attached automatically
      const { data } = await POST("/parents/chats", {
        doctorOrSitterId: doctorOrSitterId,
        professionalType: userType,
        title: `Chat with ${professionalName}`,
      });

      if (data?.success) {
        const chatId = data.data?.id || data.data?._id;
        if (chatId) {
          router.push(`/chat?chatId=${chatId}`);
        } else {
          console.error("No chat ID in response:", data);
        }
      } else {
        console.error("Failed to create/get chat:", data?.message);
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setChatLoading(null);
    }
  };

  const filteredAppointments = appointments.filter(app => {
    if (filter === "ALL") return true;
    return app.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "ACCEPTED": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "PENDING": return "bg-amber-50 text-amber-600 border-amber-100";
      case "REJECTED": return "bg-rose-50 text-rose-600 border-rose-100";
      case "COMPLETED": return "bg-purple-50 text-purple-600 border-purple-100";
      case "NOT_ATTENDED": return "bg-slate-50 text-slate-400 border-slate-100";
      case "REFUNDED": return "bg-rose-50 text-rose-500 border-rose-100";
      default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  const AppointmentCard = ({ app }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 shadow-xl shadow-purple-500/5 border border-slate-50 group hover:shadow-purple-500/10 transition-all flex flex-col md:flex-row gap-6"
    >
      {/* Date & Time Section */}
      <div className="md:w-32 flex flex-col items-center justify-center bg-slate-50 rounded-2xl p-4 shrink-0">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">
            {format(new Date(app.appointmentDate), "MMM")}
          </p>
          <p className="text-3xl font-black text-slate-900 leading-none mb-1">
            {format(new Date(app.appointmentDate), "dd")}
          </p>
          <div className="flex items-center gap-1 text-[10px] font-bold text-purple-600">
             <Clock className="w-3 h-3" />
             {format(new Date(app.appointmentDate), "hh:mm a")}
          </div>
      </div>

      {/* Info Section */}
      <div className="flex-1 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 p-0.5 overflow-hidden">
               {app.doctor?.profilePicture || app.babysitter?.profilePictureUrl ? (
                 <img 
                  src={app.doctor?.profilePicture || app.babysitter?.profilePictureUrl} 
                  className="w-full h-full object-cover rounded-[0.9rem]" 
                  alt="Profile"
                 />
               ) : (
                 <div className="w-full h-full flex items-center justify-center">
                    {app.doctor ? (
                      <Stethoscope className="w-6 h-6 text-purple-400" />
                    ) : (
                      <User className="w-6 h-6 text-purple-400" />
                    )}
                 </div>
               )}
            </div>
            <div>
               <h3 className="text-xl font-black text-slate-800 leading-tight">
                 {app.doctor ? `Dr. ${app.doctor.name}` : app.babysitter?.name}
               </h3>
               <p className="text-purple-600 font-bold text-xs">
                 {app.doctor?.specialty || "Professional Sitter"}
               </p>
            </div>
          </div>
          <Badge className={`h-8 px-4 rounded-xl border font-black uppercase text-[10px] tracking-widest ${getStatusColor(app.status)}`}>
            {app.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 pt-2">
           <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Fee Status</p>
               <div className="flex items-center gap-2">
                  {app.paymentStatus === "COMPLETED" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : app.paymentStatus === "REFUNDED" ? (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Clock3 className="w-4 h-4 text-amber-500" />
                  )}
                  <span className={`text-sm font-bold ${app.paymentStatus === "REFUNDED" ? "text-rose-500" : "text-slate-700"}`}>
                    {app.paymentStatus === "COMPLETED" ? "Paid" : app.paymentStatus === "REFUNDED" ? "Refunded" : "Pending"}
                  </span>
               </div>
           </div>
           <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Method</p>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                 <CreditCard className="w-4 h-4 text-purple-500" />
                 {app.paymentMethod === "TINY_GIGGLE" ? "Platform" : "Direct Pay"}
              </div>
           </div>
           {app.babysitterId && app.child && (
             <div className="space-y-1">
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Child</p>
               <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                 <User className="w-4 h-4 text-indigo-500" />
                 {app.child.name || "My Child"}
               </div>
             </div>
           )}
        </div>
      </div>

      {/* Action Section */}
      <div className="flex flex-col justify-center gap-2 md:border-l md:border-slate-50 md:pl-6 shrink-0">
         {app.status === "COMPLETED" && (app.reportUrl || app.checkupReport || app.diagnosis) && (
           <Button 
             onClick={() => setViewingReport(app)}
             className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl h-12 px-6 font-bold shadow-lg"
            >
             <FileText className="w-4 h-4 mr-2" />
             View {app.diagnosis ? "Consultation" : "Report"}
           </Button>
         )}
         {app.status === "ACCEPTED" && (
           <Button 
             onClick={() => handleChatClick(app)}
             disabled={chatLoading === app.id}
             className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-2xl h-12 px-6 font-bold shadow-lg flex items-center justify-center gap-2"
           >
             {chatLoading === app.id ? (
               <Loader2 className="w-4 h-4 animate-spin" />
             ) : (
               <MessageCircle className="w-4 h-4" />
             )}
             {chatLoading === app.id ? "Opening..." : "Go to Chat"}
           </Button>
         )}
         {app.status === "ACCEPTED" && isGracePeriodOver(app.appointmentDate) && (
           <Button 
             variant="outline" 
             onClick={() => handleUpdateStatus(app.id, "NOT_ATTENDED")}
             className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 rounded-2xl h-12 px-6 font-bold"
           >
             <XCircle className="w-4 h-4 mr-2" />
             Prof. No Show
           </Button>
         )}
         {app.status === "PENDING" && app.paymentMethod === "TINY_GIGGLE" && app.paymentStatus === "PENDING" && (
           <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-12 px-6 font-bold shadow-lg">
             Pay Now
           </Button>
         )}
         <Button variant="ghost" className="w-full rounded-2xl h-12 px-6 font-bold text-slate-400 hover:text-rose-500">
           Details
         </Button>
      </div>
    </motion.div>
  );

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
             <Badge className="bg-purple-100 text-purple-700 text-[10px] font-black uppercase rounded-lg border-none tracking-widest">Management</Badge>
             <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none">
               My <span className="text-purple-600 font-outline-2">Appointments</span>
             </h1>
          </div>
          
          <div className="flex items-center gap-2 bg-white/80 p-1.5 rounded-2xl border border-slate-100 shadow-sm">
             {["ALL", "PENDING", "ACCEPTED", "COMPLETED"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === s 
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-200" 
                      : "text-slate-400 hover:text-purple-600 hover:bg-purple-50"
                  }`}
                >
                  {s}
                </button>
             ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-44 bg-slate-100/50 rounded-3xl animate-pulse border border-slate-100" />
              ))}
            </div>
          ) : filteredAppointments.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {filteredAppointments.map((app) => (
                <AppointmentCard key={app.id} app={app} />
              ))}
            </AnimatePresence>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 bg-white/50 rounded-[3rem] border border-dashed border-slate-200">
               <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6">
                  <Calendar className="w-10 h-10 text-slate-300" />
               </div>
               <h3 className="text-2xl font-black text-slate-800 tracking-tight text-center">No appointments found</h3>
               <p className="text-slate-500 font-medium mt-2">Change your filters or book a new professional.</p>
            </div>
          )}
        </div>
      </div>

      {/* View Report Dialog */}
      <Dialog open={!!viewingReport} onOpenChange={(open) => !open && setViewingReport(null)}>
        <DialogContent className="sm:max-w-[550px] bg-white rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-slate-900 p-8 text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -z-0 translate-x-1/2 -translate-y-1/2" />
            <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <Stethoscope className="w-6 h-6 text-purple-400" />
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-300 border-none px-3 py-1 font-bold text-[10px] tracking-widest uppercase">Medical Report</Badge>
                </div>
                <DialogTitle className="text-3xl font-black text-white tracking-tight leading-tight">
                Consultation Summary
                </DialogTitle>
                <DialogDescription className="text-slate-400 font-medium text-base">
                Provided by {viewingReport?.doctor ? `Dr. ${viewingReport.doctor.name}` : viewingReport?.babysitter?.name} on {viewingReport && format(new Date(viewingReport.updatedAt), "PPP")}
                </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-8 space-y-8 bg-white overflow-y-auto max-h-[70vh]">
            {viewingReport?.diagnosis && (
                <section className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-900">
                        <ClipboardList className="w-5 h-5 text-purple-600" />
                        <h4 className="font-black uppercase tracking-widest text-xs">Diagnosis</h4>
                    </div>
                    <div className="bg-purple-50/50 rounded-2xl p-5 border border-purple-100/50 shadow-inner">
                        <p className="text-slate-700 leading-relaxed font-bold whitespace-pre-wrap text-lg italic">
                            "{viewingReport.diagnosis}"
                        </p>
                    </div>
                </section>
            )}

            {viewingReport?.prescription && (
                <section className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-900">
                        <Pill className="w-5 h-5 text-rose-500" />
                        <h4 className="font-black uppercase tracking-widest text-xs">Prescription & Next Steps</h4>
                    </div>
                    <div className="bg-rose-50/30 rounded-2xl p-5 border border-rose-100/50">
                        <p className="text-slate-800 leading-relaxed font-bold whitespace-pre-wrap">
                            {viewingReport.prescription}
                        </p>
                    </div>
                </section>
            )}

            {viewingReport?.extraNotes && (
                <section className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-900">
                        <AlertCircle className="w-5 h-5 text-blue-500" />
                        <h4 className="font-black uppercase tracking-widest text-xs">Professional Advice</h4>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                        <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                            {viewingReport.extraNotes}
                        </p>
                    </div>
                </section>
            )}

            {viewingReport?.checkupReport && !viewingReport?.diagnosis && (
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-slate-900">
                    <FileText className="w-5 h-5 text-slate-500" />
                    <h4 className="font-black uppercase tracking-widest text-xs">Checkup Notes</h4>
                </div>
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <p className="text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                        {viewingReport.checkupReport}
                    </p>
                </div>
              </section>
            )}

            {viewingReport?.reportUrl && (
                <div className="pt-6 border-t border-slate-50 flex flex-col items-center justify-center py-4 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                    <FileText className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-slate-400 font-bold text-xs uppercase mb-4 tracking-widest leading-none">External Medical Document</p>
                    <Button 
                        asChild
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl px-8 h-12 shadow-lg shadow-slate-200"
                    >
                        <a href={viewingReport.reportUrl} target="_blank" rel="noopener noreferrer">
                            Download Document
                        </a>
                    </Button>
                </div>
            )}

            {!viewingReport?.diagnosis && !viewingReport?.prescription && !viewingReport?.extraNotes && !viewingReport?.checkupReport && !viewingReport?.reportUrl && (
                <p className="text-slate-400 italic text-center py-10 font-bold">No report details shared for this appointment.</p>
            )}
          </div>

          <div className="p-8 pt-4 bg-white border-t border-slate-50">
            <Button
              onClick={() => setViewingReport(null)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-2xl h-14 font-black shadow-lg shadow-purple-200 transition-all active:scale-[0.98]"
            >
              Done Reading
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
