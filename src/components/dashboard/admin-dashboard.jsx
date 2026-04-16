'use client';

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAdminData } from "@/store/slices/dashboardSlice";
import { 
  Users, UserPlus, HeartPulse, Stethoscope, 
  Mic, Music, DollarSign, ShoppingCart, 
  Truck, Package, Activity, Heart,
  TrendingUp, Award, List
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UsersDirectory from "./users-directory";

const AdminDashboard = ({ setLoading }) => {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.dashboard.admin);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (user?.id) {
      dispatch(getAdminData({ setLoading, adminId: user.id }));
    }
  }, [user?.id, dispatch, setLoading]);

  const artistRevenueData = data?.artists?.revenuePerMusic || [];

  // Reusable modern card component
  const StatCard = ({ title, value, icon: Icon, gradientFrom, gradientTo }) => (
    <Card className={`relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-none bg-gradient-to-br ${gradientFrom} ${gradientTo}`}>
      <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-white opacity-20 group-hover:scale-150 transition-transform duration-500 ease-in-out"></div>
      <CardContent className="p-6 relative z-10">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-white/90 uppercase tracking-widest">{title}</p>
            <p className="text-4xl font-extrabold text-white">{value ?? 0}</p>
          </div>
          <div className="p-3 bg-white/30 rounded-2xl shadow-sm backdrop-blur-md">
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const SectionTitle = ({ title, icon: Icon }) => (
    <div className="flex items-center space-x-3 pb-4 mt-10">
      <div className="p-2.5 bg-white rounded-xl shadow-md text-indigo-600">
        <Icon className="w-6 h-6" />
      </div>
      <h2 className="text-3xl font-bold text-gray-800 tracking-tight">{title}</h2>
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-6 bg-slate-50 min-h-screen">
      <div className="mb-10 p-8 rounded-3xl bg-white shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Admin Overview
          </h1>
          <p className="text-gray-500 mt-2 text-lg">Comprehensive system analytics and performance metrics.</p>
        </div>
        <div className="hidden md:block">
          <Activity className="w-16 h-16 text-indigo-100" />
        </div>
      </div>

      {/* Graphs - Commented out as requested */}
      {/* 
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         PieChart and LineChart code were here 
      </div>
      */}

      <Tabs defaultValue="overview" className="space-y-8">
        <div className="flex justify-center md:justify-start">
          <TabsList className="bg-white p-1 border border-gray-100 shadow-sm rounded-full">
            <TabsTrigger value="overview" className="rounded-full px-6 py-2.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              <Activity className="w-4 h-4 mr-2" />
              Overview Data
            </TabsTrigger>
            <TabsTrigger value="directory" className="rounded-full px-6 py-2.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              <List className="w-4 h-4 mr-2" />
              Users Directory
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          {/* Users & Roles Statistics */}
      <SectionTitle title="Users & Roles" icon={Users} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Parents" 
          value={data?.users?.totalParents} 
          icon={Users} 
          gradientFrom="from-blue-500" gradientTo="to-indigo-600" 
        />
        <StatCard 
          title="Total Children" 
          value={data?.users?.totalChildren} 
          icon={UserPlus} 
          gradientFrom="from-pink-500" gradientTo="to-rose-600" 
        />
        <StatCard 
          title="Babysitters" 
          value={data?.users?.totalBabysitters} 
          icon={HeartPulse} 
          gradientFrom="from-emerald-400" gradientTo="to-emerald-600" 
        />
        <StatCard 
          title="Doctors" 
          value={data?.users?.totalDoctors} 
          icon={Stethoscope} 
          gradientFrom="from-cyan-500" gradientTo="to-blue-600" 
        />
      </div>

      <Separator className="my-10 opacity-50" />

      {/* Artists Statistics */}
      <SectionTitle title="Artists Ecosystem" icon={Mic} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard 
          title="Total Artists" 
          value={data?.artists?.totalArtists} 
          icon={Mic} 
          gradientFrom="from-purple-500" gradientTo="to-fuchsia-600" 
        />
        <StatCard 
          title="Total Music" 
          value={data?.artists?.totalMusic} 
          icon={Music} 
          gradientFrom="from-violet-500" gradientTo="to-purple-600" 
        />
        <StatCard 
          title="Paid Music" 
          value={data?.artists?.totalPaidMusic} 
          icon={DollarSign} 
          gradientFrom="from-amber-400" gradientTo="to-orange-500" 
        />
        <StatCard 
          title="Free Music" 
          value={data?.artists?.totalFreeMusic} 
          icon={Heart} 
          gradientFrom="from-rose-400" gradientTo="to-pink-500" 
        />
        <StatCard 
          title="Purchases" 
          value={data?.artists?.totalPurchases} 
          icon={ShoppingCart} 
          gradientFrom="from-teal-400" gradientTo="to-emerald-500" 
        />
        <StatCard 
          title="Earnings" 
          value={`$${data?.artists?.totalEarnings || 0}`} 
          icon={TrendingUp} 
          gradientFrom="from-green-500" gradientTo="to-emerald-700" 
        />
      </div>

      <Separator className="my-10 opacity-50" />

      {/* Suppliers Statistics */}
      <SectionTitle title="Suppliers Network" icon={Truck} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <StatCard 
          title="Total Suppliers" 
          value={data?.suppliers?.totalSuppliers} 
          icon={Truck} 
          gradientFrom="from-slate-600" gradientTo="to-slate-800" 
        />
        <StatCard 
          title="Total Products" 
          value={data?.suppliers?.totalProducts} 
          icon={Package} 
          gradientFrom="from-orange-500" gradientTo="to-red-600" 
        />
      </div>

      <Separator className="my-10 opacity-50" />

      {/* Health & Milestones Statistics */}
      <SectionTitle title="Health & Milestones" icon={Activity} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <StatCard 
          title="Total Milestones" 
          value={data?.milestones?.totalMilestones} 
          icon={Award} 
          gradientFrom="from-sky-400" gradientTo="to-blue-600" 
        />
        <StatCard 
          title="Total Vaccinations" 
          value={data?.vaccinations?.totalVaccinations} 
          icon={Activity} 
          gradientFrom="from-red-400" gradientTo="to-rose-600" 
        />
      </div>

      {/* Role Subscriptions Earnings */}
      <div className="mt-10">
        <div className="flex items-center space-x-3 pb-4">
          <div className="p-2.5 bg-white rounded-xl shadow-md text-emerald-500">
            <DollarSign className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Subscription Earnings Overview</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
          {/* Total Earnings Summary Card */}
          <Card className="col-span-1 lg:col-span-1 border-none shadow-xl bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10 group-hover:scale-150 transition-transform duration-700"></div>
            <CardContent className="p-8 relative z-10 flex flex-col justify-center h-full min-h-[250px]">
              <p className="text-emerald-50 font-semibold uppercase tracking-wider mb-2">Total Monthly Earnings</p>
              <p className="text-5xl font-extrabold text-white mb-4">
                ${data?.subscriptions?.totalEarnings || 0}
              </p>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-md w-max">
                <TrendingUp className="w-5 h-5 text-white mr-2" />
                <span className="text-white font-medium">Platform Subscriptions</span>
              </div>
            </CardContent>
          </Card>

          {/* Breakdown List */}
          <Card className="col-span-1 lg:col-span-2 border-none shadow-xl bg-white rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-gray-100 pb-4">
              <CardTitle className="text-lg font-bold text-gray-700">Earnings Breakdown by Role</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {[
                  { role: "Suppliers", amount: data?.subscriptions?.breakdown?.supplier, icon: Truck, color: "text-orange-500", bg: "bg-orange-100" },
                  { role: "Doctors", amount: data?.subscriptions?.breakdown?.doctor, icon: Stethoscope, color: "text-blue-500", bg: "bg-blue-100" },
                  { role: "Artists", amount: data?.subscriptions?.breakdown?.artist, icon: Mic, color: "text-purple-500", bg: "bg-purple-100" },
                  { role: "Babysitters", amount: data?.subscriptions?.breakdown?.babysitter, icon: HeartPulse, color: "text-emerald-500", bg: "bg-emerald-100" },
                ].sort((a, b) => (b.amount || 0) - (a.amount || 0)).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors duration-200">
                    <div className="flex items-center space-x-4">
                      <div className={`h-12 w-12 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} shadow-sm`}>
                        <item.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-lg">{item.role}</p>
                        <p className="text-sm text-gray-500 font-medium">Subscription Revenue</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-lg font-bold bg-gray-100 text-gray-800 border border-gray-200 shadow-sm">
                        ${item.amount || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
        </TabsContent>

        <TabsContent value="directory" className="space-y-6">
          <UsersDirectory />
        </TabsContent>
      </Tabs>

    </div>
  );
};

export default AdminDashboard;
