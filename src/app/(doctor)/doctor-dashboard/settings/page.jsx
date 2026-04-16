"use client";

import React from "react";
import { User, Shield, CreditCard, Bell, Lock } from "lucide-react";
import { motion } from "framer-motion";

import PaymentSettings from "@/components/dashboard/payment-settings";
import DoctorProfileSettings from "@/components/dashboard/doctor-profile-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.jsx";

export default function DoctorSettingsPage() {
  return (
    <div className="space-y-8 pb-10 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <span className="p-1 px-3 bg-purple-100 text-purple-700 text-[10px] font-black uppercase rounded-lg tracking-widest w-fit">
          Account Control
        </span>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
          Dashboard <span className="text-purple-600">Settings</span>
        </h1>
        <p className="text-slate-500 font-semibold">Manage your professional profile, payments, and account security.</p>
      </motion.div>

      <Tabs defaultValue="profile" className="w-full">
        <div className="bg-white/50 backdrop-blur-md p-2 rounded-[2rem] border border-slate-100 mb-8 inline-block shadow-sm">
          <TabsList className="bg-transparent border-none gap-2">
            <TabsTrigger 
              value="profile" 
              className="rounded-2xl px-6 py-3 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-200 transition-all font-black text-xs uppercase tracking-widest gap-2"
            >
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger 
              value="payments" 
              className="rounded-2xl px-6 py-3 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-200 transition-all font-black text-xs uppercase tracking-widest gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="rounded-2xl px-6 py-3 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-200 transition-all font-black text-xs uppercase tracking-widest gap-2"
            >
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="payments" className="focus-visible:outline-none">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <PaymentSettings />
          </motion.div>
        </TabsContent>

        <TabsContent value="profile" className="focus-visible:outline-none">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <DoctorProfileSettings />
          </motion.div>
        </TabsContent>

        <TabsContent value="security" className="focus-visible:outline-none">
          <div className="bg-white p-12 rounded-[2.5rem] shadow-xl shadow-purple-500/5 text-center flex flex-col items-center gap-6">
             <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center">
                <Lock className="w-10 h-10 text-slate-400" />
             </div>
             <div>
               <h3 className="text-2xl font-black text-slate-800 tracking-tight">Account Security</h3>
               <p className="text-slate-500 font-medium">Coming soon in the next update.</p>
             </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
