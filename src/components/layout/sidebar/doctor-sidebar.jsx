"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  PlusCircle,
  Activity,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button.jsx";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.jsx";
import { cn } from "@/lib/utils";
import { useDispatch } from "react-redux";
import { logout } from "@/store/slices/authSlice";

const sidebarLinks = [
  { name: "Dashboard", href: "/doctor-dashboard", icon: LayoutDashboard },
  { name: "Patients", href: "/doctor-dashboard/patients", icon: Users },
  {
    name: "Appointments",
    href: "/doctor-dashboard/appointments",
    icon: Calendar,
  },
  // { name: "Medical Records", href: "/doctor-dashboard/records", icon: FileText },
  { name: "Messages", href: "/chat", icon: MessageSquare },
  // { name: "Health Analytics", href: "/doctor-dashboard/analytics", icon: Activity },
  {
    name: "Community",
    href: "/doctor-dashboard/community",
    icon: MessageCircle,
  },
];

const secondaryLinks = [
  { name: "Settings", href: "/doctor-dashboard/settings", icon: Settings },
];

import { GET } from "@/lib/api";

export default function DoctorSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) setIsOpen(false);
      else setIsOpen(true);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: response } = await GET("/doctors/dashboard");
      if (response.success) {
        setProfile(response.data.profile);
      }
    } catch (error) {
      console.error("Error fetching doctor profile in sidebar:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    dispatch(logout({ router }));
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-xl border-r border-slate-200">
      {/* Logo Section */}
      <div className="p-6 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#70197a] rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
            <PlusCircle className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-[#70197a] to-purple-500 bg-clip-text text-transparent">
            TinyGiggle <span className="text-slate-400 font-medium">Care</span>
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Main Menu
        </p>
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <div
                className={cn(
                  "group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-purple-50 text-purple-700 shadow-sm shadow-purple-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-purple-600",
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-5 h-5",
                      isActive
                        ? "text-purple-600"
                        : "text-slate-400 group-hover:text-purple-500",
                    )}
                  />
                  <span className="font-medium text-sm">{link.name}</span>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="activeInd"
                    className="w-1.5 h-1.5 rounded-full bg-purple-600"
                  />
                )}
              </div>
            </Link>
          );
        })}

        <div className="mt-8">
          <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Preferences
          </p>
          {secondaryLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer",
                    isActive
                      ? "bg-purple-50 text-purple-700 shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-purple-600",
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5",
                      isActive ? "text-purple-600" : "text-slate-400",
                    )}
                  />
                  <span className="font-medium text-sm">{link.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Profile Section */}
      <div className="p-4 mt-auto">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
          {loading ? (
            <>
              <div className="h-10 w-10 bg-slate-200 animate-pulse rounded-full" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-20 bg-slate-200 animate-pulse rounded" />
                <div className="h-2 w-12 bg-slate-200 animate-pulse rounded" />
              </div>
            </>
          ) : (
            <>
              <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                <AvatarImage src={profile?.profilePicture} />
                <AvatarFallback className="bg-purple-100 text-purple-600 font-bold">
                  {profile?.name?.charAt(0) || "D"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  Dr. {profile?.name || "User"}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {profile?.specialty || "Specialist"}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-rose-500 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="rounded-full bg-white/80 backdrop-blur-md shadow-lg border-slate-200"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar for Desktop */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full z-40 transition-all duration-300 ease-in-out",
          isOpen ? "w-72 translate-x-0" : "w-0 -translate-x-full",
        )}
      >
        <SidebarContent />
      </aside>

      {/* Overlay for Mobile */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
}
