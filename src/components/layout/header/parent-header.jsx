import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Bell,
  MessageCircle,
  Search,
  ShoppingCart,
  User,
  Calendar,
  Shield,
  ShoppingBag,
  LayoutDashboard,
  ChevronRight,
  Settings,
  LogOut,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/store/slices/authSlice";
import { setChilds } from "@/store/slices/childSlice";

function ParentHeader() {
  const dispatch = useDispatch();
  const router = useRouter();
  const cartItems = useSelector((state) => state.cart.cart);
  const user = useSelector((state) => state.auth.user);
  const children = useSelector((state) => state.child.childId); // Note: childSlice uses childId for the list
  const milestones = useSelector((state) => state.milestone.milestones);
  const vaccinations = useSelector((state) => state.vaccination.vaccinations);
  const products = useSelector((state) => state.product.products);

  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const handleLogout = () => {
    dispatch(logout({ router }));
  };

  // Static dashboard sections for quick navigation
  const dashboardSections = [
    {
      title: "Growth Summary",
      link: "/parent-dashboard/baby-growth",
      icon: LayoutDashboard,
    },
    {
      title: "Milestones",
      link: "/parent-dashboard/milestones",
      icon: Calendar,
    },
    {
      title: "Vaccinations",
      link: "/parent-dashboard/vaccination",
      icon: Shield,
    },
    {
      title: "Family & Friends",
      link: "/parent-dashboard/family-friends",
      icon: User,
    },
    {
      title: "Community",
      link: "/parent-dashboard/community",
      icon: MessageCircle,
    },
  ];

  const results = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const filtered = [];

    // 1. Children
    const matchedChildren = (Array.isArray(children) ? children : [])
      .filter((c) => c && typeof c.name === 'string' && c.name.toLowerCase().includes(query))
      .map((c) => ({ ...c, type: "child", category: "Children", icon: User }));
    filtered.push(...matchedChildren);

    // 2. Sections
    const matchedSections = dashboardSections
      .filter((s) => s && typeof s.title === 'string' && s.title.toLowerCase().includes(query))
      .map((s) => ({
        ...s,
        type: "section",
        category: "Navigation",
        icon: s.icon,
      }));
    filtered.push(...matchedSections);

    // 3. Milestones
    const matchedMilestones = (Array.isArray(milestones) ? milestones : [])
      .filter((m) => m && typeof m.title === 'string' && m.title.toLowerCase().includes(query))
      .map((m) => ({
        ...m,
        type: "milestone",
        category: "Milestones",
        icon: Calendar,
        link: "/parent-dashboard/milestones",
      }));
    filtered.push(...matchedMilestones);

    // 4. Vaccinations
    const matchedVaccinations = (
      Array.isArray(vaccinations) ? vaccinations : []
    )
      .filter((v) => v && typeof v.name === 'string' && v.name.toLowerCase().includes(query))
      .map((v) => ({
        ...v,
        type: "vaccination",
        category: "Vaccinations",
        icon: Shield,
        link: "/parent-dashboard/vaccination",
      }));
    filtered.push(...matchedVaccinations);

    // 5. Products
    const matchedProducts = (Array.isArray(products) ? products : [])
      .filter((p) => p && typeof p.name === 'string' && p.name.toLowerCase().includes(query))
      .map((p) => ({
        ...p,
        type: "product",
        category: "Shop",
        icon: ShoppingBag,
        link: `/shop/product/${p.id}`,
      }));
    filtered.push(...matchedProducts);

    return filtered;
  }, [searchQuery, children, milestones, vaccinations, products]);

  const handleSelect = (result) => {
    setShowResults(false);
    setSearchQuery("");

    if (result.type === "child") {
      // Logic to switch active child if needed
      // For now, let's just navigate to dashboard or keep as is
      router.push("/parent-dashboard");
    } else if (result.link) {
      router.push(result.link);
    }
  };

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 p-4 lg:p-6 relative z-50">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
            Hello, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-gray-600 text-sm lg:text-base">
            Here are all your little ones and their precious details
          </p>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <div className="relative flex-1 lg:flex-none" ref={searchRef}>
            <Search className="w-4 h-4 lg:w-5 lg:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search anything here"
              className="pl-8 lg:pl-10 w-full lg:w-80 bg-gray-50 border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-pink-200 transition-all"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
            />

            {/* Search Results Dropdown */}
            {showResults && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border border-pink-100 rounded-2xl shadow-xl max-h-[400px] overflow-y-auto overflow-x-hidden animate-in fade-in zoom-in duration-200">
                {results.length > 0 ? (
                  <div className="p-2">
                    {Object.entries(
                      results.reduce((acc, curr) => {
                        if (!acc[curr.category]) acc[curr.category] = [];
                        acc[curr.category].push(curr);
                        return acc;
                      }, {}),
                    ).map(([category, items]) => (
                      <div key={category} className="mb-2 last:mb-0">
                        <h3 className="px-3 py-1 text-xs font-semibold text-pink-500 uppercase tracking-wider">
                          {category}
                        </h3>
                        {items.map((item, idx) => (
                          <button
                            key={`${category}-${idx}`}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors group text-left"
                            onClick={() => handleSelect(item)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 bg-gray-100 rounded-lg group-hover:bg-pink-100 transition-colors">
                                <item.icon className="w-4 h-4 text-gray-500 group-hover:text-pink-500" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  {item.name || item.title}
                                </p>
                                {item.type === "product" && (
                                  <p className="text-xs text-gray-400">
                                    ${item.price}
                                  </p>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">
                      No results for "{searchQuery}"
                    </p>
                    <p className="text-sm text-gray-400">
                      Try searching for a baby name, milestone, or product
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full hover:bg-pink-50 transition-colors"
          >
            <Bell className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
            <Badge className="absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 p-0 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </Badge>
          </Button> */}

          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full cursor-pointer hover:bg-pink-50 transition-colors"
            onClick={() => router.push("/parent-dashboard/cart")}
          >
            <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
            <Badge className="absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 p-0 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">
              {cartItems?.length}
            </Badge>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="hidden lg:flex items-center gap-3 ml-2 pl-2 border-l border-pink-100 cursor-pointer hover:opacity-80 transition-opacity">
                <Avatar className="ring-2 ring-pink-50 ring-offset-2">
                  <AvatarImage
                    src={user?.avatarUrl || "/placeholder.svg?height=40&width=40"}
                  />
                  <AvatarFallback className="bg-gradient-to-r from-pink-400 to-purple-400 text-white font-bold">
                    {user?.name
                      ? user.name
                          .split(" ")
                          .slice(0, 2)
                          .map((n) => n[0].toUpperCase())
                          .join("")
                      : "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="font-semibold text-gray-800 leading-none">
                    {user?.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">
                      Online
                    </p>
                  </div>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl border-pink-100 shadow-xl">
              <DropdownMenuItem 
                className="rounded-xl cursor-pointer hover:bg-pink-50 text-gray-700"
                onClick={() => router.push('/parent-dashboard/settings')}
              >
                <Settings className="w-4 h-4 mr-2 text-pink-500" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="rounded-xl cursor-pointer hover:bg-red-50 text-red-600 focus:bg-red-50 focus:text-red-700"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default ParentHeader;
