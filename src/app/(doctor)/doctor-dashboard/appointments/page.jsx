"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  XCircle, 
  FileUp, 
  Loader2,
  Stethoscope,
  MoreVertical,
  MessageSquare,
  PlayCircle,
  StopCircle,
  FileText,
  Pill,
  ClipboardList,
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { GET, PATCH, POST } from "@/lib/api";
import { Button } from "@/components/ui/button.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { toast } from "react-toastify";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");
  
  // Modal states
  const [selectedApp, setSelectedApp] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportData, setReportData] = useState({
    diagnosis: "",
    prescription: "",
    extraNotes: "",
    reportUrl: ""
  });
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    fetchAppointments();
  }, []);

  const updateStatus = async (id, status, extraData = {}) => {
    try {
      const { data } = await PATCH(`/appointments/${id}/status`, { status, ...extraData });
      if (data.success) {
        toast.success(`Appointment ${status.toLowerCase()} successfully`);
        fetchAppointments();
        if (status === "COMPLETED") setIsReportModalOpen(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const isGracePeriodOver = (appTime) => {
    const appointmentTime = new Date(appTime);
    const gracePeriodMinutes = 1; // Temporarily reduced to 1 minute for testing
    const gracePeriodTime = new Date(appointmentTime.getTime() + gracePeriodMinutes * 60000);
    return new Date() > gracePeriodTime;
  };

  const filteredAppointments = appointments.filter(app => {
    if (filter === "ALL") return true;
    return app.status === filter;
  });

  const AppointmentCard = ({ app }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[2rem] p-6 shadow-xl shadow-purple-500/5 border border-slate-50 group transition-all"
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Patient Info */}
        <div className="flex gap-4 items-start flex-1 min-w-0">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 p-0.5 relative shrink-0">
             {app.parent?.profilePicture ? (
               <img src={app.parent.profilePicture} className="w-full h-full object-cover rounded-[0.9rem]" />
             ) : (
               <div className="w-full h-full flex items-center justify-center bg-purple-50">
                  <User className="w-8 h-8 text-purple-300" />
               </div>
             )}
          </div>
          <div className="min-w-0">
             <div className="flex items-center gap-2 mb-1">
               <h3 className="text-xl font-black text-slate-800 truncate">{app.parent?.name}</h3>
               <Badge className="bg-purple-100 text-purple-600 border-none text-[8px] font-black uppercase">Parent</Badge>
             </div>
             <p className="text-slate-500 font-medium text-sm truncate flex items-center gap-1.5">
               <Calendar className="w-3.5 h-3.5" />
               {format(new Date(app.appointmentDate), "PPP")} at {format(new Date(app.appointmentDate), "hh:mm a")}
             </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <Badge className={`h-8 px-4 rounded-xl border font-black uppercase text-[10px] tracking-widest ${
              app.status === "ACCEPTED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
              app.status === "PENDING" ? "bg-amber-50 text-amber-600 border-amber-100" :
              app.status === "COMPLETED" ? "bg-purple-50 text-purple-600 border-purple-100" :
              "bg-slate-50 text-slate-600 border-slate-100"
           }`}>
             {app.status}
           </Badge>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-50 flex flex-wrap items-center justify-between gap-4">
         <div className="flex items-center gap-6">
            <div>
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Consultation Fee</p>
               <p className="text-xl font-black text-slate-900">${app.consultationFee}</p>
            </div>
            <div>
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Payment Method</p>
               <p className="text-sm font-bold text-slate-700">{app.paymentMethod === "TINY_GIGGLE" ? "Tiny Giggle" : "Self Pay"}</p>
            </div>
         </div>

         <div className="flex items-center gap-2">
            {app.status === "PENDING" && (
              app.paymentMethod === "TINY_GIGGLE" ? (
                <div className="flex flex-col items-end">
                   <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 px-4 py-2 rounded-xl mb-1 font-bold text-[10px]">
                     TINY GIGGLE VERIFICATION
                   </Badge>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Waiting for automated payment verification</p>
                </div>
              ) : (
                <>
                  <Button 
                    onClick={() => updateStatus(app.id, "ACCEPTED")}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-purple-200"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Accept & Start
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => updateStatus(app.id, "REJECTED")}
                    className="border-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-xl h-11 px-6 font-bold"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </>
              )
            )}

            {app.status === "ACCEPTED" && (
              <>
                 <Button className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl h-11 px-6 font-bold">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat with Parent
                 </Button>
                 <Button 
                  onClick={() => {
                    setSelectedApp(app);
                    setIsReportModalOpen(true);
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11 px-6 font-bold shadow-lg"
                 >
                    <StopCircle className="w-4 h-4 mr-2" />
                    Complete & Share Report
                 </Button>
                 {isGracePeriodOver(app.appointmentDate) && (
                    <Button 
                      variant="outline"
                      onClick={() => updateStatus(app.id, "NOT_ATTENDED")}
                      className="border-rose-100 hover:bg-rose-50 hover:text-rose-600 rounded-xl h-11 px-6 font-bold text-xs"
                    >
                      <XCircle className="w-3 h-3 mr-2" />
                      Parent No Show
                    </Button>
                  )}
              </>
            )}

            {app.status === "COMPLETED" && (app.reportUrl || app.checkupReport || app.diagnosis) && (
              <Button variant="outline" className="rounded-xl border-slate-100 h-11 font-bold text-slate-500">
                 <FileText className="w-4 h-4 mr-2" />
                 View {app.diagnosis ? "Consultation" : "Report"}
              </Button>
            )}
         </div>
      </div>
    </motion.div>
  );

  return (
    <main className="min-h-screen w-full bg-[#F9FAFB] py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
             <div className="flex items-center gap-2 mb-1">
               <span className="p-1 px-3 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase rounded-lg tracking-widest">Medical Dashboard</span>
             </div>
             <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none">
               Patient <span className="text-purple-600 font-outline-2">Appointments</span>
             </h1>
          </div>
          
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
             {["PENDING", "ACCEPTED", "COMPLETED", "ALL"].map((s) => (
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
                 <div key={i} className="h-44 bg-slate-200/20 rounded-[2rem] animate-pulse border border-slate-100" />
               ))}
            </div>
          ) : filteredAppointments.length > 0 ? (
            filteredAppointments.map((app) => (
              <AppointmentCard key={app.id} app={app} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-200">
               <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
                  <Calendar className="w-8 h-8 text-slate-300" />
               </div>
               <h3 className="text-2xl font-black text-slate-800 tracking-tight">No {filter.toLowerCase()} appointments</h3>
               <p className="text-slate-500 font-medium mt-2">Check back later for new patient requests.</p>
            </div>
          )}
        </div>
      </div>

      {/* Report Upload Modal */}
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-slate-900 p-8 text-white relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -z-0 translate-x-1/2 -translate-y-1/2" />
             <DialogHeader>
                <DialogTitle className="text-3xl font-black tracking-tight">Consultation Report</DialogTitle>
                <DialogDescription className="text-slate-400 font-medium text-lg">
                   Summarize your session with {selectedApp?.parent?.name}
                </DialogDescription>
             </DialogHeader>
          </div>
          <div className="p-8 space-y-6 bg-white overflow-y-auto max-h-[60vh]">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <ClipboardList className="w-3 h-3 text-purple-500" /> Diagnosis
                    </Label>
                    <Textarea 
                        placeholder="What is the diagnosis?"
                        value={reportData.diagnosis}
                        onChange={(e) => setReportData({...reportData, diagnosis: e.target.value})}
                        className="rounded-2xl border-slate-100 font-bold min-h-[100px] focus:ring-purple-100"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Pill className="w-3 h-3 text-rose-500" /> Prescription
                    </Label>
                    <Textarea 
                        placeholder="Medicines or next steps..."
                        value={reportData.prescription}
                        onChange={(e) => setReportData({...reportData, prescription: e.target.value})}
                        className="rounded-2xl border-slate-100 font-bold min-h-[100px] focus:ring-rose-100"
                    />
                </div>
             </div>

             <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <FileText className="w-3 h-3 text-blue-500" /> Additional Notes
                </Label>
                <Textarea 
                    placeholder="General advice, follow-up instructions..."
                    value={reportData.extraNotes}
                    onChange={(e) => setReportData({...reportData, extraNotes: e.target.value})}
                    className="rounded-2xl border-slate-100 font-bold min-h-[120px]"
                />
             </div>

             <div className="pt-4 border-t border-slate-50 space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">External Report URL (Optional)</Label>
                <div className="relative">
                   <FileUp className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <Input 
                    placeholder="Link to file or cloud document..."
                    value={reportData.reportUrl}
                    onChange={(e) => setReportData({...reportData, reportUrl: e.target.value})}
                    className="h-12 rounded-2xl border-slate-100 pl-10 font-bold"
                   />
                </div>
             </div>
          </div>
          <DialogFooter className="p-8 pt-4 bg-white border-t border-slate-50">
             <Button 
              onClick={() => updateStatus(selectedApp.id, "COMPLETED", reportData)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-2xl h-14 font-black shadow-lg shadow-purple-200 transition-all active:scale-[0.98]"
              disabled={!reportData.diagnosis && !reportData.prescription && !reportData.extraNotes && !reportData.reportUrl}
             >
                {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Complete Session & Notify Parent"}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
