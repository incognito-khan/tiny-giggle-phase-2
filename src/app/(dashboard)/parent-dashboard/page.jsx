// 'use client';

// import { DashboardHeader } from '@/components/parent-dashboard/temp/dashboard-header'
// import { StatCard } from '@/components/parent-dashboard/temp/stat-card';
// import { Activity, TrendingUp, Target, Syringe, Moon, Droplet, Wind, Heart, Weight, Ruler, Brain, CheckCircle, Clock, AlertCircle } from 'lucide-react';

// export default function ParentDashboard() {
//   // Activity Stats
//   const activityStats = [
//     { icon: Moon, title: 'Latest Sleep', value: '8h 24m', subtitle: 'Last night', colorClass: 'bg-purple-50 border-purple-100 text-purple-500' },
//     { icon: Heart, title: 'Temperature', value: '98.6°F', subtitle: 'Today', colorClass: 'bg-amber-50 border-amber-100 text-amber-500' },
//     { icon: Droplet, title: 'Diaper Changes', value: '6', subtitle: 'Today', colorClass: 'bg-green-50 border-green-100 text-green-500' },
//     { icon: Wind, title: 'Play Time', value: '45m', subtitle: 'Today', colorClass: 'bg-blue-50 border-blue-100 text-blue-500' },
//   ];

//   // Growth Stats
//   const growthStats = [
//     { icon: Weight, title: 'Latest Weight', value: '17.2 lbs', subtitle: 'Nov 15 (+1.4 lbs)', colorClass: 'bg-pink-50 border-pink-100 text-pink-500' },
//     { icon: Ruler, title: 'Latest Height', value: '26.4 in', subtitle: 'Nov 15 (+0.3 in)', colorClass: 'bg-blue-50 border-blue-100 text-blue-500' },
//     { icon: Brain, title: 'Head Circumference', value: '17.1 in', subtitle: 'On track for age', colorClass: 'bg-indigo-50 border-indigo-100 text-indigo-500' },
//   ];

//   // Milestones
//   const milestonesStats = [
//     { icon: CheckCircle, title: 'Completed', value: '12', subtitle: 'milestones', colorClass: 'bg-green-50 border-green-100 text-green-500' },
//     { icon: Clock, title: 'Remaining', value: '8', subtitle: 'to achieve', colorClass: 'bg-purple-50 border-purple-100 text-purple-500' },
//   ];

//   // Vaccinations
//   const vaccinationStats = [
//     { icon: CheckCircle, title: 'Completed', value: '18', subtitle: 'vaccines', colorClass: 'bg-blue-50 border-blue-100 text-blue-500' },
//     { icon: AlertCircle, title: 'Remaining', value: '14', subtitle: 'scheduled', colorClass: 'bg-yellow-50 border-yellow-100 text-yellow-500' },
//   ];

//   return (
//     <main className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50 p-4 md:p-8">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <DashboardHeader
//           name="Emma"
//           age="6 months old"
//           birthDate="Born June 17, 2024"
//           avatarSrc="/baby-photo.jpg"
//           avatarFallback="EB"
//         />

//         {/* Activities Stats Section */}
//         <section className="mb-8">
//           <div className="flex items-center gap-3 mb-4">
//             <div className="bg-pink-500 rounded-full p-2 text-white shadow-md">
//               <Activity size={20} />
//             </div>
//             <h2 className="text-xl md:text-2xl font-bold text-slate-700">Activities</h2>
//           </div>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
//             {activityStats.map((stat, idx) => (
//               <StatCard key={idx} {...stat} />
//             ))}
//           </div>
//         </section>

//         {/* Growth Stats Section */}
//         <section className="mb-8">
//           <div className="flex items-center gap-3 mb-4">
//             <div className="bg-purple-500 rounded-full p-2 text-white shadow-md">
//               <TrendingUp size={20} />
//             </div>
//             <h2 className="text-xl md:text-2xl font-bold text-slate-700">Growth</h2>
//           </div>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-4">
//             {growthStats.map((stat, idx) => (
//               <StatCard key={idx} {...stat} />
//             ))}
//           </div>
//         </section>

//         {/* Milestones Stats Section */}
//         <section className="mb-8">
//           <div className="flex items-center gap-3 mb-4">
//             <div className="bg-amber-500 rounded-full p-2 text-white shadow-md">
//               <Target size={20} />
//             </div>
//             <h2 className="text-xl md:text-2xl font-bold text-slate-700">Milestones</h2>
//           </div>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
//             {milestonesStats.map((stat, idx) => (
//               <StatCard key={idx} {...stat} />
//             ))}
//           </div>
//         </section>

//         {/* Vaccinations Stats Section */}
//         <section className="mb-8">
//           <div className="flex items-center gap-3 mb-4">
//             <div className="bg-red-500 rounded-full p-2 text-white shadow-md">
//               <Syringe size={20} />
//             </div>
//             <h2 className="text-xl md:text-2xl font-bold text-slate-700">Vaccinations</h2>
//           </div>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
//             {vaccinationStats.map((stat, idx) => (
//               <StatCard key={idx} {...stat} />
//             ))}
//           </div>
//         </section>
//       </div>
//     </main>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { StatCard } from "@/components/parent-dashboard/temp/stat-card";
import {
  Activity,
  TrendingUp,
  Target,
  Syringe,
  Moon,
  Droplet,
  Wind,
  Heart,
  Weight,
  Ruler,
  Brain,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Utensils,
  Laugh,
  Coffee,
  Thermometer,
  Bed,
  Baby,
} from "lucide-react";
import ParentHeader from "@/components/layout/header/parent-header";
import { useDispatch, useSelector } from "react-redux";
import { getParentData } from "@/store/slices/dashboardSlice";
import Loading from "@/components/loading";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";

export default function ParentDashboard() {
  const parent = useSelector((state) => state.auth.user);
  const childId = useSelector((state) => state.child.childId);
  const data = useSelector((state) => state.dashboard.parent);
  console.log(data, "data");
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const gettingAllData = () => {
    dispatch(getParentData({ setLoading, parentId: parent?.id, childId }));
  };

  useEffect(() => {
    gettingAllData();
  }, []);

  const formatDate = (date) => {
    if (!date) return;

    return format(date, "MMM dd, yyyy");
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "0m";

    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    return `${h > 0 ? h + "h " : ""}${m}m`;
  };

  const quickStats = [
    {
      icon: Bed,
      title: "Last Sleep",
      value: formatDuration(data?.latestSleep?.duration),
      colorClass: "bg-gradient-to-br from-blue-500 to-blue-600 text-white",
    },
    {
      icon: Moon,
      title: "Total 7 days Sleep ",
      value: formatDuration(data?.totalSleepMinutesLast7Days),
      colorClass: "bg-gradient-to-br from-green-500 to-green-600 text-white",
    },
    {
      icon: Baby,
      title: "Current Feed",
      value: data?.currentFeed,
      subtitle: `${data?.feedPerDay} feeds per day`,
      colorClass: "bg-gradient-to-br from-purple-500 to-purple-600 text-white",
    },
    {
      icon: Thermometer,
      title: "Temperature",
      value: `${data?.latestTemperature?.temperature} °C`,
      subtitle: formatDate(data?.latestTemperature?.date),
      colorClass: "bg-gradient-to-br from-orange-500 to-orange-600 text-white",
    },
  ];

  const activityFeed = [
    {
      icon: Utensils,
      title: "Feeding",
      value: "6 oz formula",
      time: "2:30 PM",
      colorClass: "bg-orange-50 border-l-4 border-orange-400",
    },
    {
      icon: Moon,
      title: "Nap Time",
      value: "1h 15m",
      time: "1:45 PM",
      colorClass: "bg-purple-50 border-l-4 border-purple-400",
    },
    {
      icon: Droplet,
      title: "Diaper Change",
      value: "3 changes",
      time: "12:00 PM",
      colorClass: "bg-green-50 border-l-4 border-green-400",
    },
    {
      icon: Wind,
      title: "Play Time",
      value: "30 minutes",
      time: "11:00 AM",
      colorClass: "bg-blue-50 border-l-4 border-blue-400",
    },
    {
      icon: Utensils,
      title: "Feeding",
      value: "5 oz formula",
      time: "9:30 AM",
      colorClass: "bg-orange-50 border-l-4 border-orange-400",
    },
    {
      icon: Laugh,
      title: "Playtime & Giggles",
      value: "Interactive",
      time: "8:15 AM",
      colorClass: "bg-yellow-50 border-l-4 border-yellow-400",
    },
    {
      icon: Coffee,
      title: "Wake Up",
      value: "Morning",
      time: "7:00 AM",
      colorClass: "bg-amber-50 border-l-4 border-amber-400",
    },
  ];

  const highlights = [
    {
      icon: Ruler,
      title: "Height",
      value: data?.growthSummary?.height,
      subtitle: formatDate(data?.growthSummary?.date),
      colorClass: "bg-orange-50 border-orange-100 text-orange-500",
      size: "small",
    },
    {
      icon: Weight,
      title: "Weight",
      value: data?.growthSummary?.weight,
      subtitle: formatDate(data?.growthSummary?.date),
      colorClass: "bg-pink-100 border-pink-100 text-pink-500",
      size: "small",
    },
    {
      icon: CheckCircle,
      title: "Milestones",
      value: data?.milestones?.achievedMilestones,
      subtitle: "Completed",
      colorClass: "bg-green-50 border-green-100 text-green-500",
      size: "small",
    },
    {
      icon: Syringe,
      title: "Vaccines",
      value: `${data?.vaccinations?.achievedVaccinations || 0}/${data?.vaccinations?.totalVaccinations || 0}`,
      subtitle: "On schedule",
      colorClass: "bg-blue-50 border-blue-100 text-blue-500",
      size: "small",
    },
  ];

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50">
      {loading && <Loading />}
      {/* Header with Baby Info */}
      <ParentHeader />
      <div className="max-w-7xl mx-auto my-5">
        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          {quickStats.map((stat, idx) => (
            <StatCard key={idx} stat={stat} />
          ))}
        </div>

        {/* Main Content Grid: Timeline + Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Activity Timeline Feed (takes 2 columns on large screens) */}
          {/* <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="bg-gradient-to-br from-pink-500 to-purple-500 rounded-full p-2 text-white shadow-lg">
                                <Activity size={20} />
                            </div>
                            <h2 className="text-2xl md:text-2xl font-bold text-slate-800">Activity Timeline</h2>
                        </div>

                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                            {activityFeed.map((activity, idx) => (
                                <div
                                    key={idx}
                                    className={`${activity.colorClass} rounded-lg p-4 shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5 cursor-pointer`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-1">
                                            <activity.icon size={20} className="text-current opacity-80" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-slate-700">{activity.title}</p>
                                            <p className="text-sm text-slate-600 mt-0.5">{activity.value}</p>
                                        </div>
                                        <div className="flex-shrink-0 text-right">
                                            <p className="text-xs font-medium text-slate-500">{activity.time}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div> */}

          <div className="lg:col-span-2">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="bg-gradient-to-br from-pink-500 to-purple-500 rounded-full p-2 text-white shadow-lg">
                  <CheckCircle size={20} />
                </div>
                <h2 className="text-2xl md:text-2xl font-bold text-slate-800">
                  Milestones Timeline
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <Card
                  className={`bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden`}
                >
                  <div className="p-3 md:p-4 space-y-2">
                    <div>
                      <p className={`text-xs font-medium text-green-700`}>
                        Recently Achieved
                      </p>
                      <p className="text-lg md:text-xl font-bold mt-1">
                        {data?.milestones?.lastMilestone?.subMilestone?.title}
                      </p>
                      {data?.milestones?.lastMilestone?.achievedAt && (
                        <p className="text-xs mt-1 text-gray-500">
                          {formatDate(
                            data?.milestones?.lastMilestone?.achievedAt,
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
                <Card
                  className={`bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200 rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden`}
                >
                  <div className="p-3 md:p-4 space-y-2">
                    <div>
                      <p className={`text-xs font-medium text-green-700`}>
                        Upcoming
                      </p>
                      <p className="text-lg md:text-xl font-bold mt-1">
                        {data?.milestones?.nextMilestone?.subMilestone
                          ?.title || (
                          <div className="text-gray-500 font-medium text-sm">
                            No Next Milestone
                          </div>
                        )}
                      </p>
                      {data?.milestones?.nextMilestone?.achievedAt && (
                        <p className="text-xs mt-1 text-gray-500">
                          {formatDate(
                            data?.milestones?.nextMilestone?.achievedAt,
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
              {/* <div className='grid grid-cols-2 gap-4'>
                            <Card className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg border border-pink-200 text-white shadow-sm hover:shadow-md transition-shadow overflow-hidden mt-3 text-center py-12">
                                <p className="text-xl text-slate-600 font-medium">Completed</p>
                                <p className="text-3xl font-bold text-pink-600">12</p>
                            </Card>
                            <Card className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg border border-purple-200 text-white shadow-sm hover:shadow-md transition-shadow overflow-hidden mt-3 items-center py-12">
                                <p className="text-xl text-slate-600 font-medium">Remaining</p>
                                <p className="text-3xl font-bold text-purple-600">8</p>
                            </Card>
                        </div> */}
            </div>
            <div className="my-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="bg-gradient-to-br from-pink-500 to-purple-500 rounded-full p-2 text-white shadow-lg">
                  <Syringe size={20} />
                </div>
                <h2 className="text-2xl md:text-2xl font-bold text-slate-800">
                  Vaccination Timeline
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <Card
                  className={`bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden`}
                >
                  <div className="p-3 md:p-4 space-y-2">
                    <div>
                      <p className={`text-xs font-medium text-green-700`}>
                        Last Given
                      </p>
                      <p className="text-lg md:text-xl font-bold mt-1">
                        {data?.vaccinations?.lastVaccination?.vaccination?.name}
                      </p>
                      {data?.vaccinations?.lastVaccination?.date && (
                        <p className="text-xs mt-1 text-gray-500">
                          Given{" "}
                          {formatDate(
                            data?.vaccinations?.lastVaccination?.date,
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
                <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className="p-3 md:p-4 space-y-2">
                    <p className="text-xs font-medium text-amber-700">
                      Next Due
                    </p>
                    <p className="text-lg md:text-xl font-bold mt-1">
                      {data?.vaccinations?.nextVaccination?.vaccination
                        ?.name || (
                        <div className="text-gray-500 font-medium text-sm">
                          No Next Vaccination
                        </div>
                      )}
                    </p>
                    {data?.vaccinations?.nextVaccination?.date && (
                      <p className="text-xs mt-1 text-gray-500">
                        Due:{" "}
                        {formatDate(data.vaccinations.nextVaccination.date)}
                      </p>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Highlights Sidebar */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-full p-2 text-white shadow-lg">
                <Target size={20} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Highlights</h2>
            </div>

            <div className="space-y-4">
              {highlights.map((highlight, idx) => {
                const IconComponent = highlight.icon; // assign the icon to a capitalized variable
                const cardClasses =
                  highlight.size === "large"
                    ? "rounded-2xl p-6 shadow-md hover:shadow-lg transition-all"
                    : "rounded-xl p-4 shadow-sm hover:shadow-md transition-all";

                return (
                  <div
                    key={idx}
                    className={`${highlight.colorClass} ${cardClasses}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <IconComponent
                        size={highlight.size === "large" ? 24 : 20}
                        className="text-current opacity-90"
                      />
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      {highlight.title}
                    </p>
                    <p
                      className={`font-bold ${highlight.size === "large" ? "text-3xl" : "text-2xl"} text-slate-800`}
                    >
                      {highlight.value}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      {highlight.subtitle}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
