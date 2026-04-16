"use client";

import React, { useState } from "react";
import {
  Calendar,
  MessageCircle,
  User,
  Baby,
  Heart,
  Camera,
  Clock,
  Smile,
  Moon,
  Utensils,
  Bath,
  BookOpen,
  Music,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Mail,
  Video,
} from "lucide-react";
import { AiOutlineDashboard } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import { leaveRelation } from "@/store/slices/relationSlice";

const Sidebar = () => {
  const user = useSelector((state) => state.auth.user);
  const [openSections, setOpenSections] = useState({});
  const router = useRouter();
  const dispatch = useDispatch();
  const pathname = usePathname();

  const toggleSection = (key) => {
    // setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
    setOpenSections((prev) => {
      console.log("BEFORE:", prev, "CLICKED:", key, "CURRENT:", prev[key]);
      const next = { ...prev, [key]: !prev[key] };
      return next;
    });
  };

  // const active = (pathname) => {
  //   const active = window.location.pathname === pathname;
  //   return active;
  // };

  const active = (href) => pathname === href;

  const handleLogout = () => {
    dispatch(logout({ router }));
  };

  const handleLeave = () => {
    dispatch(leaveRelation({ router, relativeId: user?.id }));
  };

  const sections = [
    {
      key: "baby",
      label: "Baby",
      icon: Baby,
      roles: ["parent", "relative"],
      items: [
        {
          name: "Children",
          href: "/parent-dashboard/children",
          roles: ["parent", "relative"],
        },
        {
          name: "Baby Growth",
          href: "/parent-dashboard/baby-growth",
          roles: ["parent", "relative"],
        },
        {
          name: "Baby Activities",
          href: "/parent-dashboard/baby-activities",
          roles: ["parent", "relative"],
        },
        {
          name: "Milestone",
          href: "/parent-dashboard/milestones",
          roles: ["parent", "relative"],
        },
        {
          name: "Family & Friends",
          href: "/parent-dashboard/family-friends",
          roles: ["parent"],
        },
        {
          name: "Vaccination",
          href: "/parent-dashboard/vaccination",
          roles: ["parent", "relative"],
        },
        {
          name: "Doctors",
          href: "/parent-dashboard/doctors",
          roles: ["parent", "relative"],
        },
        {
          name: "Babysitters",
          href: "/parent-dashboard/babysitters",
          roles: ["parent", "relative"],
        },
        {
          name: "Appointments",
          href: "/parent-dashboard/appointments",
          roles: ["parent", "relative"],
        },
        {
          name: "Cloud Albums",
          href: "/parent-dashboard/cloud-albums",
          roles: ["parent", "relative"],
        },
      ],
    },
    {
      key: "reels",
      label: "Reels",
      icon: Video,
      items: [
        {
          name: "Reels",
          href: "/parent-dashboard/reels",
          roles: ["parent", "relative"],
        },
      ],
      roles: ["parent", "relative"],
    },
    {
      key: "shopping",
      label: "Shopping",
      icon: ShoppingCart,
      roles: ["parent", "relative"],
      items: [
        {
          name: "Store",
          href: "/parent-dashboard/store",
          roles: ["parent", "relative"],
        },
        {
          name: "Music",
          href: "/parent-dashboard/music",
          roles: ["parent", "relative"],
        },
        {
          name: "My Music",
          href: "/parent-dashboard/music/my-music",
          roles: ["parent", "relative"],
        },
        {
          name: "Product Wishlist",
          href: "/parent-dashboard/product-wishlist",
          roles: ["parent", "relative"],
        },
        {
          name: "Music Wishlist",
          href: "/parent-dashboard/music-wishlist",
          roles: ["parent", "relative"],
        },
        {
          name: "Orders",
          href: "/parent-dashboard/orders",
          roles: ["parent", "relative"],
        },
      ],
    },
    {
      key: "messages",
      label: "Messages",
      icon: MessageCircle,
      roles: ["parent"],
      items: [
        {
          name: "Chats",
          href: "/chat",
          roles: ["parent", "relative"],
        },
      ],
    },
    {
      key: "mine",
      label: "Mine",
      icon: User,
      roles: ["parent", "relative"],
      items: [
        {
          name: "Settings",
          href: "/parent-dashboard/settings",
          roles: ["parent", "relative"],
        },
        {
          name: "Logout",
          roles: ["parent", "relative"],
        },
        {
          name: "Leave",
          roles: ["relative"],
        },
      ],
    },
    {
      key: "communityCenter",
      label: "Community",
      icon: MessageCircle,
      roles: ["parent", "relative"],
      items: [
        {
          name: "Q&A Hub",
          href: "/community",
          roles: ["parent", "relative"],
        },
      ],
    },
  ];

  const filteredItems = sections
    .filter((item) => item.roles?.includes(user?.role))
    .map((item) => {
      if (item.items) {
        return {
          ...item,
          items: item.items.filter((sub) => sub.roles?.includes(user?.role)),
        };
      }
      return item;
    });

  return (
    <div className="w-64 bg-white/80 backdrop-blur-sm border-r border-pink-100 min-h-screen fixed lg:relative z-10 flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <img src="/logo.png" alt="logo" />
        </div>

        <nav className="flex flex-col space-y-3">
          <div className="flex flex-col">
            <Button
              variant="default"
              className={`w-full justify-start hover:bg-pink-50 cursor-pointer rounded-full transition-all
    ${
      active("/parent-dashboard")
        ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
        : "text-gray-600 bg-white"
    }
  `}
              onClick={() => router.push("/parent-dashboard")}
            >
              <AiOutlineDashboard
                className={`w-5 h-5 mr-3 ${active("/parent-dashboard") ? "text-white" : "text-pink-600"}`}
              />
              <p>Dashboard</p>
            </Button>
            {filteredItems?.map((section) => {
              const Icon = section.icon;
              const isOpen = !!openSections[section.key];

              return (
                <div key={section.key}>
                  <button
                    onClick={() =>
                      section.items ? toggleSection(section.key) : null
                    }
                    className={`w-full flex items-center justify-between text-left rounded-full hover:bg-pink-50 transition-all
                                         ${
                                           isOpen
                                             ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                                             : "text-gray-600"
                                         }
                                        `}
                    style={{ padding: "0.375rem 0" }}
                  >
                    <div className="flex items-center w-full">
                      <div className="flex items-center w-full">
                        <div className="flex items-center pl-3">
                          <Icon
                            className={`w-5 h-5 mr-3 ${
                              isOpen ? "text-white" : "text-pink-600"
                            }`}
                          />
                          <span className="">{section.label}</span>
                        </div>
                      </div>
                    </div>

                    {section.items ? (
                      <div className="pr-3">
                        {isOpen ? (
                          <ChevronUp
                            className={`w-4 h-4  
                                                ${
                                                  isOpen
                                                    ? "text-white"
                                                    : "text-gray-500"
                                                }`}
                          />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    ) : null}
                  </button>

                  {/* dropdown items */}
                  {section.items && isOpen && (
                    <div className="mt-3 mb-2 space-y-3">
                      {section.items.map((it, idx) => {
                        const isActive = active(it.href);
                        return (
                          <Button
                            key={idx}
                            variant="ghost"
                            className={`ml-3 w-[90%] justify-start text-sm rounded-full transition-all pl-10 text-gray-600 hover:bg-pink-50 cursor-pointer ${
                              isActive
                                ? "bg-pink-100 text-black rounded-full hover:from-pink-600 hover:to-purple-600"
                                : ""
                            }`}
                            onClick={() => {
                              if (it.name === "Logout") {
                                handleLogout();
                              } else if (it.name === "Leave") {
                                handleLeave();
                              } else if (it.href) {
                                router.replace(it.href);
                              }
                            }}
                          >
                            {it.name}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
