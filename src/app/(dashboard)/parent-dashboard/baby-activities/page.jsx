"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import {
    TrendingUp,
    Activity,
    Heart,
    Thermometer,
    Scale,
    Ruler,
    Baby,
    AlertTriangle,
    CheckCircle,
    Calendar,
    Target,
    Plus,
    MessageCircle,
    Bell,
    Dumbbell,
    Bed,
    Moon,
    UtensilsCrossed
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getAllActivies, markFeedTaken, addTemperature, markSleep, markAwake, createSchedule, changeSchedule } from "@/store/slices/activitySlice";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import Loading from "@/components/loading";
import ParentHeader from "@/components/layout/header/parent-header";
import { format } from 'date-fns';

export default function GrowthPage() {
    const user = useSelector((state) => state.auth.user);
    const childId = useSelector((state) => state.child.childId);
    const activities = useSelector((state) => state.activity.activities);
    console.log(activities, 'activities');
    const [selectedTab, setSelectedTab] = useState("overview");
    const [loading, setLoading] = useState(false);
    const [isFeedOpen, setIsFeedOpen] = useState(false);
    const [isTemperatureOpen, setIsTemperatureOpen] = useState(false);
    const [isSleepOpen, setIsSleepOpen] = useState(false);
    const [isCreateScheduleOpen, setIsCreateScheduleOpen] = useState(false);
    const [selectedSlotId, setSelectedSlotId] = useState(null);
    const [temperatureForm, setTemperatureForm] = useState({
        value: "",
        date: "",
        time: ""
    });
    const [sleepForm, setSleepForm] = useState({
        sleepType: "",
        date: "",
        time: ""
    });
    // const activeSchedule = activities?.schedule?.find(s => s.inUsed);
    const activeSchedule = (Array.isArray(activities?.schedule) ? activities.schedule : []).find(s => s.inUsed);
    const [selectedScheduleId, setSelectedScheduleId] = useState(activeSchedule?.id);
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [newFeeds, setNewFeeds] = useState([
        { feedTime: "", feedType: "BREAKFAST", feedName: "", amount: "" }
    ]);
    const dispatch = useDispatch();

    useEffect(() => {
        if (activeSchedule?.id) {
            setSelectedScheduleId(activeSchedule.id);
        }
        console.log(activeSchedule, 'activeSchedule')
    }, [activeSchedule]);

    const gettingAllActivities = () => {
        dispatch(getAllActivies({ setLoading, parentId: user?.id, childId }))
    }

    useEffect(() => {
        gettingAllActivities();
    }, []);

    const feeds = activities?.feed || [];
    const schedule = activities?.schedule?.[0];
    const sleepSummary = activities?.sleep?.summary;
    const sleeps = activities?.sleep?.sleeps;
    const temperatureData = activities?.temperature?.[0]?.temperature?.[0];

    // Sleep Quality (based on total sleep minutes)
    const totalSleepMinutes = sleepSummary?.totalSleepMinutes || 0;
    const totalSleepHours = (totalSleepMinutes / 60).toFixed(1);
    const sleepQuality = Math.min((totalSleepMinutes / (12 * 60)) * 100, 100); // 12 hours = 720 mins target

    const feverEpisodes = Array.isArray(activities?.temperature) ? activities.temperature.flatMap(item =>
        (item?.temperature || [])
            .filter(t => t.temperature > 38)
            .map(t => {
                const isLatest = t.date === item.temperature[item.temperature.length - 1]?.date;
                return {
                    title: "Fever Episode",
                    date: new Date(t.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
                    severity: t.temperature <= 39 ? "Mild" : "High",
                    duration: "1 day",
                    status: isLatest && t.temperature <= 38 ? "Recovered" : "Recovering"
                };
            })
    ) : [];

    const sleepBadge =
        sleepQuality >= 80
            ? { text: "Well Rested", color: "bg-green-100 text-green-800" }
            : sleepQuality >= 60
                ? { text: "Moderate Sleep", color: "bg-yellow-100 text-yellow-800" }
                : { text: "Poor Sleep", color: "bg-red-100 text-red-800" };

    // Feeding Schedule (completed vs. planned)
    const completedFeeds = feeds.length;
    const totalFeedsPlanned = schedule?.feedSlots?.length || 0;
    const feedingSchedule =
        totalFeedsPlanned > 0
            ? Math.min((completedFeeds / totalFeedsPlanned) * 100, 100)
            : 0;

    const feedingBadge =
        feedingSchedule >= 80
            ? { text: "On Schedule", color: "bg-green-100 text-green-800" }
            : feedingSchedule >= 50
                ? { text: "Slightly Delayed", color: "bg-yellow-100 text-yellow-800" }
                : { text: "Missed Feeds", color: "bg-red-100 text-red-800" };

    // Activity Level (awake duration vs. total day)
    const awakeMinutes = 1440 - totalSleepMinutes;
    const activityLevel = Math.min((awakeMinutes / 1440) * 100, 100);
    const activityBadge =
        activityLevel >= 60
            ? { text: "Active", color: "bg-green-100 text-green-800" }
            : activityLevel >= 40
                ? { text: "Moderate", color: "bg-yellow-100 text-yellow-800" }
                : { text: "Low Activity", color: "bg-red-100 text-red-800" };

    // Temperature Stability (based on range)
    const temp = temperatureData?.temperature || 0;
    // const temperatureStability =
    //     temp >= 36.5 && temp <= 37.5
    //         ? 100
    //         : temp >= 37.6 && temp <= 38
    //             ? 80
    //             : temp > 38 && temp <= 39
    //                 ? 60
    //                 : temp > 39 && temp <= 40
    //                     ? 40
    //                     : 0;

    const temperatureStability =
        temp >= 36.5 && temp <= 37.5
            ? 100                      // Normal
            : temp >= 37.6 && temp <= 38
                ? 80                   // Slightly high
                : temp > 38 && temp <= 39
                    ? 60               // Mild fever
                    : temp > 39 && temp <= 40
                        ? 40           // High fever
                        : temp < 36.5 && temp >= 35
                            ? 60       // Slightly low
                            : temp < 35 && temp >= 33
                                ? 40   // Low temperature
                                : temp < 33
                                    ? 20   // Hypothermia warning
                                    : temp > 40
                                        ? 20   // Extremely high fever
                                        : 0;


    const tempBadge =
        temperatureStability >= 80
            ? { text: "Stable", color: "bg-green-100 text-green-800" }
            : temperatureStability >= 60
                ? { text: "Slightly High", color: "bg-yellow-100 text-yellow-800" }
                : temperatureStability > 0
                    ? { text: "Fever", color: "bg-red-100 text-red-800" }
                    : { text: "No Data", color: "bg-gray-100 text-gray-700" };


    const hasFever = feverEpisodes && feverEpisodes?.length > 0;
    const isNormalTemp = temperatureStability >= 80;

    const healthConditionCard = hasFever
        ? {
            icon: Thermometer,
            bg: "bg-red-100",
            color: "text-red-600",
            title: "Fever Detected",
            description: "Recent temperature readings indicate mild fever episodes.",
        }
        : isNormalTemp
            ? {
                icon: CheckCircle,
                bg: "bg-green-100",
                color: "text-green-600",
                title: "Healthy Condition",
                description: "Baby is healthy with stable temperature readings.",
            }
            : {
                icon: Activity,
                bg: "bg-yellow-100",
                color: "text-yellow-600",
                title: "Recovering",
                description: "Temperature readings show gradual recovery from fever.",
            };

    const feedingCard =
        feedingSchedule >= 80
            ? {
                icon: UtensilsCrossed,
                bg: "bg-blue-100",
                color: "text-blue-600",
                title: "Good Appetite",
                description: "Feeding is consistent with the schedule.",
            }
            : feedingSchedule >= 50
                ? {
                    icon: AlertTriangle,
                    bg: "bg-yellow-100",
                    color: "text-yellow-600",
                    title: "Slightly Low Appetite",
                    description: "Some feeds were missed or delayed.",
                }
                : {
                    icon: AlertTriangle,
                    bg: "bg-orange-100",
                    color: "text-orange-600",
                    title: "Missed Feeds",
                    description: "Feeding rate is below the expected schedule.",
                };


    const restCard =
        sleepQuality >= 80
            ? {
                icon: Moon,
                bg: "bg-purple-100",
                color: "text-purple-600",
                title: "Well Rested",
                description: "Healthy sleep pattern detected with good rest duration.",
            }
            : sleepQuality >= 60
                ? {
                    icon: Moon,
                    bg: "bg-yellow-100",
                    color: "text-yellow-600",
                    title: "Moderate Rest",
                    description: "Slightly less sleep than recommended — keep monitoring.",
                }
                : {
                    icon: Moon,
                    bg: "bg-orange-100",
                    color: "text-orange-600",
                    title: "Poor Sleep Cycle",
                    description: "Low sleep duration detected — rest pattern irregular.",
                };



    const healthMetrics = [
        { name: "Sleep Quality", value: sleepQuality, badge: sleepBadge, description: `${totalSleepHours} hrs total sleep` },
        { name: "Feeding Schedule", value: feedingSchedule, badge: feedingBadge, description: `${completedFeeds} / ${totalFeedsPlanned} feeds completed` },
        { name: "Activity Level", value: activityLevel, badge: activityBadge, description: `${awakeMinutes} mins awake today` },
        { name: "Temperature Stability", value: temperatureStability, badge: tempBadge, description: `Latest: ${temp ? temp + "°C" : "No record"}` },
    ];

    function getChartData(schedule) {
        const chartData = [];

        schedule?.feedSlots?.forEach((slot) => {
            const slotTime = new Date(slot.feedTime).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
            });

            chartData.push({
                time: slotTime,
                planned: slot.amount,
                taken: slot.activity ? slot.activity.feedAmount : 0, // Use activity if exists
            });
        });

        return chartData;
    }

    const formattedTemperatureata = Array.isArray(activities?.temperature) ? activities.temperature.flatMap(item =>
        (item?.temperature || []).map(t => ({
            time: new Date(t.date).toLocaleTimeString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }),
            temperature: t.temperature
        }))
    ) : [];

    const sleepChartData = activities?.sleep?.sleeps?.map((sleep) => ({
        date: new Date(sleep.sleepTime).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }),
        duration: sleep.duration // in minutes
    }));

    const feedChartData = getChartData(activeSchedule);

    // const feedPieChartData = activities?.feed?.reduce((acc, curr) => {
    //     const existing = acc.find((item) => item.name === curr.feedType);
    //     if (existing) existing.value += curr.feedAmount;
    //     else acc.push({ name: curr.feedType, value: curr.feedAmount });
    //     return acc;
    // }, []);
    const feedPieChartData = activities?.feed?.reduce((acc, curr) => {
        const existing = acc.find((item) => item.name === curr.feedName);
        if (existing) existing.value += curr.feedAmount;
        else acc.push({ name: curr.feedName, value: curr.feedAmount });
        return acc;
    }, []);

    const nutritionData = feedPieChartData?.map((item, i) => ({
        ...item,
        color: ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"][i % 4],
    }));

    const markFeed = () => {
        if (!selectedSlotId) return;
        const formData = {
            feedSlotId: selectedSlotId,
            actualTime: new Date()
        }
        dispatch(markFeedTaken({ setLoading, parentId: user?.id, childId, formData }))
        setSelectedSlotId(null);
    }

    const handleAddTemperature = () => {
        const combinedDateTime = new Date(`${temperatureForm.date}T${temperatureForm.time}`);

        const formData = {
            temperature: parseFloat(temperatureForm.value),
            date: combinedDateTime.toISOString()
        };

        dispatch(addTemperature({ setLoading, parentId: user?.id, childId, formData }));

        setTemperatureForm({
            value: "",
            time: "",
            date: ""
        });
        setIsTemperatureOpen(false);
    }

    const handleMarkSleep = () => {
        const combinedDateTime = new Date(`${sleepForm.date}T${sleepForm.time}`);

        const formData = {
            sleepType: sleepForm.sleepType,
            sleepTime: combinedDateTime.toISOString()
        };

        dispatch(markSleep({ setLoading, parentId: user?.id, childId, formData }));

        setSleepForm({
            sleepType: "",
            time: "",
            date: ""
        });
        setIsSleepOpen(false);
    }

    const handleMarkAwake = (sleepId) => {
        const combinedDateTime = new Date(`${sleepForm.date}T${sleepForm.time}`);

        const formData = {
            sleepId,
            awakeTime: combinedDateTime.toISOString()
        };

        dispatch(markAwake({ setLoading, parentId: user?.id, childId, formData }));

        setSleepForm({
            sleepType: "",
            time: "",
            date: ""
        });
        setIsSleepOpen(false);
    }

    const summaryCards = [healthConditionCard, feedingCard, restCard];

    const formatDate = (date) => {
        return date && format(date, 'MMM dd, yyyy | hh:mm a');
    };

    const formatDateTime = (date) => {
        return date && format(date, 'hh:mm a');
    };

    const addFeedRow = () => {
        setNewFeeds(prev => [...prev, { feedTime: "", feedType: "Breakfast", amount: "" }]);
    };

    const updateFeedRow = (index, field, value) => {
        setNewFeeds(prev => {
            const updated = [...prev];
            updated[index][field] = value;
            return updated;
        });
    };

    const removeFeedRow = (index) => {
        setNewFeeds(prev => prev.filter((_, i) => i !== index));
    };

    const handleCreateSchedule = (e) => {
        e.preventDefault();
        const formData = {
            title,
            date,
            feeds: newFeeds
        }
        console.log(formData, 'formData')
        dispatch(createSchedule({ setLoading, parentId: user?.id, childId, formData }))
        setIsCreateScheduleOpen(false);
        setTitle("");
        setDate("");
        setNewFeeds([
            { feedTime: "", feedType: "BREAKFAST", feedName: "", amount: "" }
        ])
    }

    const handleChangeSchedule = (e, scheduleId) => {
        e.preventDefault();
        dispatch(changeSchedule({ setLoading, scheduleId, parentId: user?.id, childId }));
    }



    return (
        <div className="min-h-screen w-screen bg-gradient-to-br from-pink-50 to-purple-100">
            {loading && <Loading />}
            {/* Main Content */}
            <div className="flex-1 lg:ml-0 ml-64">
                {/* Header */}
                <ParentHeader />

                {/* Banner */}
                <div className="p-4 lg:p-6 space-y-6">
                    <div className="relative h-64 lg:h-80 rounded-3xl overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white">
                            <div className="absolute inset-0 bg-black/20"></div>
                            <div className="relative px-6 py-16">
                                <div className="max-w-4xl mx-auto text-center">
                                    <div className="flex justify-center mb-4">
                                        <div className="bg-white/20 p-4 rounded-full">
                                            <TrendingUp className="h-12 w-12" />
                                        </div>
                                    </div>
                                    <h1 className="text-4xl font-bold mb-4">
                                        Baby Activities Tracker
                                    </h1>
                                    <p className="text-xl opacity-90">
                                        Monitor your baby's development, health, feed, and sleep schedules
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex justify-end mb-4">
                        {user?.role === 'parent' && (
                            <div className="flex gap-3 items-center">
                                <Button className="mt-4 flex items-center cursor-pointer bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-lg" onClick={() => setIsFeedOpen(true)}>
                                    <Baby className="w-4 h-4 mr-1" />
                                    Feeds
                                </Button>
                                <Button className="mt-4 flex items-center cursor-pointer bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-lg" onClick={() => setIsTemperatureOpen(true)}>
                                    <Thermometer className="w-4 h-4 mr-1" />
                                    Temperature
                                </Button>
                                <Button className="mt-4 flex items-center cursor-pointer bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-lg" onClick={() => setIsSleepOpen(true)}>
                                    <Bed className="w-4 h-4 mr-1" />
                                    Sleep
                                </Button>
                            </div>
                        )}
                    </div>
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-100 text-sm">Total Nap</p>
                                        <p className="text-2xl font-bold">
                                            {activities?.sleep?.summary?.totalNapSleep || 0}M
                                        </p>
                                    </div>
                                    <svg style={{ width: "32px", height: "32px" }} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M442.812 512.006m-425.502 0a425.502 425.502 0 1 0 851.004 0 425.502 425.502 0 1 0-851.004 0Z" fill="#BFDBFE"></path><path d="M533.994 874.686c-234.998 0-425.5-190.502-425.5-425.5 0-125.55 54.388-238.384 140.876-316.266C111.614 203.354 17.31 346.662 17.31 512.002c0 234.998 190.502 425.5 425.5 425.5 109.448 0 209.232-41.336 284.624-109.23-58.034 29.674-123.782 46.414-193.44 46.414z" fill="#BFDBFE"></path><path d="M528.462 757.486m-70.966 0a70.966 70.966 0 1 0 141.932 0 70.966 70.966 0 1 0-141.932 0Z" fill="#BFDBFE"></path><path d="M382.418 530.298c-33.214 0-64.44-8.152-79.552-20.77-7.34-6.13-18.252-5.144-24.38 2.192s-5.144 18.254 2.192 24.38c21.61 18.044 59.644 28.816 101.738 28.816 40.838 0 78.918-10.626 101.862-28.426a17.312 17.312 0 0 0-21.222-27.354c-16.566 12.856-48.22 21.162-80.638 21.162zM784.538 536.49c7.552-5.86 8.926-16.736 3.066-24.286-5.86-7.552-16.736-8.922-24.288-3.066-16.566 12.854-48.222 21.16-80.64 21.16-33.212 0-64.436-8.152-79.55-20.77a17.31 17.31 0 0 0-22.188 26.572c21.61 18.044 59.644 28.816 101.736 28.816 40.842 0.002 78.92-10.626 101.864-28.426zM528.46 845.752c48.676 0 88.276-39.598 88.276-88.274s-39.6-88.276-88.276-88.276c-48.676 0-88.276 39.6-88.276 88.276 0 48.676 39.6 88.274 88.276 88.274z m0-141.93c29.586 0 53.656 24.07 53.656 53.656 0 29.584-24.07 53.654-53.656 53.654s-53.656-24.07-53.656-53.654c0-29.586 24.068-53.656 53.656-53.656zM575.962 320.094a17.318 17.318 0 0 0-19.368-2.14l-75.396 40.004a17.312 17.312 0 0 0 16.23 30.582L534 369.136l-19.134 55.394a17.308 17.308 0 0 0 23.85 21.256l67.334-32.312a17.312 17.312 0 0 0-14.978-31.214l-29.944 14.37 19.944-57.736a17.31 17.31 0 0 0-5.11-18.8z" fill=""></path><path d="M759.356 202.31a17.254 17.254 0 0 0-12.754-4.05c-2.298 0.306-4.552 0.796-6.612 1.914l-107.052 56.802a17.31 17.31 0 0 0-7.176 23.406c4.478 8.44 14.958 11.662 23.406 7.176l68.226-36.204-33.192 96.096a17.31 17.31 0 0 0 24.026 21.172l95.672-47.258c30.758 58.116 47.104 123.216 47.104 190.64 0 225.076-183.112 408.188-408.188 408.188S34.62 737.078 34.62 512.002 217.734 103.81 442.81 103.81c51.89 0 102.446 9.602 150.25 28.536a17.3 17.3 0 0 0 22.466-9.718 17.306 17.306 0 0 0-9.718-22.466c-51.882-20.55-106.722-30.97-162.998-30.97C198.642 69.19 0 267.834 0 512.002c0 244.166 198.642 442.808 442.81 442.808 244.166 0 442.808-198.642 442.808-442.808 0-115.294-44.028-224.34-123.988-307.278a17.254 17.254 0 0 0-2.274-2.414c-3.602-3.082 0.854 0.732 0 0z m-28.674 116.606l24.194-70.05a409.22 409.22 0 0 1 31.482 42.546l-55.676 27.504zM1022.292 199.962c-4.138-8.62-14.482-12.248-23.096-8.118l-83.632 40.136 46.64-135.036a17.302 17.302 0 0 0-5.108-18.8 17.318 17.318 0 0 0-19.368-2.14l-135.516 71.906a17.31 17.31 0 0 0 16.23 30.582l96.694-51.304-45.832 132.694a17.308 17.308 0 0 0 23.85 21.256l121.026-58.078c8.612-4.14 12.248-14.48 8.112-23.098z" fill=""></path><path d="M658.356 144.412m-17.31 0a17.31 17.31 0 1 0 34.62 0 17.31 17.31 0 1 0-34.62 0Z" fill=""></path></g></svg>
                                    {/* <Calendar className="h-8 w-8 text-blue-200" /> */}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100 text-sm">Total Night Sleep</p>
                                        <p className="text-2xl font-bold">{activities?.sleep?.summary?.totalNightSleep || 0}M</p>
                                        {/* <p className="text-green-100 text-xs">
                      {weightPercentile}th percentile
                    </p> */}
                                    </div>
                                    <Bed className="h-8 w-8 text-green-200" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-100 text-sm">Total Sleep</p>
                                        <p className="text-2xl font-bold">{activities?.sleep?.summary?.totalSleepMinutes || 0}M</p>
                                        {/* <p className="text-purple-100 text-xs">
                      {heightPercentile}th percentile
                    </p> */}
                                    </div>
                                    <svg className="w-8 h-8" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="#E9D5FF"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path class="puchipuchi_een" d="M28.62,17.482c0.508-0.452,1.324-0.028,1.215,0.675C28.797,24.865,22.998,30,16,30 C8.268,30,2,23.732,2,16C2,8.985,7.16,3.175,13.891,2.158c0.688-0.104,1.096,0.698,0.651,1.195C12.963,5.119,12,7.445,12,10 c0,5.523,4.477,10,10,10C24.542,20,26.858,19.047,28.62,17.482z"></path> </g></svg>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-orange-100 text-sm">Latest Temperature</p>
                                        <p className="text-2xl font-bold">{activities?.temperature?.[0]?.temperature?.[0]?.temperature || 0} °C</p>
                                    </div>
                                    <Thermometer className="h-8 w-8 text-orange-200" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Tabs */}
                    <Tabs
                        value={selectedTab}
                        onValueChange={setSelectedTab}
                        className="space-y-6"
                    >
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="growth">Activities Charts</TabsTrigger>
                            <TabsTrigger value="health">Health Metrics</TabsTrigger>
                            <TabsTrigger value="infections">Health Historry</TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Growth Summary */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5" />
                                            Growth Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {healthMetrics.map((metric) => (
                                                <div key={metric.name}>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium">{metric.name}</span>
                                                        <Badge className={metric.badge.color}>{metric.badge.text}</Badge>
                                                    </div>
                                                    <Progress value={metric.value} className="h-2 mt-1" />
                                                    <p className="text-xs text-gray-600 mt-1">{metric.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Health Overview */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Heart className="h-5 w-5" />
                                            Health Overview
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`p-2 rounded-full bg-gray-100 text-green-600`}
                                                >
                                                    <Thermometer className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Temperature</p>
                                                    <p className="text-xs text-gray-600">
                                                        {activities?.temperature?.[0]?.temperature?.[0]?.temperature || 0} °C
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`p-2 rounded-full bg-gray-100 text-green-600`}
                                                >
                                                    <Baby className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Current Schedule</p>
                                                    <p className="text-xs text-gray-600">
                                                        {activities?.schedule?.find((s) => s.inUsed)?.title || "No active schedule"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`p-2 rounded-full bg-gray-100 text-blue-600`}
                                                >
                                                    <Activity className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Sleep Hours</p>
                                                    <p className="text-xs text-gray-600">
                                                        {((activities?.sleep?.summary?.totalNightSleep || 0) / 60).toFixed(1)} hrs/day
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`p-2 rounded-full bg-gray-100 text-green-600`}
                                                >
                                                    <Baby className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Feeding</p>
                                                    <p className="text-xs text-gray-600">
                                                        {activities?.schedule?.[0]?.feedSlots?.length} times/day
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Growth Charts Tab */}
                        <TabsContent value="growth" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Height Chart */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Bed className="h-5 w-5" />
                                            Sleep Chart
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={sleepChartData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="date"
                                                    tickFormatter={(dateStr) =>
                                                        new Date(dateStr).toLocaleDateString("en-GB", {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric",
                                                        })
                                                    }
                                                />
                                                <YAxis label={{ value: "Minutes", angle: -90, position: "insideLeft" }} />
                                                <Tooltip
                                                    formatter={(value) => [`${value} min`, "Night Sleep"]}
                                                    labelFormatter={(label) => `Sleep Night of ${label}`}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="duration"
                                                    stroke="#8884d8"
                                                    strokeWidth={3}
                                                    dot={{ fill: "#8884d8", strokeWidth: 2, r: 6 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                {/* Weight Chart */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Baby className="h-5 w-5" />
                                            Feed Chart
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <AreaChart data={feedChartData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="time"
                                                />
                                                <YAxis label={{ value: "Feed (ml)", angle: -90, position: "insideLeft" }} />
                                                <Tooltip
                                                    formatter={(value, name) => [`${value} ml`, name]}
                                                    labelFormatter={(time) => `Time: ${time}`}
                                                />
                                                <Legend />
                                                <Area
                                                    type="monotone"
                                                    dataKey="planned"
                                                    name="Planned Feed"
                                                    stroke="#82ca9d"
                                                    fill="#82ca9d"
                                                    fillOpacity={0.3}
                                                    strokeWidth={3}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="taken"
                                                    name="Taken Feed"
                                                    stroke="#82ca9d"
                                                    fill="#82ca9d"
                                                    fillOpacity={0.3}
                                                    strokeWidth={2}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Thermometer className="h-5 w-5" />
                                        Temperature Chart
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={formattedTemperatureata}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="time" />
                                            <YAxis label={{ value: "°C", angle: -90, position: "insideLeft" }} />
                                            <Tooltip
                                                formatter={(value) => [`${value} °C`, "Temperature"]}
                                                labelFormatter={(time) => `Time: ${time}`}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="temperature"
                                                stroke="#FF7F50"
                                                fill="#FF7F50"
                                                fillOpacity={0.3}
                                                strokeWidth={2}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Growth Percentiles */}
                            {/* <Card>
                                <CardHeader>
                                    <CardTitle>Growth Percentiles Over Time</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <LineChart data={growths}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={(dateStr) =>
                                                    new Date(dateStr).toLocaleDateString("en-GB", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                    })
                                                }
                                            />
                                            <YAxis />
                                            <Tooltip
                                                labelFormatter={(dateStr) =>
                                                    new Date(dateStr).toLocaleDateString("en-GB", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                    })
                                                }
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="height"
                                                stroke="#8884d8"
                                                strokeWidth={2}
                                                name="Height"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="weight"
                                                stroke="#82ca9d"
                                                strokeWidth={2}
                                                name="Weight"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card> */}
                        </TabsContent>

                        {/* Health Metrics Tab */}
                        <TabsContent value="health" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div
                                                className={`p-3 rounded-full bg-gray-100 text-green-600`}
                                            >
                                                <Thermometer className="h-6 w-6" />
                                            </div>
                                            {/* <Badge
                                                    variant={
                                                        metric.status === "normal" ? "default" : "secondary"
                                                    }
                                                >
                                                    {metric.status}
                                                </Badge> */}
                                        </div>
                                        <h3 className="font-semibold text-lg">Temperature</h3>
                                        <p className="text-2xl font-bold">
                                            {activities?.temperature?.[0]?.temperature?.[0]?.temperature || 0}{" "}
                                            <span className="text-sm font-normal text-gray-600">
                                                °C
                                            </span>
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div
                                                className={`p-3 rounded-full bg-gray-100 text-green-600`}
                                            >
                                                <Baby className="h-6 w-6" />
                                            </div>
                                        </div>
                                        <h3 className="font-semibold text-lg">Current Schedule</h3>
                                        <p className="text-2xl font-bold">
                                            {activeSchedule?.title}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div
                                                className={`p-3 rounded-full bg-gray-100 text-green-600`}
                                            >
                                                <Activity className="h-6 w-6" />
                                            </div>
                                        </div>
                                        <h3 className="font-semibold text-lg">Sleep Hours</h3>
                                        <p className="text-2xl font-bold">
                                            {activities?.sleep?.summary?.totalNightSleep}{" "}
                                            <span className="text-sm font-normal text-gray-600">
                                                hrs/day
                                            </span>
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div
                                                className={`p-3 rounded-full bg-gray-100 text-green-600`}
                                            >
                                                <Baby className="h-6 w-6" />
                                            </div>
                                        </div>
                                        <h3 className="font-semibold text-lg">Feeding</h3>
                                        <p className="text-2xl font-bold">
                                            {activities?.schedule?.[0]?.feedSlots?.length}{" "}
                                            <span className="text-sm font-normal text-gray-600">
                                                times/day
                                            </span>
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Nutrition Breakdown */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Nutrition Breakdown</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {nutritionData?.length ? (
                                            <ResponsiveContainer width="100%" height={300}>
                                                <PieChart>
                                                    <Pie
                                                        data={nutritionData}
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={80}
                                                        // fill="#8884d8"
                                                        dataKey="value"
                                                        label={({ name, value }) => `${name}: ${value}ml`}
                                                    >
                                                        {nutritionData?.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip formatter={(value) => `${value} ml`} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="text-sm text-gray-500">
                                                No Data to Show
                                            </div>
                                        )}

                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Daily Health Metrics</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {healthMetrics?.map((metric, index) => (
                                                <div key={index} className="flex justify-between items-center">
                                                    <span className="text-sm font-medium">
                                                        {metric?.name}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <Progress value={metric?.value?.toFixed()} className="w-20 h-2" />
                                                        <span className="text-sm">{metric?.value?.toFixed()}%</span>
                                                    </div>
                                                </div>
                                            ))}

                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="infections" className="space-y-6">
                            <Tabs defaultValue="feeds" className="space-y-4">
                                <TabsList>
                                    <TabsTrigger value="feeds">Feeds</TabsTrigger>
                                    <TabsTrigger value="sleep">Sleep</TabsTrigger>
                                    <TabsTrigger value="temperature">Temperature</TabsTrigger>
                                </TabsList>

                                {/* FEEDS */}
                                <TabsContent value="feeds">
                                    <div className="bg-white rounded-lg shadow-md p-4 w-full overflow-x-auto">
                                        <Table className="w-full table-fixed">
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-1/4">Scheduled Time</TableHead>
                                                    <TableHead className="w-1/4">Feed Taken Time</TableHead>
                                                    <TableHead className="w-1/4">Type</TableHead>
                                                    <TableHead className="w-1/4">Name</TableHead>
                                                    <TableHead className="w-1/4">Amount (ml)</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {activeSchedule?.feedSlots?.length > 0 ? (
                                                    activeSchedule.feedSlots.map((slot) => (
                                                        <TableRow key={slot.id}>
                                                            {/* Scheduled time */}
                                                            <TableCell>{formatDateTime(slot.feedTime)}</TableCell>

                                                            {/* Actual feed time if taken */}
                                                            <TableCell>
                                                                {slot.activity?.feedTime ? formatDateTime(slot.activity.feedTime) : "-"}
                                                            </TableCell>

                                                            <TableCell>{slot.feedType}</TableCell>
                                                            <TableCell>{slot.feedName}</TableCell>
                                                            <TableCell>{slot.amount}</TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-center">
                                                            No feed data available
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                </TabsContent>

                                {/* SLEEP */}
                                <TabsContent value="sleep">
                                    <div className="bg-white rounded-lg shadow-md p-4 w-full overflow-x-auto">
                                        <Table className="w-full table-fixed">
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-1/4">Sleep Type</TableHead>
                                                    <TableHead className="w-1/4">Sleep Time</TableHead>
                                                    <TableHead className="w-1/4">Awake Time</TableHead>
                                                    <TableHead className="w-1/4">Duration (min)</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {sleeps?.length > 0 ? (
                                                    sleeps?.map((s) => (
                                                        <TableRow key={s.id}>
                                                            <TableCell>{s.sleepType}</TableCell>
                                                            <TableCell>{formatDateTime(s.sleepTime)}</TableCell>
                                                            <TableCell>{s.awakeTime ? formatDateTime(s.awakeTime) : "-"}</TableCell>
                                                            <TableCell>{s.duration || "-"}</TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-center">
                                                            No sleep data available
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                </TabsContent>

                                {/* TEMPERATURE */}
                                <TabsContent value="temperature">
                                    <div className="bg-white rounded-lg shadow-md p-4 w-full overflow-x-auto">
                                        <Table className="w-full table-fixed">
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-1/2">Date</TableHead>
                                                    <TableHead className="w-1/2">Temperature (°C)</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {activities?.temperature?.length > 0 ? (
                                                    activities?.temperature?.map((t, idx) => (
                                                        <TableRow key={idx}>
                                                            <TableCell>
                                                                {t.temperature?.[0]?.date ? formatDate(t.temperature[0].date) : "-"}
                                                            </TableCell>
                                                            <TableCell>{t.temperature?.[0]?.temperature || "-"}</TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={2} className="text-center">
                                                            No temperature data available
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                </TabsContent>
                            </Tabs>
                        </TabsContent>

                        {/* <TabsContent value="infections" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5" />
                                        Health History & Infections
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {feverEpisodes?.map((infection, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className={`p-3 rounded-full ${infection.status === "Recovered"
                                                            ? "bg-green-100"
                                                            : "bg-yellow-100"
                                                            }`}
                                                    >
                                                        {infection.status === "Recovered" ? (
                                                            <CheckCircle className="h-6 w-6 text-green-600" />
                                                        ) : (
                                                            <AlertTriangle className="h-6 w-6 text-yellow-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold">{infection.title}</h4>
                                                        <p className="text-sm text-gray-600">
                                                            {infection.date} • {infection.severity} severity •
                                                            Duration: {infection.duration}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge
                                                    variant={
                                                        infection.status === "Recovered"
                                                            ? "success"
                                                            : "default"
                                                    }
                                                >
                                                    {infection.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card>
                                    <CardContent className="p-6 text-center">
                                        <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                            <CheckCircle className="h-8 w-8 text-green-600" />
                                        </div>
                                        <h3 className="font-semibold text-lg mb-2">
                                            No Active Infections
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Baby is currently healthy with no ongoing health issues
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6 text-center">
                                        <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                            <Heart className="h-8 w-8 text-blue-600" />
                                        </div>
                                        <h3 className="font-semibold text-lg mb-2">
                                            Strong Immunity
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Quick recovery from minor infections shows good immune
                                            system
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6 text-center">
                                        <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                            <Activity className="h-8 w-8 text-purple-600" />
                                        </div>
                                        <h3 className="font-semibold text-lg mb-2">
                                            Regular Checkups
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Maintaining regular pediatric visits for preventive care
                                        </p>
                                    </CardContent>
                                </Card>

                                {summaryCards?.map((card, i) => (
                                    <Card key={i}>
                                        <CardContent className="p-6 text-center">
                                            <div className={`${card.bg} p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center`}>
                                                <card.icon className={`h-8 w-8 ${card.color}`} />
                                            </div>
                                            <h3 className="font-semibold text-lg mb-2">{card.title}</h3>
                                            <p className="text-sm text-gray-600">{card.description}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent> */}
                    </Tabs>
                </div>
            </div>
            {user?.role === 'parent' && (
                <>
                    <Dialog open={isSleepOpen} onOpenChange={setIsSleepOpen}>
                        <DialogContent className="sm:max-w-md rounded-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-bold">
                                    {sleeps?.find(s => s.awakeTime === null) ? "Mark Baby Awake" : "Mark Baby Sleep"}
                                </DialogTitle>
                            </DialogHeader>

                            <form className="mt-4 space-y-4" onSubmit={(e) => {
                                e.preventDefault();
                                const ongoingSleep = sleeps?.find(s => s.awakeTime === null);
                                if (ongoingSleep) {
                                    handleMarkAwake(ongoingSleep?.id);
                                } else {
                                    handleMarkSleep();
                                }
                            }}>
                                {sleeps?.find(s => s.awakeTime === null) ? (
                                    // Baby is sleeping → show awake time input
                                    <>
                                        <div className="flex items-center gap-5">
                                            <h3>Baby Sleep Time:</h3>
                                            <h3>
                                                {new Date(sleeps?.find(s => s.awakeTime === null)?.sleepTime).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </h3>
                                        </div>
                                        <div>
                                            <Label className="mb-2" htmlFor="date">Date</Label>
                                            <Input
                                                id="date"
                                                type="date"
                                                value={sleepForm.date || ""}
                                                onChange={(e) => setSleepForm({ ...sleepForm, date: e.target.value })}
                                                required
                                            />
                                        </div>

                                        {/* Time */}
                                        <div>
                                            <Label className="mb-2" htmlFor="time">Time</Label>
                                            <Input
                                                id="time"
                                                type="time"
                                                value={sleepForm.time || ""}
                                                onChange={(e) => setSleepForm({ ...sleepForm, time: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Sleep Type */}
                                        <div>
                                            <Label className="mb-2" htmlFor="sleepType">Sleep Type</Label>
                                            <Select
                                                value={sleepForm.sleepType}
                                                onValueChange={(value) => setSleepForm({ ...sleepForm, sleepType: value })}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select sleep type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="NIGHT">Night</SelectItem>
                                                    <SelectItem value="NAP">Nap</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Date */}
                                        <div>
                                            <Label className="mb-2" htmlFor="date">Date</Label>
                                            <Input
                                                id="date"
                                                type="date"
                                                value={sleepForm.date || ""}
                                                onChange={(e) => setSleepForm({ ...sleepForm, date: e.target.value })}
                                                required
                                            />
                                        </div>

                                        {/* Time */}
                                        <div>
                                            <Label className="mb-2" htmlFor="time">Time</Label>
                                            <Input
                                                id="time"
                                                type="time"
                                                value={sleepForm.time || ""}
                                                onChange={(e) => setSleepForm({ ...sleepForm, time: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </>
                                )}
                                {/* <div>
                                    <Label className="mb-2" htmlFor="temperature">Sleep Type</Label>
                                    <Select
                                        value={sleepForm.sleepType}
                                        onValueChange={(value) => setSleepForm({ ...sleepForm, sleepType: value })}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select sleep type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="NIGHT">Night</SelectItem>
                                            <SelectItem value="NAP">Nap</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="mb-2" htmlFor="date">Date</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={sleepForm.date}
                                        onChange={(e) => setSleepForm({ ...sleepForm, date: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label className="mb-2" htmlFor="time">Time</Label>
                                    <Input
                                        id="time"
                                        type="time"
                                        value={sleepForm.time}
                                        onChange={(e) => setSleepForm({ ...sleepForm, time: e.target.value })}
                                        required
                                    />
                                </div> */}

                                {/* Buttons */}
                                <div className="flex justify-end gap-2 mt-2">
                                    <Button variant="outline" onClick={() => setIsSleepOpen(false)}>Cancel</Button>
                                    <Button
                                        type="submit"
                                        className="bg-green-500 text-white"
                                    >
                                        Confirm
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isTemperatureOpen} onOpenChange={setIsTemperatureOpen}>
                        <DialogContent className="sm:max-w-md rounded-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-bold">Add your baby's temperature</DialogTitle>
                            </DialogHeader>

                            <form className="mt-4 space-y-4" onSubmit={(e) => {
                                e.preventDefault();
                                handleAddTemperature();
                            }}>
                                {/* Temperature input */}
                                <div>
                                    <Label className="mb-2" htmlFor="temperature">Temperature (°C)</Label>
                                    <Input
                                        id="temperature"
                                        type="number"
                                        step="0.1"
                                        min="30"
                                        max="45"
                                        value={temperatureForm.value}
                                        onChange={(e) => setTemperatureForm({ ...temperatureForm, value: e.target.value })}
                                        placeholder="e.g. 37.5"
                                        required
                                    />
                                </div>

                                {/* Date input */}
                                <div>
                                    <Label className="mb-2" htmlFor="date">Date</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={temperatureForm.date}
                                        onChange={(e) => setTemperatureForm({ ...temperatureForm, date: e.target.value })}
                                        required
                                    />
                                </div>

                                {/* Time input */}
                                <div>
                                    <Label className="mb-2" htmlFor="time">Time</Label>
                                    <Input
                                        id="time"
                                        type="time"
                                        value={temperatureForm.time}
                                        onChange={(e) => setTemperatureForm({ ...temperatureForm, time: e.target.value })}
                                        required
                                    />
                                </div>

                                {/* Buttons */}
                                <div className="flex justify-end gap-2 mt-2">
                                    <Button variant="outline" onClick={() => setIsTemperatureOpen(false)}>Cancel</Button>
                                    <Button
                                        type="submit"
                                        className="bg-green-500 text-white"
                                    >
                                        Confirm
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isCreateScheduleOpen} onOpenChange={setIsCreateScheduleOpen}>
                        <DialogContent className="sm:max-w-lg rounded-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-bold">Create New Schedule</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4">
                                {/* Title */}
                                <div>
                                    <Label className="mb-2">Schedule Title</Label>
                                    <Input
                                        placeholder="Daily Milk Routine"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>

                                {/* Date */}
                                <div>
                                    <Label className="mb-2">Date</Label>
                                    <Input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                </div>

                                {/* Feed Rows */}
                                <div>
                                    <Label className="font-semibold">Feeds</Label>

                                    {newFeeds?.map((feed, index) => (
                                        <div
                                            key={index}
                                            className="relative grid grid-cols-4 gap-3 p-3 border rounded-lg mt-2 bg-gray-50"
                                        >
                                            {/* Time */}
                                            <div>
                                                <Label className="text-xs">Time</Label>
                                                <Input
                                                    type="time"
                                                    value={feed.feedTime}
                                                    onChange={(e) => updateFeedRow(index, "feedTime", e.target.value)}
                                                />
                                            </div>

                                            {/* Feed Type */}
                                            <div>
                                                <Label className="text-xs">Feed Type</Label>
                                                <Select
                                                    value={feed.feedType}
                                                    onValueChange={(val) => updateFeedRow(index, "feedType", val)}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select Type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="BREAKFAST">Breakfast</SelectItem>
                                                        <SelectItem value="LUNCH">Lunch</SelectItem>
                                                        <SelectItem value="DINNER">Dinner</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Name */}
                                            <div>
                                                <Label className="text-xs">Name</Label>
                                                <Input
                                                    type="text"
                                                    value={feed.feedName}
                                                    onChange={(e) => updateFeedRow(index, "feedName", e.target.value)}
                                                />
                                            </div>

                                            {/* Amount */}
                                            <div>
                                                <Label className="text-xs">Amount</Label>
                                                <Input
                                                    type="number"
                                                    value={feed.amount}
                                                    onChange={(e) => updateFeedRow(index, "amount", e.target.value)}
                                                />
                                            </div>

                                            {newFeeds?.length > 1 && (
                                                <Button
                                                    variant="outline"
                                                    className="absolute top-0 right-0 h-6 w-6 p-0 text-red-500"
                                                    onClick={() => removeFeedRow(index)}
                                                >
                                                    &times;
                                                </Button>
                                            )}
                                        </div>
                                    ))}

                                    {/* Add Feed Button */}
                                    <Button
                                        variant="outline"
                                        className="w-full mt-3"
                                        onClick={addFeedRow}
                                    >
                                        + Add Feed
                                    </Button>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateScheduleOpen(false)}>Cancel</Button>
                                <Button className="bg-green-600 text-white" onClick={(e) => handleCreateSchedule(e)}>Create</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isFeedOpen} onOpenChange={setIsFeedOpen}>
                        <DialogContent className="sm:max-w-md rounded-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-bold">Select Feed to Mark as Taken</DialogTitle>
                            </DialogHeader>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-sm font-medium">Change Schedule</Label>
                                    <Select
                                        value={selectedScheduleId}
                                        onValueChange={(value) => setSelectedScheduleId(value)}
                                    >
                                        <SelectTrigger className="w-full mt-1">
                                            <SelectValue placeholder="Select schedule" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {activities?.schedule?.map((sch) => (
                                                <SelectItem key={sch.id} value={sch.id}>
                                                    {sch.title} {sch.inUsed ? "(Active)" : ""}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {selectedScheduleId && selectedScheduleId !== activeSchedule?.id ? (
                                    // DIFFERENT → show Change
                                    <Button
                                        className="flex items-center cursor-pointer bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-lg"
                                        onClick={(e) => handleChangeSchedule(e, selectedScheduleId)}
                                    >
                                        <Baby className="w-4 h-4 mr-1" />
                                        Change
                                    </Button>
                                ) : (
                                    // SAME or NO SCHEDULE → show Create New
                                    <Button
                                        className="flex items-center cursor-pointer bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-lg"
                                        onClick={() => {
                                            setIsCreateScheduleOpen(true);
                                            setIsFeedOpen(false);
                                        }}
                                    >
                                        <Baby className="w-4 h-4 mr-1" />
                                        Create New
                                    </Button>
                                )}
                            </div>

                            {/* <RadioGroup
                                value={selectedSlotId || ""}
                                onValueChange={setSelectedSlotId}
                                className="space-y-2"
                            >
                                {activities?.schedule?.length > 0 ? (
                                    <>
                                        {(() => {
                                            const activeSchedule = activities?.schedule?.find(s => s.inUsed);

                                            if (!activeSchedule) {
                                                return <p className="text-gray-500">No active schedule found.</p>;
                                            }

                                            return (
                                                <RadioGroup
                                                    value={selectedSlotId || ""}
                                                    onValueChange={setSelectedSlotId}
                                                    className="space-y-2"
                                                >
                                                    {activeSchedule?.feedSlots?.map(slot => {
                                                        const isTaken = !!slot?.activity?.id;
                                                        return (
                                                            <div
                                                                key={slot.id}
                                                                className={`flex items-center justify-between p-2 border rounded-md ${isTaken ? "bg-green-50 border-green-300" : "bg-white border-gray-300"
                                                                    }`}
                                                            >
                                                                {!isTaken && <RadioGroupItem value={slot.id} />}
                                                                <div className="ml-2 flex justify-between w-full items-center">
                                                                    <span>{slot?.feedTime && formatDate(slot.feedTime)} - {slot.feedType}</span>
                                                                    <span
                                                                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${isTaken ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                                                            }`}
                                                                    >
                                                                        {isTaken ? "Taken" : "Pending"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </RadioGroup>
                                            );
                                        })()}
                                    </>
                                ) : (
                                    <p className="text-gray-500">No schedules available.</p>
                                )}

                            </RadioGroup> */}

                            {/* <RadioGroup
                                value={selectedSlotId || ""}
                                onValueChange={setSelectedSlotId}
                                className="space-y-2"
                            >
                                {activities?.schedule?.length > 0 ? (
                                    (() => {
                                        // Find the schedule that matches the selected ID
                                        const selectedSchedule = activities?.schedule?.find(
                                            (s) => s.id === selectedScheduleId
                                        );

                                        if (!selectedSchedule) {
                                            return <p className="text-gray-500">No schedule selected.</p>;
                                        }

                                        const groupedSlots = {
                                            BREAKFAST: [],
                                            LUNCH: [],
                                            DINNER: [],
                                        };

                                        selectedSchedule.feedSlots?.forEach((slot) => {
                                            groupedSlots[slot.feedType]?.push(slot);
                                        });

                                        return (
                                            <div className="space-y-2">
                                                {selectedSchedule.feedSlots?.map((slot) => {
                                                    const isTaken = !!slot?.activity?.id;

                                                    return (
                                                        <div
                                                            key={slot.id}
                                                            className={`flex items-center justify-between p-2 border rounded-md ${isTaken
                                                                ? "bg-green-50 border-green-300"
                                                                : "bg-white border-gray-300"
                                                                }`}
                                                        >
                                                            {selectedSchedule.inUsed && !isTaken && (
                                                                <RadioGroupItem value={slot.id} />
                                                            )}

                                                            <div className="ml-2 flex justify-between w-full items-center">
                                                                <span>
                                                                    {slot?.feedTime && formatDateTime(slot.feedTime)} - {slot.feedType} - {slot.feedName}
                                                                </span>
                                                                <span
                                                                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${isTaken
                                                                        ? "bg-green-100 text-green-800"
                                                                        : "bg-yellow-100 text-yellow-800"
                                                                        }`}
                                                                >
                                                                    {isTaken ? "Taken" : "Pending"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })()
                                ) : (
                                    <p className="text-gray-500">No schedules available.</p>
                                )}
                            </RadioGroup> */}

                            <RadioGroup
                                value={selectedSlotId || ""}
                                onValueChange={setSelectedSlotId}
                                className="space-y-4"
                            >
                                {activities?.schedule?.length > 0 ? (
                                    (() => {
                                        const selectedSchedule = activities?.schedule?.find(
                                            (s) => s.id === selectedScheduleId
                                        );

                                        if (!selectedSchedule) {
                                            return <p className="text-gray-500">No schedule selected.</p>;
                                        }

                                        // Group feed slots by type
                                        const groupedSlots = {
                                            BREAKFAST: [],
                                            LUNCH: [],
                                            DINNER: [],
                                        };

                                        selectedSchedule.feedSlots?.forEach((slot) => {
                                            groupedSlots[slot.feedType]?.push(slot);
                                        });

                                        return (
                                            <div className="space-y-6">
                                                {["BREAKFAST", "LUNCH", "DINNER"].map((type) => (
                                                    <div key={type}>
                                                        {/* Group Title */}
                                                        <h3 className="font-semibold text-gray-700 mb-2">{type}</h3>

                                                        {/* Empty message */}
                                                        {groupedSlots[type].length === 0 && (
                                                            <p className="text-sm text-gray-500 ml-2">
                                                                No {type.toLowerCase()} slots
                                                            </p>
                                                        )}

                                                        {/* Render Slots */}
                                                        <div className="space-y-2">
                                                            {groupedSlots[type].map((slot) => {
                                                                const isTaken = !!slot?.activity?.id;

                                                                return (
                                                                    <div
                                                                        key={slot.id}
                                                                        className={`flex items-center justify-between p-2 border rounded-md ${isTaken
                                                                                ? "bg-green-50 border-green-300"
                                                                                : "bg-white border-gray-300"
                                                                            }`}
                                                                    >
                                                                        {/* Show radio only if schedule active and slot is pending */}
                                                                        {selectedSchedule.inUsed && !isTaken && (
                                                                            <RadioGroupItem value={slot.id} />
                                                                        )}

                                                                        <div className="ml-2 flex justify-between w-full items-center">
                                                                            <span>
                                                                                {slot.feedTime && formatDateTime(slot.feedTime)}
                                                                                {" - "}
                                                                                {slot.feedName}
                                                                            </span>

                                                                            <span
                                                                                className={`text-xs font-medium px-2 py-0.5 rounded-full ${isTaken
                                                                                        ? "bg-green-100 text-green-800"
                                                                                        : "bg-yellow-100 text-yellow-800"
                                                                                    }`}
                                                                            >
                                                                                {isTaken ? "Taken" : "Pending"}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })()
                                ) : (
                                    <p className="text-gray-500">No schedules available.</p>
                                )}
                            </RadioGroup>


                            <div className="mt-4 flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsFeedOpen(false)}>Cancel</Button>
                                {selectedSlotId && (
                                    <Button
                                        className="bg-green-500 text-white"
                                        onClick={markFeed}
                                        disabled={!selectedSlotId}
                                    >
                                        Confirm
                                    </Button>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </>

            )}
        </div>
    );
}
