"use client"

import { useState } from "react"
import {
  Bell,
  CalendarIcon,
  MessageCircle,
  Search,
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
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent, } from "@/components/ui/chart"
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { growthData, babyList, chartConfig, childrenData, programsData } from "@/components/data/parent-dashboard/dashboard/dashboard"

export default function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 11)) // December 2024
  const [selectedDate, setSelectedDate] = useState(15)

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 lg:ml-0 ml-64">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Hello, Sarah!</h1>
                <p className="text-gray-600 text-sm lg:text-base">Ready to capture more precious moments today?</p>
              </div>

              <div className="flex items-center gap-2 lg:gap-4">
                <div className="relative flex-1 lg:flex-none">
                  <Search className="w-4 h-4 lg:w-5 lg:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search memories, milestones..."
                    className="pl-8 lg:pl-10 w-full lg:w-80 bg-gray-50 border-gray-200 rounded-full text-sm"
                  />
                </div>

                <Button variant="ghost" size="icon" className="relative rounded-full">
                  <MessageCircle className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
                  <Badge className="absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 p-0 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </Badge>
                </Button>

                <Button variant="ghost" size="icon" className="relative rounded-full">
                  <Bell className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
                  <Badge className="absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 p-0 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">
                    5
                  </Badge>
                </Button>

                <div className="hidden lg:flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=40&width=40" />
                    <AvatarFallback className="bg-gradient-to-r from-pink-400 to-purple-400 text-white">
                      SJ
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-800">Sarah Johnson</p>
                    <p className="text-sm text-green-500">Online</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="p-4 lg:p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              <Card className="bg-gradient-to-br from-pink-100 to-pink-200 border-pink-200 rounded-3xl hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-pink-600 font-medium mb-1 text-sm lg:text-base">Total Memories</p>
                      <p className="text-2xl lg:text-3xl font-bold text-pink-800">2,847</p>
                    </div>
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-pink-500 rounded-2xl flex items-center justify-center">
                      <Camera className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-100 to-purple-200 border-purple-200 rounded-3xl hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 font-medium mb-1 text-sm lg:text-base">Milestones</p>
                      <p className="text-2xl lg:text-3xl font-bold text-purple-800">47</p>
                    </div>
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-500 rounded-2xl flex items-center justify-center">
                      <Heart className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-blue-200 rounded-3xl hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 font-medium mb-1 text-sm lg:text-base">Activities</p>
                      <p className="text-2xl lg:text-3xl font-bold text-blue-800">156</p>
                    </div>
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
                      <Smile className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              {/* Growth Chart - Wave Style */}

              <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-pink-100 rounded-3xl w-full">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <h1 className="text-gray-800 text-lg lg:text-xl font-semibold">
                      Baby&apos;s Growth
                    </h1>
                    <Badge
                      variant="outline"
                      className="text-gray-600 border-gray-300 rounded-full text-xs lg:text-sm"
                    >
                      Jan - Sep 2024
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-48 lg:h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={growthData}
                      >
                        {/* Gradients */}
                        <defs>
                          <linearGradient id="heightGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                          </linearGradient>
                          <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>

                        {/* X Axis */}
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#6b7280' }}
                        />

                        {/* Left Y Axis for Height */}
                        <YAxis
                          yAxisId="left"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#3b82f6' }}
                          tickFormatter={(value) => `${value} cm`}
                          domain={[
                            (dataMin) => dataMin - 2,
                            (dataMax) => dataMax + 2,
                          ]}
                        />

                        {/* Right Y Axis for Weight */}
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#10b981' }}
                          tickFormatter={(value) => `${value} kg`}
                          domain={[
                            (dataMin) => dataMin - 0.5,
                            (dataMax) => dataMax + 0.5,
                          ]}
                        />

                        {/* Tooltip */}
                        <Tooltip
                          content={<ChartTooltipContent />}
                          formatter={(value, name) =>
                            name === 'height'
                              ? [`${value} cm`, 'Height']
                              : [`${value} kg`, 'Weight']
                          }
                          cursor={{ stroke: '#6b7280', strokeWidth: 1 }}
                        />

                        {/* Height Area */}
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="height"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          fill="url(#heightGrad)"
                        />

                        {/* Weight Area */}
                        <Area
                          yAxisId="right"
                          type="monotone"
                          dataKey="weight"
                          stroke="#10b981"
                          strokeWidth={2}
                          fill="url(#weightGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>

                  {/* Summary below */}
                  <div className="flex justify-between mt-4 text-sm text-gray-600">
                    <span>Latest Height: {growthData.at(-1).height}cm</span>
                    <span>Latest Weight: {growthData.at(-1).weight}kg</span>
                    <span>Age: 14 months</span>
                  </div>
                </CardContent>
              </Card>


              {/* Total Children */}
              <Card className="bg-white/80 backdrop-blur-sm border-pink-100 rounded-3xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-800 text-lg">My Little Ones</CardTitle>
                    <Badge variant="outline" className="text-gray-600 border-gray-300 rounded-full text-xs">
                      Jan - Jun 2024
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Children</p>
                      <p className="text-2xl lg:text-3xl font-bold text-gray-800">3</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
                        <span className="text-sm text-gray-600">Emma (2 years)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <span className="text-sm text-gray-600">Liam (8 months)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                        <span className="text-sm text-gray-600">Ava Turner (11 months)</span>
                      </div>
                    </div>

                    {/* Mini Bar Chart */}
                    <ChartContainer config={chartConfig} className="">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={childrenData.slice(0, 6)}>
                          <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: "#6b7280" }}
                          />
                          <YAxis hide />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="infant" fill="#ec4899" radius={[2, 2, 0, 0]} />
                          <Bar dataKey="toddler" fill="#10b981" radius={[2, 2, 0, 0]} />
                          <Bar dataKey="preschool" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {/* Recent Memories */}
              <Card className="bg-white/80 backdrop-blur-sm border-pink-100 rounded-3xl overflow-hidden hover:shadow-lg transition-all cursor-pointer">
                <img className="mx-3  rounded-2xl" src="https://html.vecurosoft.com/toddly/demo/assets/img/class/class-1-4.jpg" alt="" />
                <CardContent className="p-0">
                  <div className="relative h-32 lg:h-48 text-center">
                  <div className="p-4">
                    <h2 className="font-bold text-gray-800 mb-2 text-2xl">Baby Art & Crafts</h2>
                    <p className="text-sm text-gray-600 mb-3">Creative Development</p>
                    <div className="grid grid-cols-3 gap-2 text-sm pt-4">
                      <div>
                        <p className="text-gray-500">Age</p>
                        <p className="font-medium">1-3 yo</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Duration</p>
                        <p className="font-medium">60 min</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Time</p>
                        <p className="font-medium">4-10am</p>
                      </div>
                    </div>
                  </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-pink-100 rounded-3xl overflow-hidden hover:shadow-lg transition-all cursor-pointer">
                <img className="mx-3  rounded-2xl" src="https://html.vecurosoft.com/toddly/demo/assets/img/service/s-1-4.jpg" alt="" />
                <CardContent className="p-0">
                  <div className="relative h-32 lg:h-48 text-center">
                  <div className="p-4">
                    <h2 className="font-bold text-gray-800 mb-2 text-2xl">Playtime Fun</h2>
                    <p className="text-sm text-gray-600 mb-3">Liam's toy adventure</p>
                    <div className="grid grid-cols-3 gap-2 text-sm pt-4">
                      <div>
                        <p className="text-gray-500">Age</p>
                        <p className="font-medium">2-4 yo</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Duration</p>
                        <p className="font-medium">30 min</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Time</p>
                        <p className="font-medium">4-5pm</p>
                      </div>
                    </div>
                  </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top 3 Programs */}
              <Card className="bg-white/80 backdrop-blur-sm border-pink-100 rounded-3xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-800 text-lg">Top 3 Programs</CardTitle>
                    <Button variant="ghost" size="icon" className="w-6 h-6">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <ChartContainer config={chartConfig} className="">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={programsData}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={60}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {programsData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload
                                return (
                                  <div className="bg-white p-2 border rounded-lg shadow-lg">
                                    <p className="font-semibold">{data.name}</p>
                                    <p className="text-sm text-gray-600">{data.value}%</p>
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>

                    <div className="space-y-3 mt-4 absolute -bottom-[120%] w-full">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                          <span className="text-sm text-gray-600">Feeding Schedule</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-800">43%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                          <span className="text-sm text-gray-600">Sleep Tracking</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-800">64%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                          <span className="text-sm text-gray-600">Play Activities</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-800">80%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Interactive Calendar */}
              <Card className="bg-white/80 backdrop-blur-sm border-pink-100 rounded-3xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-800 text-base lg:text-lg">
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-6 h-6 lg:w-8 lg:h-8 p-0 rounded-full hover:bg-pink-100 cursor-pointer"
                        onClick={() => navigateMonth("prev")}
                      >
                        <ChevronLeft className="w-3 h-3 lg:w-4 lg:h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-6 h-6 lg:w-8 lg:h-8 p-0 rounded-full hover:bg-pink-100 cursor-pointer"
                        onClick={() => navigateMonth("next")}
                      >
                        <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1 text-center text-xs flex justify-center items-center">
                    {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                      <div key={day} className="p-1 lg:p-2 text-gray-500 font-medium">
                        {day}
                      </div>
                    ))}

                    {emptyDays.map((_, index) => (
                      <div key={`empty-${index}`} className="p-1 lg:p-2"></div>
                    ))}

                    {days.map((date) => (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`p-1 lg:p-3 flex justify-center items-center rounded-full text-sm transition-all hover:bg-pink-100 hover:w-7 hover:h-7 cursor-pointer ${date === selectedDate
                          ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold w-7 h-7"
                            : "text-gray-700"
                          }`}
                      >
                        {date}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {/* Baby List */}
              <Card className="col-span-2 bg-white/80 backdrop-blur-sm border-pink-100 rounded-3xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-800 text-lg">Baby List</CardTitle>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search babies..."
                        className="pl-8 w-40 h-8 bg-gray-50 border-gray-200 rounded-full text-xs"
                      />
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs text-gray-600">Name</TableHead>
                          <TableHead className="text-xs text-gray-600">Age</TableHead>
                          <TableHead className="text-xs text-gray-600">Next Visit</TableHead>
                          <TableHead className="text-xs text-gray-600">Parent</TableHead>
                          <TableHead className="text-xs text-gray-600">Action</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {babyList.map((baby, index) => (
                          <TableRow key={index} className="hover:bg-pink-50">
                            <TableCell className="text-sm font-medium text-gray-800">
                              {baby.name}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">{baby.age}</TableCell>
                            <TableCell className="text-sm text-gray-600">{baby.date}</TableCell>
                            <TableCell className="text-sm text-gray-600">{baby.parent}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="w-6 h-6">
                                    <MoreVertical className="w-3 h-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Edit className="w-3 h-3 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="w-3 h-3 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="col-span-2 bg-white/80 backdrop-blur-sm border-pink-100 rounded-3xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-800 text-lg">Recent Activity</CardTitle>
                    <Button variant="ghost" size="icon" className="w-6 h-6">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">Feeding Time Logged</p>
                        <p className="text-xs text-gray-600">Emma had her morning bottle at 8:30 AM</p>
                      </div>
                      <span className="text-xs text-gray-500">10:00 AM</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                        <Heart className="w-4 h-4 text-pink-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">Milestone Updated</p>
                        <p className="text-xs text-gray-600">Liam took his first steps today!</p>
                      </div>
                      <span className="text-xs text-gray-500">9:35 AM</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Camera className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">New Photo Added</p>
                        <p className="text-xs text-gray-600">Playtime memories captured</p>
                      </div>
                      <span className="text-xs text-gray-500">8:45 AM</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Moon className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">Sleep Pattern Recorded</p>
                        <p className="text-xs text-gray-600">Emma slept for 2.5 hours during nap time</p>
                      </div>
                      <span className="text-xs text-gray-500">7:30 AM</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>


          </div>
        </div>
      </div>
    </div>
  )
}
