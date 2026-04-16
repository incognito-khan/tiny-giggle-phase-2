"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Clock,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Heart,
  Star,
  DollarSign,
  User,
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
import { GET } from "@/lib/api";

const sidebarLinks = [
  { name: "Dashboard", href: "/babysitter-dashboard", icon: LayoutDashboard },
  {
    name: "My Bookings",
    href: "/babysitter-dashboard/bookings",
    icon: Calendar,
  },
  {
    name: "Availability",
    href: "/babysitter-dashboard/availability",
    icon: Clock,
  },
  { name: "Messages", href: "/chat", icon: MessageSquare },
  // { name: "My Earnings", href: "/babysitter-dashboard/earnings", icon: DollarSign },
  // { name: "Reviews", href: "/babysitter-dashboard/reviews", icon: Star },
  { name: "Community", href: "/community", icon: MessageCircle },
];

const secondaryLinks = [
  { name: "Settings", href: "/babysitter-dashboard/settings", icon: Settings },
];

export default function BabysitterSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const [profile, setProfile] = useState(null);

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
    GET("/babysitters/dashboard")
      .then(({ data }) => {
        if (data?.success) setProfile(data.data.profile);
      })
      .catch(() => {});
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    dispatch(logout({ router }));
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white/90 backdrop-blur-xl border-r border-purple-100 shadow-xl shadow-purple-500/5">
      {/* Logo Section */}
      <div className="p-6 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#70197a] rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200 rotate-3">
            <Heart className="text-white w-6 h-6 fill-current" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-[#70197a] to-purple-500 bg-clip-text text-transparent">
            TinyGiggle{" "}
            <span className="text-slate-400 font-medium">Sitter</span>
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-2">
          Sitter Menu
        </p>
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <div
                className={cn(
                  "group flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 cursor-pointer",
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
                  <span className="font-semibold text-sm transition-all">
                    {link.name}
                  </span>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="activeIndBabysitter"
                    className="w-1.5 h-1.5 rounded-full bg-purple-500"
                  />
                )}
              </div>
            </Link>
          );
        })}

        <div className="mt-8">
          <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-2">
            Account
          </p>
          {secondaryLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 cursor-pointer",
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
                  <span className="font-semibold text-sm">{link.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Profile Section */}
      <div className="p-4 mt-auto">
        <div className="p-4 rounded-3xl bg-purple-50/50 border border-purple-100 flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-white shadow-md">
            <AvatarImage src={profile?.profilePictureUrl} alt={profile?.name} />
            <AvatarFallback className="bg-purple-100 text-purple-700 font-bold">
              {profile?.name?.charAt(0) ?? "B"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            {profile ? (
              <>
                <p className="text-sm font-bold text-slate-800 truncate">
                  {profile.name}
                </p>
                <p className="text-xs text-amber-600 truncate font-medium">
                  {profile.city || "Babysitter"}
                </p>
              </>
            ) : (
              <div className="space-y-1">
                <div className="h-3 w-24 bg-slate-200 animate-pulse rounded" />
                <div className="h-2 w-16 bg-slate-100 animate-pulse rounded" />
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-rose-500 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
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
          className="rounded-full bg-white/90 backdrop-blur-md shadow-xl border-amber-100 text-amber-600"
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
            className="fixed inset-0 bg-amber-900/20 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
}
