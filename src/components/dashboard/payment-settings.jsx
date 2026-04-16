"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  CreditCard, 
  Wallet, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  Building2,
  DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import axios from "axios";
import { PATCH } from "@/lib/api";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card.jsx";
import { Label } from "@/components/ui/label.jsx";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.jsx";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select.jsx";
import { Button } from "@/components/ui/button.jsx";
import { setCredentials } from "@/store/slices/authSlice";

export default function PaymentSettings() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  
  const [method, setMethod] = useState(user?.paymentCollectionMethod || "SELF");
  const [frequency, setFrequency] = useState(user?.withdrawalFrequency || "WEEKLY");

  useEffect(() => {
    if (user?.paymentCollectionMethod) setMethod(user.paymentCollectionMethod);
    if (user?.withdrawalFrequency) setFrequency(user.withdrawalFrequency);
  }, [user]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const payload = {
        paymentCollectionMethod: method,
        withdrawalFrequency: method === "TINY_GIGGLE" ? frequency : null
      };

      const { data } = await PATCH("/auth/update-profile", payload);
      
      if (data.success) {
        toast.success("Payment settings updated successfully!");
        dispatch(setCredentials({ user: data.data })); // Correct action and payload
      } else {
        toast.error(data.message || "Failed to update settings");
      }
    } catch (error) {
      console.error("Update settings error:", error);
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="border-none shadow-xl shadow-purple-500/5 bg-white overflow-hidden rounded-[2.5rem]">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-black tracking-tight mb-2">Payment Collection Preferences</h2>
            <p className="text-purple-100 font-medium">Choose how you want to receive payments from parents.</p>
          </div>
          <Building2 className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 rotate-12" />
        </div>

        <CardContent className="p-8 space-y-8">
          {/* Collection Method Selection */}
          <div className="space-y-4">
            <Label className="text-sm font-black uppercase tracking-widest text-slate-400">Choose Method</Label>
            <RadioGroup 
              value={method} 
              onValueChange={setMethod}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Self Collection Option */}
              <div>
                <RadioGroupItem value="SELF" id="self" className="peer sr-only" />
                <Label
                  htmlFor="self"
                  className="flex flex-col items-center justify-between rounded-3xl border-2 border-slate-100 bg-white p-6 hover:bg-slate-50 peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:bg-purple-50/50 transition-all cursor-pointer group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 group-peer-data-[state=checked]:bg-white transition-colors">
                    <Wallet className="w-7 h-7 text-slate-600 group-peer-data-[state=checked]:text-purple-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black text-slate-800">Self Collection</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Collect directly from parents at service time.</p>
                  </div>
                </Label>
              </div>

              {/* Tiny Giggle Option */}
              <div>
                <RadioGroupItem value="TINY_GIGGLE" id="tinygiggle" className="peer sr-only" />
                <Label
                  htmlFor="tinygiggle"
                  className="flex flex-col items-center justify-between rounded-3xl border-2 border-slate-100 bg-white p-6 hover:bg-slate-50 peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:bg-purple-50/50 transition-all cursor-pointer group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 group-peer-data-[state=checked]:bg-white transition-colors">
                    <ShieldCheck className="w-7 h-7 text-slate-600 group-peer-data-[state=checked]:text-purple-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black text-slate-800">Tiny Giggle Secure</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Automated payments via our platform with protection.</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Withdrawal Frequency (Only if Tiny Giggle is selected) */}
          <AnimatePresence>
            {method === "TINY_GIGGLE" && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                className="space-y-4 pt-4 border-t border-slate-50 overflow-hidden"
              >
                <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100 border-dashed flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-600">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 leading-tight">Withdrawal Schedule</p>
                      <p className="text-xs text-slate-500 font-medium">How often should we send funds to your account?</p>
                    </div>
                  </div>

                  <div className="w-full md:w-64">
                    <Select value={frequency} onValueChange={setFrequency}>
                      <SelectTrigger className="rounded-2xl border-slate-200 bg-white h-12 font-bold focus:ring-purple-500">
                        <SelectValue placeholder="Select Frequency" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-100">
                        <SelectItem value="WEEKLY" className="rounded-lg font-medium">Every Week</SelectItem>
                        <SelectItem value="FIFTEEN_DAYS" className="rounded-lg font-medium">Every 15 Days</SelectItem>
                        <SelectItem value="MONTHLY" className="rounded-lg font-medium">Monthly Basis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info Banner */}
          <div className="bg-slate-50 p-4 rounded-2xl flex gap-3 items-start">
             <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
             <p className="text-xs text-slate-500 font-medium leading-relaxed">
               By selecting Tiny Giggle Secure, you agree to our 10% platform fee which covers insurance and secure payment processing. 
               Funds will be automatically deposited based on your chosen schedule.
             </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl px-10 h-14 font-black text-lg shadow-xl shadow-purple-200 group transition-all"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Save Preferences
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Help Card */}
      <Card className="border-none bg-indigo-600/5 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="flex items-center gap-6">
            <div className="bg-white p-4 rounded-3xl shadow-sm">
               <DollarSign className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-800 tracking-tight">Need help with payments?</p>
              <p className="text-slate-500 font-medium">Our support team is available 24/7 to help with any billing queries.</p>
            </div>
          </div>
          <Button variant="outline" className="rounded-2xl border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold px-8 h-12">
            Contact Support
          </Button>
      </Card>
    </div>
  );
}
