"use client";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginAdmin } from "@/store/slices/authSlice";
import { loginSchema } from "@/lib/schemas/login";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AdminLoginPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const body = {
        email: data.email,
        password: data.password,
        browser: typeof window !== "undefined" ? window.navigator.userAgent : "Unknown",
        os: typeof window !== "undefined" ? window.navigator.platform : "Unknown",
        time: new Date().toISOString(),
      };
      
      await dispatch(loginAdmin({ body, router, setLoading }));
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#0A0A0B]">
      {/* Premium Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-50 contrast-150" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="bg-[#161618]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8 text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20"
            >
              <ShieldCheck className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Admin Portal</h1>
            <p className="text-gray-400 mt-2 text-sm">Secure access for Tiny Giggle administrators</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-300 ml-1">Email Address</Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="admin@tinygiggle.com"
                  className="pl-11 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all rounded-xl h-12"
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-red-500 ml-1 mt-1"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-300 ml-1">Password</Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4.5 w-4.5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-11 pr-11 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all rounded-xl h-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-red-500 ml-1 mt-1"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between py-1">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded border-white/10 bg-white/5 text-blue-500 focus:ring-offset-0 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="remember" className="text-xs text-gray-400 cursor-pointer hover:text-gray-300 transition-colors">
                  Remember session
                </label>
              </div>
              <button type="button" className="text-xs font-medium text-blue-500 hover:text-blue-400 transition-colors">
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-white" />
              ) : (
                <span className="flex items-center justify-center">
                  Login to Dashboard
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-gray-500">
              Authorized access only. All login attempts are logged for security purposes.
            </p>
          </div>
        </div>
        
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Tiny Giggle. All rights reserved.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
