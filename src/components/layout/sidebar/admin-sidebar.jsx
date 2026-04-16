"use client";

import { useState } from "react";
import {
  Home,
  Package,
  ShoppingCart,
  Archive,
  Users,
  Settings,
  LogOut,
  Music,
  Milestone,
  BriefcaseMedical,
  ChevronDown,
  ChevronUp,
  Boxes,
  MailQuestionMark,
  MessageCircle,
  Stethoscope,
  Baby
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/slices/authSlice";

// const sidebarItems = [
//   { icon: Home, label: "Dashboard", href: "/admin-dashboard" },
//   { icon: Milestone, label: "Milestones", href: "/admin-dashboard/milestones" },
//   { icon: BriefcaseMedical, label: "Vaccinations", href: "/admin-dashboard/vaccinations" },
//   {
//     icon: ShoppingCart,
//     label: "Shopping",
//     items: [
//       { name: "Product", icon: Archive, href: "/admin-dashboard/products" },
//       { name: "Category", icon: Package, href: "/admin-dashboard/categories" },
//       { name: "Orders", icon: Boxes, href: "/admin-dashboard/orders" },
//       { name: "Suppliers", icon: Users, href: "/admin-dashboard/suppliers" },
//       { name: "Customer Queries", icon: MailQuestionMark, href: "/admin-dashboard/customer-queries" },
//     ],
//   },
//   {
//     icon: Music,
//     label: "Music",
//     items: [
//       { name: "Music", icon: Package, href: "/admin-dashboard/music" },
//       { name: "Music Category", icon: Music, href: "/admin-dashboard/music-categories" },
//       { name: "Artists", icon: Users, href: "/admin-dashboard/artists" },
//     ],
//   },
//   { icon: Archive, label: "Stock", href: "/admin-dashboard/stock" },
// ];

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/admin-dashboard", roles: ["admin", "supplier", "artist"] },
  { icon: Milestone, label: "Milestones", href: "/admin-dashboard/milestones", roles: ["admin"] },
  { icon: BriefcaseMedical, label: "Vaccinations", href: "/admin-dashboard/vaccinations", roles: ["admin"] },

  {
    icon: ShoppingCart,
    label: "Shopping",
    roles: ["admin", "supplier"],
    items: [
      { name: "Product", icon: Archive, href: "/admin-dashboard/products", roles: ["admin", "supplier"] },
      { name: "Category", icon: Package, href: "/admin-dashboard/categories", roles: ["admin"] },
      { name: "Orders", icon: Boxes, href: "/admin-dashboard/orders", roles: ["admin", "supplier"] },
      { name: "Suppliers", icon: Users, href: "/admin-dashboard/suppliers", roles: ["admin"] },
      { name: "Customer Queries", icon: MailQuestionMark, href: "/admin-dashboard/customer-queries", roles: ["admin"] },
    ],
  },
  {
    icon: Music,
    label: "Music",
    roles: ["admin", "artist"],
    items: [
      { name: "Music", icon: Package, href: "/admin-dashboard/music", roles: ["admin", "artist"] },
      { name: "Music Category", icon: Music, href: "/admin-dashboard/music-categories", roles: ["admin"] },
      { name: "Artists", icon: Users, href: "/admin-dashboard/artists", roles: ["admin"] },
    ],
  },
  {
    icon: Stethoscope,
    label: "Professionals",
    roles: ["admin"],
    items: [
      { name: "Doctors", icon: BriefcaseMedical, href: "/admin-dashboard/doctors", roles: ["admin"] },
      { name: "Babysitters", icon: Baby, href: "/admin-dashboard/babysitters", roles: ["admin"] },
    ],
  },
  { icon: MessageCircle, label: "Community", href: "/community", roles: ["admin", "supplier", "artist"] },
];


export function AdminSidebar() {
  const user = useSelector((state) => state.auth.user);
  const pathname = usePathname() || "";
  const router = useRouter();
  const dispatch = useDispatch();
  const [openSections, setOpenSections] = useState({});

  // ✅ Improved matching logic
  const matches = (href) => {
    if (!href) return false;
    if (href === "/admin-dashboard") {
      // Dashboard only active for exact match
      return pathname === href;
    }
    // Others active for nested paths
    return pathname === href || pathname.startsWith(href + "/");
  };

  const filteredItems = sidebarItems
  .filter(item => item.roles?.includes(user?.role))
  .map(item => {
    if (item.items) {
      return {
        ...item,
        items: item.items.filter(sub => sub.roles?.includes(user?.role))
      };
    }
    return item;
  });

  const toggleSection = (label) => {
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = () => {
    dispatch(logout({ router }));
  };

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="logo" className="h-7 object-contain" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {filteredItems.map((item, index) => {
            const hasItems = Array.isArray(item.items) && item.items.length > 0;
            const simpleActive = item.href ? matches(item.href) : false;
            const childActive = hasItems ? item.items.some((c) => matches(c.href)) : false;
            const isOpen = openSections[item.label] ?? childActive;
            const parentActive = simpleActive || childActive;

            return (
              <li key={index} className="space-y-1">
                {hasItems ? (
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleSection(item.label)}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left transition-colors ${parentActive || isOpen
                        ? "bg-secondary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-secondary hover:text-sidebar-primary-foreground"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="ml-9 mt-1 space-y-1">
                        {item.items.map((sub, sidx) => {
                          const active = matches(sub.href);
                          return (
                            <div key={sidx} className={`flex items-center gap-3 pl-3 ${active ? "bg-pink-100 text-black" : "text-gray-600 hover:bg-pink-50"
                              }`}>
                              <div>
                                <sub.icon className="w-4 h-4" />
                              </div>
                              <Link
                                key={sidx}
                                href={sub.href}
                                className={`block px-3 py-1.5 rounded-md text-sm transition-colors `}
                              >
                                {sub.name}
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href || "#"}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${simpleActive
                      ? "bg-secondary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-secondary hover:text-sidebar-primary-foreground"
                      }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-sidebar-border fixed bottom-0 space-y-2">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sidebar-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground transition-colors"
          onClick={() => router.push('/admin-dashboard/settings')}
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sidebar-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Log out</span>
        </button>
      </div>
    </aside>
  );
}


