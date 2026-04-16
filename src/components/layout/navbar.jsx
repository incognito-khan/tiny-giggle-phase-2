"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Phone,
  Clock,
  Search,
  Menu,
  Facebook,
  Linkedin,
  Youtube,
  Instagram,
} from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import Link from "next/link";


export default function Navbar() {
  const user = useSelector((state) => state.auth.user);
  const isUserLoggedIn = useSelector((state) => state.auth.isUserLoggedIn);
  const childId = useSelector((state) => state.child.childId);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const dispatch = useDispatch();

  const [activeItem, setActiveItem] = useState("HOME");
  const [hovered, setHovered] = useState("HOME");

  const navItems = useMemo(() => isUserLoggedIn
    ? [
        "HOME",
        "ABOUT",
        "FOR PROFESSIONALS",
        "DOWNLOAD",
        "CONTACT",
        "DASHBOARD",
        "PRIVACY POLICY",
      ]
    : [
        "HOME",
        "ABOUT",
        "FOR PROFESSIONALS",
        "DOWNLOAD",
        "CONTACT",
        "PRIVACY POLICY",
      ], [isUserLoggedIn]);

  const authItems = useMemo(() => isUserLoggedIn ? ["LOGOUT"] : ["LOGIN", "SIGNUP"], [isUserLoggedIn]);

  useEffect(() => {
    // Map pathname to nav items
    if (pathname === "/") setActiveItem("HOME");
    else if (pathname === "/about" || pathname === "/for-professionals")
      setActiveItem("ABOUT");
    else if (pathname === "/download") setActiveItem("DOWNLOAD");
    else if (pathname.startsWith("/blogs")) setActiveItem("BLOG");
    else if (pathname === "/contact") setActiveItem("CONTACT");
    else if (pathname.includes("dashboard")) setActiveItem("DASHBOARD");
    else if (pathname === "/auth") {
      if (tab === "login") setActiveItem("LOGIN");
      else if (tab === "signup") setActiveItem("SIGNUP");
    }
  }, [pathname, tab]);

  useEffect(() => {
    setHovered(activeItem);
  }, [activeItem]);

  const getRoute = (item) => {
    if (item === "HOME") return "/";
    if (item === "ABOUT") return "/about";
    if (item === "DOWNLOAD") return "/download";
    if (item === "FOR PROFESSIONALS") return "/for-professionals";
    if (item === "CONTACT") return "/contact";
    if (item === "PRIVACY POLICY") return "/privacy-policy";
    if (item === "LOGIN") return "/auth?tab=login";
    if (item === "SIGNUP") return "/auth?tab=signup";
    if (item === "DASHBOARD") {
      if (user?.role === "doctor") return "/doctor-dashboard";
      if (user?.role === "babysitter") return "/babysitter-dashboard";
      return user?.role === "parent" || user?.role === "relative"
        ? "/parent-dashboard"
        : "/admin-dashboard";
    }
    return null;
  };

  const handleLogout = () => {
    dispatch(logout({ router }));
  };

  return (
    <div className="w-full">
      {/* Top Bar */}
      <div className="bg-secondary text-white px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span className="font-medium">Phone : +1 316-712-4886</span>
          </div>

          <div className="flex items-center gap-2">
            {/* <Clock className="w-4 h-4" /> */}
            <span className="text-yellow-400 font-medium">Tiny Giggle :</span>
            <span>Where family meets memories & growth</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-medium">Follow Us :</span>
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 cursor-pointer">
                <Facebook className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 cursor-pointer">
                <Instagram className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 cursor-pointer">
                <Youtube className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="bg-white shadow-sm relative">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex shrink-0 items-center gap-2">
              <img
                src="/logo.png"
                alt=""
                className="h-20 bg-cover bg-center object-center"
              />
            </div>

            {/* Navigation Menu */}
            <nav
              className="hidden md:flex flex-1 flex-row items-center gap-0"
              style={{ overflow: "visible", clipPath: "none" }}
            >
              {navItems.map((item) => {
                const route = getRoute(item);
                return (
                  <Link
                    key={item}
                    href={route || "#"}
                    className="relative flex items-center nav-item cursor-pointer h-full"
                    onMouseEnter={() => setHovered(item)}
                    onMouseLeave={() => setHovered(activeItem)}
                  >
                    {hovered === item && (
                      <span
                        className="absolute inset-0 rounded-md"
                        style={{
                          backgroundColor: "#70167E",
                          transformOrigin: "left center",
                          animation: "growX 0.2s ease forwards",
                        }}
                      />
                    )}
                    <span
                      className={`relative z-10 px-6 py-2 font-semibold text-xs transition-colors duration-200 whitespace-nowrap ${
                        hovered === item
                          ? "text-white"
                          : "text-gray-700 hover:text-purple-600"
                      }`}
                    >
                      {item}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Icons */}
            <div className="flex items-center gap-4 shrink-0">
              {/* <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                <Search className="w-5 h-5 text-white" />
              </button> */}
              {authItems.map((item) => {
                const route = getRoute(item);
                if (item === "LOGOUT") {
                  return (
                    <button
                      key={item}
                      className="relative flex items-center nav-item cursor-pointer"
                      onClick={handleLogout}
                      onMouseEnter={() => setHovered(item)}
                      onMouseLeave={() => setHovered(activeItem)}
                    >
                      {hovered === item && (
                        <span
                          className="absolute inset-0 rounded-md"
                          style={{
                            backgroundColor: "#70167E",
                            transformOrigin: "left center",
                            animation: "growX 0.2s ease forwards",
                          }}
                        />
                      )}
                      <span
                        className={`relative z-10 px-6 py-2 font-semibold text-xs transition-colors duration-200 whitespace-nowrap ${
                          hovered === item
                            ? "text-white"
                            : "text-gray-700 hover:text-purple-600"
                        }`}
                      >
                        {item}
                      </span>
                    </button>
                  );
                }
                return (
                  <Link
                    key={item}
                    href={route || "#"}
                    className="relative flex items-center nav-item cursor-pointer"
                    onMouseEnter={() => setHovered(item)}
                    onMouseLeave={() => setHovered(activeItem)}
                  >
                    {hovered === item && (
                      <span
                        className="absolute inset-0 rounded-md"
                        style={{
                          backgroundColor: "#70167E",
                          transformOrigin: "left center",
                          animation: "growX 0.2s ease forwards",
                        }}
                      />
                    )}
                    <span
                      className={`relative z-10 px-6 py-2 font-semibold text-xs transition-colors duration-200 whitespace-nowrap ${
                        hovered === item
                          ? "text-white"
                          : "text-gray-700 hover:text-purple-600"
                      }`}
                    >
                      {item}
                    </span>
                  </Link>
                );
              })}

              <button className="md:hidden">
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
