"use client";

import React, { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CreditCard, 
  ShieldCheck, 
  AlertCircle,
  Loader2,
  ChevronRight,
  HandCoins
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

import { useSelector, useDispatch } from "react-redux";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Calendar } from "@/components/ui/calendar.jsx";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.jsx";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select.jsx";
import { POST } from "@/lib/api";
import TimeSlotPicker from "./time-slot-picker";
import { getChildren } from "@/store/slices/childSlice";

export default function BookingModal({ isOpen, onOpenChange, professional, type = "doctor" }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const children = useSelector((state) => state.child.children) || [];
  
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("");
  const [childId, setChildId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); 

  React.useEffect(() => {
    if (isOpen && children.length === 0 && user?.id) {
       dispatch(getChildren({ parentId: user.id }));
    }
  }, [isOpen, children.length, user?.id, dispatch]);

  const isTinyGiggle = (professional?.paymentCollectionMethod || professional?.paymentMethod) === "TINY_GIGGLE";
  const fee = type === "doctor" ? (professional?.consultationFee || 0) : (professional?.hourlyRate || 0);

  const handleBooking = async () => {
    if (!time) {
      toast.warn("Please select a time slot");
      return;
    }
    try {
      setLoading(true);
      const [hours, minutes] = time.split(":");
      const appointmentDate = new Date(date);
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const payload = {
        doctorId: type === "doctor" ? professional.id : null,
        babysitterId: type === "babysitter" ? professional.id : null,
        appointmentDate: appointmentDate.toISOString(),
        childId: type === "babysitter" && childId ? childId : null,
        notes
      };

      const { data } = await POST("/appointments", payload);

      if (data.success) {
        if (isTinyGiggle) {
          processPayment(data.data.id);
        } else {
          toast.success("Booking request sent successfully!");
          onOpenChange(false);
          router.push("/parent-dashboard/appointments");
        }
      }
    } catch (error) {
      toast.error("Failed to book appointment");
      setLoading(false);
    }
  };

  const processPayment = async (appointmentId) => {
    try {
      setStep(2); 
      const res = await fetch(`/api/v1/appointments/${appointmentId}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`
        }
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Missing checkout URL");
      }
    } catch (error) {
      toast.error("Failed to initialize payment.");
      onOpenChange(false);
      setLoading(false);
    } 
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-8 text-white relative">
           <DialogHeader>
            <DialogTitle className="text-2xl font-black mb-1">
              {type === 'doctor' ? 'Book Appointment' : 'Schedule Sitter'}
            </DialogTitle>
            <DialogDescription className="text-purple-100 font-medium">
              {type === 'doctor' 
                ? `Schedule your consultation with Dr. ${professional?.name}`
                : `Book your childcare session with ${professional?.name}`
              }
            </DialogDescription>
          </DialogHeader>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl text-xs-0" 
          />
        </div>

        <div className="p-8 space-y-6 bg-white overflow-y-auto max-h-[80vh]">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Date Selection */}
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">Select Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-100 justify-start font-bold text-slate-700 hover:bg-purple-50 hover:border-purple-200 transition-all">
                        <CalendarIcon className="mr-3 h-5 w-5 text-purple-500" />
                        {date ? format(date, "PPPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl">
                      <Calendar 
                        mode="single" 
                        selected={date} 
                        onSelect={(d) => { setDate(d); setTime(""); }} 
                        initialFocus 
                        disabled={(date) => date < new Date().setHours(0,0,0,0)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time Selection */}
                <TimeSlotPicker 
                  professionalId={professional?.id}
                  type={type}
                  date={date}
                  selectedTime={time}
                  onTimeSelect={setTime}
                />

                {/* Sitter Specific: Child Selection */}
                {type === "babysitter" && children.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">Who is this for?</Label>
                    <Select value={childId} onValueChange={setChildId}>
                      <SelectTrigger className="h-14 rounded-2xl border-slate-100 font-bold text-slate-700">
                         <SelectValue placeholder="Select a child" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        {children.map(child => {
                          const cid = child.id || child._id;
                          return (
                            <SelectItem key={cid} value={cid} className="font-bold">
                              {child.name || "My Child"}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Notes Selection */}
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">
                    {type === 'doctor' ? 'Symptoms / Reason' : 'Special Requirements / Notes'}
                  </Label>
                  <Input 
                    placeholder={type === 'doctor' ? "Briefly describe the symptoms..." : "Allergies, favorite toys, or bedtime routines..."}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="h-14 rounded-2xl border-slate-100 font-medium px-4 focus:ring-purple-500"
                  />
                </div>

                {/* Pricing Summary */}
                <div className="bg-slate-50 p-5 rounded-[2rem] flex items-center justify-between border border-slate-100">
                   <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">
                        {type === 'doctor' ? 'Consultation Fee' : 'Hourly Rate'}
                      </p>
                      <p className="text-2xl font-black text-slate-900 leading-none">
                        ${fee}
                        {type === 'babysitter' && <span className="text-sm text-slate-400 ml-1">/hr</span>}
                      </p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Payment via</p>
                      <div className="flex items-center gap-1.5 justify-end">
                         {isTinyGiggle ? (
                           <>
                             <ShieldCheck className="w-4 h-4 text-emerald-500" />
                             <span className="text-xs font-black text-emerald-600 uppercase tracking-tight">Tiny Giggle</span>
                           </>
                         ) : (
                           <>
                             <HandCoins className="w-4 h-4 text-indigo-500" />
                             <span className="text-xs font-black text-indigo-600 uppercase tracking-tight">Self Pay</span>
                           </>
                         )}
                      </div>
                   </div>
                </div>

                {isTinyGiggle && (
                  <div className="flex gap-3 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                    <AlertCircle className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] font-bold text-purple-700 leading-relaxed uppercase tracking-tight">
                      Secure payment is handled by Tiny Giggle to ensure your booking is protected.
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="w-20 h-20 bg-purple-100 rounded-[2rem] flex items-center justify-center animate-pulse">
                   <CreditCard className="w-10 h-10 text-purple-600" />
                </div>
                <div>
                   <h3 className="text-xl font-black text-slate-800 tracking-tight">Processing Securely</h3>
                   <p className="text-slate-500 font-medium mt-1">Please do not close this window...</p>
                </div>
                <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {step === 1 && (
          <DialogFooter className="p-8 pt-0 bg-white">
            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-2xl h-14 font-black shadow-lg shadow-purple-200 group active:scale-95 transition-all"
              disabled={loading || !time}
              onClick={handleBooking}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  {isTinyGiggle ? "Pay & Book Now" : "Confirm Booking"}
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
