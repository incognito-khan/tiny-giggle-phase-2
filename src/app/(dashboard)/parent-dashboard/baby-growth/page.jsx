"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  getLatestGrowth,
  createGrowth,
  getAllGrowths,
} from "@/store/slices/growthSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import Loading from "@/components/loading";
import ParentHeader from "@/components/layout/header/parent-header";
import { getAllMilestonesWithSubForChild } from "@/store/slices/milestoneSlice";
import { getAllChildVaccinations } from "@/store/slices/vaccinationSlice";
import { getLatestActivities } from "@/store/slices/activitySlice";

export default function GrowthPage() {
  const user = useSelector((state) => state.auth.user);
  const childId = useSelector((state) => state.child.childId);
  const activities = useSelector((state) => state.activity.activities);
  console.log(activities, 'activities');
  const milestones = useSelector((state) => state.milestone.milestones);
  const vaccinations = useSelector((state) => state.vaccination.vaccinations);
  const growth = useSelector((state) => state.growth.growth);
  const growths = useSelector((state) => state.growth.growths);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [isAddGrowthOpen, setIsAddGrowthOpen] = useState(false);
  const [formData, setFormData] = useState({
    weight: "",
    height: "",
    date: ""
  })
  const dispatch = useDispatch();

  const gettingLatestGrowths = () => {
    dispatch(getLatestGrowth({ setLoading, parentId: user?.id, childId }));
  };
  const gettingAllGrowths = () => {
    dispatch(getAllGrowths({ setLoading, parentId: user?.id, childId }));
  };

  const gettingAllMilestones = () => {
    dispatch(getAllMilestonesWithSubForChild({ setLoading, parentId: user?.id, childId }))
  }

  const gettingAllVaccinations = () => {
    dispatch(getAllChildVaccinations({ setLoading, parentId: user?.id, childId }))
  }

  const gettingLatestActivities = () => {
    dispatch(getLatestActivities({ setLoading, parentId: user?.id, childId }));
  }

  useEffect(() => {
    gettingLatestGrowths();
    gettingAllGrowths();
    gettingAllMilestones();
    gettingAllVaccinations();
    gettingLatestActivities();
  }, []);

  // const getHeightPercentile = (h) => {
  //   if (h === 0) return 0;
  //   if (h < 20) return 40;
  //   if (h < 25) return 60;
  //   if (h < 30) return 75;
  //   return 80;
  // };

  const getHeightPercentile = (height, ageMonths) => {
    if (!height || !ageMonths) return null;

    // Approximate WHO reference for height (cm)
    // Average baby growth per age bracket (rough median values)
    const avgHeights = [
      { age: 0, p3: 45, p50: 50, p97: 55 },
      { age: 6, p3: 61, p50: 67, p97: 73 },
      { age: 12, p3: 70, p50: 76, p97: 82 },
      { age: 18, p3: 76, p50: 82, p97: 88 },
      { age: 24, p3: 80, p50: 87, p97: 94 },
    ];

    // Find closest age data
    const ref = avgHeights.reduce((prev, curr) =>
      Math.abs(curr.age - ageMonths) < Math.abs(prev.age - ageMonths) ? curr : prev
    );

    if (height < ref.p3) return 3;
    if (height < ref.p50) return 50 - Math.round(((ref.p50 - height) / (ref.p50 - ref.p3)) * 47);
    if (height < ref.p97) return 50 + Math.round(((height - ref.p50) / (ref.p97 - ref.p50)) * 47);
    return 97;
  };

  // const getWeightPercentile = (w) => {
  //   if (w === 0) return 0;
  //   if (w < 15) return 40;
  //   if (w < 18) return 65;
  //   if (w < 20) return 75;
  //   return 85;
  // };

  const getAgeInMonths = (age) => {
    if (!age) return 0;
    const { years = 0, months = 0, days = 0 } = age;
    return years * 12 + months + days / 30;
  };

  const getExpectedGrowth = (ageMonths, gender) => {
    // Approximate WHO averages — simplified for practical use
    const boy = {
      height: 50 + ageMonths * 1.2, // newborn ~50cm, gain ~1.2cm/month
      weight: 3.3 + ageMonths * 0.25, // newborn ~3.3kg, gain ~0.25kg/month
    };
    const girl = {
      height: 49 + ageMonths * 1.1,
      weight: 3.2 + ageMonths * 0.22,
    };

    if (gender?.toUpperCase() === "BOY") return boy;
    return girl;
  };

  const getHealthStatus = () => {
    // Milestone Progress
    const totalSubMilestones = milestones.reduce(
      (acc, m) => acc + (m.subMilestones?.length || 0),
      0
    );
    const completedSubMilestones = milestones.reduce(
      (acc, m) =>
        acc + m.subMilestones.filter((s) => s.isCompleted).length,
      0
    );
    const milestoneProgress =
      totalSubMilestones > 0
        ? (completedSubMilestones / totalSubMilestones) * 100
        : 0;

    // Vaccination Progress
    const totalVaccinations = vaccinations.length;
    const takenVaccinations = vaccinations.filter(
      (v) => v.status === "TAKEN"
    ).length;
    const vaccinationProgress =
      totalVaccinations > 0
        ? (takenVaccinations / totalVaccinations) * 100
        : 0;

    // Growth Progress
    const ageMonths = getAgeInMonths(growths?.[0]?.age);
    const gender = growths?.[0]?.type;
    const expected = getExpectedGrowth(ageMonths, gender);

    const currentHeight = growth?.height || 0;
    const currentWeight = growth?.weight || 0;

    const heightScore = (currentHeight / expected.height) * 100;
    const weightScore = (currentWeight / expected.weight) * 100;
    const growthScore = (heightScore + weightScore) / 2;

    // Final Weighted Health Score
    const overall =
      milestoneProgress * 0.4 +
      vaccinationProgress * 0.3 +
      growthScore * 0.3;

    // Determine Health Status
    if (overall >= 85) return "Excellent";
    if (overall >= 70) return "Good";
    if (overall >= 50) return "Average";
    return "Needs Attention";
  };

  const healthStatus = getHealthStatus();

  const ageMonths = getAgeInMonths(growths?.[0]?.age);

  const getWeightPercentile = (weight, ageMonths) => {
    if (!weight || !ageMonths) return null;

    // Approximate WHO reference for weight (kg)
    const avgWeights = [
      { age: 0, p3: 2.5, p50: 3.3, p97: 4.4 },
      { age: 6, p3: 5.8, p50: 7.9, p97: 9.8 },
      { age: 12, p3: 7.8, p50: 9.6, p97: 11.8 },
      { age: 18, p3: 8.8, p50: 10.9, p97: 13.2 },
      { age: 24, p3: 9.8, p50: 12.2, p97: 14.7 },
    ];

    const ref = avgWeights.reduce((prev, curr) =>
      Math.abs(curr.age - ageMonths) < Math.abs(prev.age - ageMonths) ? curr : prev
    );

    if (weight < ref.p3) return 3;
    if (weight < ref.p50) return 50 - Math.round(((ref.p50 - weight) / (ref.p50 - ref.p3)) * 47);
    if (weight < ref.p97) return 50 + Math.round(((weight - ref.p50) / (ref.p97 - ref.p50)) * 47);
    return 97;
  };

  const weightPercentile = getWeightPercentile(growth?.height || 0, ageMonths || 0);
  const heightPercentile = getHeightPercentile(growth?.weight || 0, ageMonths || 0);

  const formatAge = (age) => {
    const parts = [];
    if (age?.years > 0)
      parts.push(`${age?.years} year${age?.years > 1 ? "s" : ""}`);
    if (age?.months > 0)
      parts.push(`${age?.months} month${age?.months > 1 ? "s" : ""}`);
    if (age?.days > 0) parts.push(`${age?.days} day${age?.days > 1 ? "s" : ""}`);
    return parts.length > 0 ? parts.join(" ") : "0 days";
  };




  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddRecord = (e) => {
    e.preventDefault();

    const { height, weight, date } = formData;

    // 🔹 Validation
    if (!height || !weight) {
      toast.error("Please fill in all fields.");
      return;
    }

    // if (!isValidISODate(date)) {
    //   toast.error("Date must be in ISO format (YYYY-MM-DD).");
    //   return;
    // }

    if (isNaN(Number(height)) || Number(height) <= 0) {
      toast.error("Height must be a valid positive number.");
      return;
    }

    if (isNaN(Number(weight)) || Number(weight) <= 0) {
      toast.error("Weight must be a valid positive number.");
      return;
    }

    const body = {
      ...formData,
      weight: parseFloat(formData.weight),
      height: parseFloat(formData.height)
    }
    console.log(body, 'body from handleAddRecord');
    dispatch(createGrowth({ parentId: user?.id, setLoading, childId, formData: body }))
    setIsAddGrowthOpen(false);
    setFormData({
      weight: "",
      height: "",
      date: ""
    });
  }

  const calculateBMI = (weight, height) => {
    const heightM = height / 100;
    const bmi = weight / (heightM * heightM)

    return bmi.toFixed(2);
  }

  const getBMIStatus = (bmi) => {
    if (!bmi) return;

    if (bmi < 18.5) {
      return "Underweight";
    } else if (bmi >= 18.5 && bmi < 24.9) {
      return "Normal Weight";
    } else if (bmi >= 25 && bmi < 29.9) {
      return "Overweight";
    } else if (bmi >= 30) {
      return "Obese";
    } else {
      return "Invalid BMI";
    }
  };

  const calculatePI = (weight, height) => {
    if (!weight || !height) return null;

    // Convert height from cm → meters
    const heightM = height / 100;

    // Apply formula
    const pi = weight / Math.pow(heightM, 3);

    // Round to 2 decimals
    return pi.toFixed(2);
  };

  const getPIStatus = (pi) => {
    if (!pi) return "";

    if (pi < 21) return "Underweight";
    if (pi >= 21 && pi <= 26) return "Healthy";
    if (pi > 26) return "Overweight";

    return "Unknown";
  };

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

  function getHealthMetrics(activities) {
    const feeds = activities?.feed || [];
    const schedule = activities?.schedule;
    const sleepSummary = activities?.sleep?.summary;
    const temperatureData = activities?.temperature?.temperature?.[0];

    // Sleep Quality
    const totalSleepMinutes = sleepSummary?.totalSleepMinutes || 0;
    const sleepQuality = Math.min((totalSleepMinutes / (12 * 60)) * 100, 100); // out of 12 hrs

    // Feeding Schedule
    const completedFeeds = feeds.length;
    const totalFeedsPlanned = schedule?.feedSlots?.length || 0;
    const feedingSchedule =
      totalFeedsPlanned > 0
        ? Math.min((completedFeeds / totalFeedsPlanned) * 100, 100)
        : 0;

    // Activity Level
    const awakeMinutes = 1440 - totalSleepMinutes;
    const activityLevel = Math.min((awakeMinutes / 1440) * 100, 100);

    // Temperature Stability
    const temp = temperatureData?.temperature || 0;
    const temperatureStability =
      temp >= 36.5 && temp <= 37.5
        ? 100
        : temp >= 37.6 && temp <= 38
          ? 80
          : temp > 38 && temp <= 39
            ? 60
            : temp > 39 && temp <= 40
              ? 40
              : 0;

    return [
      { name: "Sleep Quality", value: sleepQuality },
      { name: "Feeding Schedule", value: feedingSchedule },
      { name: "Activity Level", value: activityLevel },
      { name: "Temperature Stability", value: temperatureStability },
    ];
  }

  const healthMetrics = getHealthMetrics(activities);


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
                    Baby Growth Tracker
                  </h1>
                  <p className="text-xl opacity-90">
                    Monitor your baby's development, health, and milestones
                  </p>
                  {user?.role === 'parent' && (
                    <Button className="mt-4 flex items-center mx-auto cursor-pointer bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-lg" onClick={() => setIsAddGrowthOpen(true)}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Growth
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Current Age</p>
                    <p className="text-2xl font-bold">
                      {growths?.[0]?.age ? formatAge(growths?.[0]?.age) : 0}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Weight</p>
                    <p className="text-2xl font-bold">{growth?.weight || 0} kg</p>
                    {/* <p className="text-green-100 text-xs">
                      {weightPercentile}th percentile
                    </p> */}
                  </div>
                  <Scale className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Height</p>
                    <p className="text-2xl font-bold">{growth?.height || 0} cm</p>
                    {/* <p className="text-purple-100 text-xs">
                      {heightPercentile}th percentile
                    </p> */}
                  </div>
                  <Ruler className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Health Status</p>
                    <p className="text-2xl font-bold">{healthStatus}</p>
                    <p className="text-orange-100 text-xs">
                      All metrics normal
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-orange-200" />
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
              <TabsTrigger value="growth">Growth Charts</TabsTrigger>
              <TabsTrigger value="health">Health Metrics</TabsTrigger>
              <TabsTrigger value="growths">Growths History</TabsTrigger>
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
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Height Progress
                        </span>
                        <Badge className="bg-green-100 text-green-800">
                          Above Average
                        </Badge>
                      </div>
                      <Progress value={heightPercentile} className="h-2" />
                      <p className="text-xs text-gray-600">
                        {heightPercentile}th percentile for age
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Weight Progress
                        </span>
                        <Badge className="bg-blue-100 text-blue-800">
                          Healthy Range
                        </Badge>
                      </div>
                      <Progress value={weightPercentile} className="h-2" />
                      <p className="text-xs text-gray-600">
                        {weightPercentile}th percentile for age
                      </p>
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
                            {activities?.temperature?.temperature?.[0]?.temperature} °C
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
                            {activities?.schedule?.title || "No active schedule"}
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
                            {((activities?.sleep?.summary?.totalSleepMinutes || 0) / 60).toFixed(1)} hrs/day
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
                            {activities?.schedule?.feedSlots?.length} times/day
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Milestones */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Recent Growths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">Weight</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">BMI</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">BMI Status</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">PI</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">PI Status</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">Height</p>
                        </div>
                      </div>
                    </div>
                    {growths?.slice(0, 4)?.map((growth, index) => {
                      const bmi = growth?.weight && growth?.height
                        ? calculateBMI(growth.weight, growth.height)
                        : null;
                      const pi = growth?.weight && growth?.height
                        ? calculatePI(growth.weight, growth.height)
                        : null;
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full bg-red-100`}>
                              <Dumbbell className="h-4 w-4 text-red-600" />
                            </div>
                            <div>
                              <p className="font-medium">{growth?.weight}</p>
                            </div>
                          </div>
                          <div>{bmi}</div>
                          <div>{getBMIStatus(bmi)}</div>
                          <div>{pi}</div>
                          <div>{getPIStatus(pi)}</div>
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-medium">{growth?.height}</p>
                            </div>
                            <div className={`p-2 rounded-full bg-green-100`}>
                              <Ruler className="h-4 w-4 text-green-600" />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Growth Charts Tab */}
            <TabsContent value="growth" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Height Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Ruler className="h-5 w-5" />
                      Height Growth Chart
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
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
                          formatter={(value, name) => [`${value} cm`, "Height"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="height"
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
                      <Scale className="h-5 w-5" />
                      Weight Growth Chart
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={growths}>
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
                          formatter={(value, name) => [`${value} kg`, "Weight"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="weight"
                          stroke="#82ca9d"
                          fill="#82ca9d"
                          fillOpacity={0.3}
                          strokeWidth={3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Growth Percentiles */}
              <Card>
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
              </Card>
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
                    </div>
                    <h3 className="font-semibold text-lg">Temperature</h3>
                    <p className="text-2xl font-bold">
                      {activities?.temperature?.temperature?.[0]?.temperature}{" "}
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
                      {activities?.schedule?.title || "No active schedule"}
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
                      {((activities?.sleep?.summary?.totalSleepMinutes || 0) / 60).toFixed(1)}{" "}
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
                      {activities?.schedule?.feedSlots?.length}{" "}
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

            {/* Growths Tab */}
            <TabsContent value="growths" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Grwoths History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">Weight</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">BMI</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">BMI Status</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">PI</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">PI Status</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">Height</p>
                        </div>
                      </div>
                    </div>
                    {growths?.slice(0, 4)?.map((growth, index) => {
                      const bmi = growth?.weight && growth?.height
                        ? calculateBMI(growth.weight, growth.height)
                        : null;
                      const pi = growth?.weight && growth?.height
                        ? calculatePI(growth.weight, growth.height)
                        : null;
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full bg-red-100`}>
                              <Dumbbell className="h-4 w-4 text-red-600" />
                            </div>
                            <div>
                              <p className="font-medium">{growth?.weight}</p>
                            </div>
                          </div>
                          <div>{bmi}</div>
                          <div>{getBMIStatus(bmi)}</div>
                          <div>{pi}</div>
                          <div>{getPIStatus(pi)}</div>
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-medium">{growth?.height}</p>
                            </div>
                            <div className={`p-2 rounded-full bg-green-100`}>
                              <Ruler className="h-4 w-4 text-green-600" />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Health History Tab */}
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
                    {infectionHistory.map((infection, index) => (
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
                            <h4 className="font-semibold">{infection.type}</h4>
                            <p className="text-sm text-gray-600">
                              {infection.date} • {infection.severity} severity •
                              Duration: {infection.duration}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            infection.status === "Recovered"
                              ? "default"
                              : "secondary"
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
              </div>
            </TabsContent> */}
          </Tabs>
        </div>
      </div>
      {user?.role === 'parent' && (
        <Dialog open={isAddGrowthOpen} onOpenChange={setIsAddGrowthOpen}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-gray-800">
                Add New Record
              </DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div>
                <Label className="mb-2">Weight</Label>
                <Input
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="Weight"
                />
              </div>
              <div>
                <Label className="mb-2">Height</Label>
                <Input
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="Height"
                />
              </div>
              <div>
                <Label className="mb-2">Date</Label>
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500"
                onClick={handleAddRecord}
              >
                Save
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
