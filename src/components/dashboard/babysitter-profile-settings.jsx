"use client";

import React, { useState, useEffect } from "react";
import { 
  User, 
  Clock, 
  DollarSign, 
  Save, 
  Loader2,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile, setCredentials } from "@/store/slices/authSlice";
import { GET } from "@/lib/api";

import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card.jsx";

export default function BabysitterProfileSettings() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    experience: "",
    hourlyRate: ""
  });

  // Initialize and sync profile data
  useEffect(() => {
    const fetchLatestProfile = async () => {
      try {
        setLoading(true);
        // Step 1: Initialize with Redux data if available
        if (user) {
          setFormData({
            name: user.name || "",
            bio: user.bio ?? "",
            experience: user.experience ?? "",
            hourlyRate: user.hourlyRate ?? ""
          });
        }

        // Step 2: Fetch fresh data from API
        const { data } = await GET("/babysitters/dashboard");
        
        if (data.success && data.data?.profile) {
          const profile = data.data.profile;
          
          // Sync with Redux to update sidebar and other global components
          dispatch(setCredentials({ user: profile }));
          
          setFormData({
            name: profile.name || "",
            bio: profile.bio ?? "",
            experience: profile.experience ?? "",
            hourlyRate: profile.hourlyRate ?? ""
          });
        }
      } catch (error) {
        console.error("Failed to fetch latest profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestProfile();
  }, [user?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(updateProfile({ body: formData, setLoading }));
      
      if (result.payload) {
        // Redux state automatically updated via authSlice.extraReducers
      }
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-none shadow-xl shadow-purple-500/5 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-purple-600 to-indigo-700 p-8 text-white">
            <div className="flex items-center gap-4 mb-2">
               <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                  <User className="w-6 h-6 text-white" />
               </div>
               <CardTitle className="text-2xl font-black">Professional Profile</CardTitle>
            </div>
            <CardDescription className="text-purple-100 font-medium">
              This information will be visible to parents on the discovery page.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">Name</Label>
                <div className="relative">
                   <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500" />
                   <Input 
                    placeholder="Your professional name..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-14 rounded-2xl border-slate-100 pl-12 font-bold focus:ring-purple-500"
                   />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">Bio / About You</Label>
                <Textarea 
                  placeholder="Tell parents about your experience, style, and why they should choose you..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="min-h-[150px] rounded-2xl border-slate-100 p-4 font-medium leading-relaxed focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">Years of Experience</Label>
                    <div className="relative">
                       <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500" />
                       <Input 
                        type="number"
                        placeholder="e.g. 5"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        className="h-14 rounded-2xl border-slate-100 pl-12 font-bold focus:ring-purple-500"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">Hourly Rate ($)</Label>
                    <div className="relative">
                       <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                       <Input 
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.hourlyRate}
                        onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                        className="h-14 rounded-2xl border-slate-100 pl-12 font-bold focus:ring-purple-500"
                       />
                    </div>
                 </div>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white rounded-2xl h-14 px-10 font-black shadow-lg shadow-purple-200 transition-all flex items-center gap-2 group"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-none shadow-xl shadow-teal-500/5 rounded-[2.5rem] bg-gradient-to-br from-teal-50 to-emerald-50 p-8">
           <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-teal-500" />
              <h4 className="font-black text-slate-800 tracking-tight">Pro Tip</h4>
           </div>
           <p className="text-sm font-medium text-slate-600 leading-relaxed">
             Profiles with clear bios and competitive hourly rates receive <span className="text-teal-600 font-bold">3x more bookings</span>. Make sure to highlight any specialized certifications like CPR or First Aid!
           </p>
        </Card>

        <div className="p-8 rounded-[2.5rem] bg-indigo-900 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-125 transition-transform duration-700" />
            <h4 className="font-black text-lg mb-2 relative z-10">Verification Status</h4>
            <div className="flex items-center gap-2 mb-4 relative z-10">
                <div className={`w-2 h-2 rounded-full ${user?.isVerified ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                <span className={`text-xs font-bold uppercase tracking-widest ${user?.isVerified ? "text-emerald-400" : "text-amber-400"}`}>
                  {user?.isVerified ? "Verified Account" : "Pending Verification"}
                </span>
            </div>
            <p className="text-sm text-indigo-100 font-medium leading-relaxed relative z-10">
                {user?.isVerified 
                  ? "Your account is verified and fully visible to parents. You can now accept bookings and manage your schedule." 
                  : "Your account is currently being reviewed by our team. You will be notified once verification is complete."}
            </p>

            {user?.role === 'babysitter' && user?.isPaid && user?.paidUntil && (
                <div className="mt-4 pt-4 border-t border-white/10 relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-1">Membership Expires</p>
                    <p className="text-sm font-bold text-white">
                        {new Date(user.paidUntil).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
