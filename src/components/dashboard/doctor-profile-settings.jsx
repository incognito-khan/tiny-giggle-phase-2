"use client";

import React, { useState, useEffect } from "react";
import { 
  User, 
  BookOpen, 
  DollarSign, 
  Save, 
  Loader2,
  Sparkles,
  Camera,
  Heart
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile, setCredentials } from "@/store/slices/authSlice";
import { POST, GET } from "@/lib/api";

import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card.jsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.jsx";

export default function DoctorProfileSettings() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    consultationFee: ""
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
            consultationFee: user.consultationFee ?? ""
          });
        }

        // Step 2: Fetch fresh data from API
        const { data } = await GET("/doctors/dashboard");
        
        if (data.success && data.data?.profile) {
          const profile = data.data.profile;
          
          // Sync with Redux to update sidebar and other global components
          dispatch(setCredentials({ user: profile }));
          
          setFormData({
            name: profile.name || "",
            bio: profile.bio ?? "",
            consultationFee: profile.consultationFee ?? ""
          });
        }
      } catch (error) {
        console.error("Failed to fetch latest profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestProfile();
  }, [user?.id]); // Only re-run if the user changes (e.g. login/logout)

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return toast.error("File size must be less than 2MB");
    }

    try {
      setUploading(true);
      const data = new FormData();
      data.append("file", file);

      const { data: uploadRes } = await POST("/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (uploadRes?.success) {
        const imageUrl = uploadRes.data.url;
        await dispatch(updateProfile({ body: { profilePicture: imageUrl }, setLoading: setUploading })).unwrap();
      }
    } catch (err) {
      console.error("Profile upload failed", err);
      toast.error("Failed to update profile picture");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateProfile({ body: formData, setLoading })).unwrap();
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-none shadow-xl shadow-purple-500/5 rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-400/10 rounded-full -ml-10 -mb-10 blur-2xl" />
            
            <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
               {/* Avatar Upload */}
               <div className="relative group self-start">
                  <Avatar className="h-24 w-24 border-4 border-white/20 shadow-2xl transition-transform group-hover:scale-105 duration-300">
                    <AvatarImage src={user?.profilePicture} className="object-cover" />
                    <AvatarFallback className="bg-purple-100 text-purple-700 text-2xl font-black">
                      {user?.name?.charAt(0) || "D"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <button 
                    onClick={() => document.getElementById("profile-upload").click()}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 p-2 bg-white text-purple-600 rounded-xl shadow-lg hover:bg-purple-50 transition-colors disabled:opacity-50"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                  </button>
                  <input 
                    type="file" 
                    id="profile-upload" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                  />
               </div>

               <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                        <User className="w-5 h-5 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tight">Professional Profile</CardTitle>
                  </div>
                  <CardDescription className="text-purple-100 font-medium">
                    Customize how you appear to parents searching for pediatric care.
                  </CardDescription>
               </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">Display Name</Label>
                <div className="relative">
                   <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500" />
                   <Input 
                    placeholder="Dr. Your Name..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-14 rounded-2xl border-slate-100 pl-12 font-bold focus:ring-purple-500 bg-slate-50/50"
                   />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">Professional Bio</Label>
                <Textarea 
                  placeholder="Share your expertise, philosophy of care, and background..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="min-h-[150px] rounded-2xl border-slate-100 p-4 font-medium leading-relaxed focus:ring-purple-500 bg-slate-50/50"
                />
              </div>

              <div className="space-y-2 max-w-xs transition-all">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">Consultation Fee ($)</Label>
                <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                    <Input 
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                    className="h-14 rounded-2xl border-slate-100 pl-12 font-bold focus:ring-purple-500 bg-slate-50/50"
                    />
                </div>
                <p className="text-[10px] text-slate-400 font-medium pl-1 italic">
                  * This fee is for a single consultation session.
                </p>
              </div>

              <div className="pt-6 border-t border-slate-50 flex gap-4">
                <Button 
                  type="submit"
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl h-14 px-10 font-black shadow-lg shadow-purple-200 transition-all flex items-center gap-2 group"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                  Save Changes
                </Button>
                
                <Button 
                  type="button"
                  variant="outline"
                  className="rounded-2xl h-14 px-8 border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-all"
                >
                  Discard
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-none shadow-xl shadow-purple-500/5 rounded-[2.5rem] bg-gradient-to-br from-indigo-50 to-purple-50 p-8 border border-white">
           <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-purple-500" />
              <h4 className="font-black text-slate-800 tracking-tight">Trust Factor</h4>
           </div>
           <p className="text-sm font-medium text-slate-600 leading-relaxed mb-4">
             Doctors with a personalized profile picture and a detailed bio gain <span className="text-purple-600 font-bold">45% more trust</span> from new parents.
           </p>
           <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
             <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
             Helped 24+ parents this week
           </div>
        </Card>
        
        <div className="p-8 rounded-[2.5rem] bg-indigo-900 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-125 transition-transform duration-700" />
            <h4 className="font-black text-lg mb-2 relative z-10">Verification Status</h4>
            <div className="flex items-center gap-2 mb-4 relative z-10">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Active & Verified</span>
            </div>
            <p className="text-sm text-indigo-100 font-medium leading-relaxed relative z-10">
                Your medical credentials are verified. You can now accept direct payments and manage your clinic availability.
            </p>
            {user?.isPaid && user?.paidUntil && (
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
