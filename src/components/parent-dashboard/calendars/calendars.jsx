"use client"

import { useState, useEffect, useMemo } from "react"
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
  Plus,
  MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay, parseISO } from "date-fns"
import { eventsData } from "@/components/data/parent-dashboard/calender/calenderData"
import { useDispatch, useSelector } from "react-redux"
import { uploadImage } from "@/store/slices/mediaSlice"
import Loading from "@/components/loading";
const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]

const weekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT"]

export default function CalendarPage() {
  const parent = useSelector((state) => state.auth.user)
  const parentId = parent.id;
  const [loading, setLoading] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(new Date(2025, 7, 9)) // 16 Aug, 2025
  const [selectedEvent, setSelectedEvent] = useState(eventsData[0])
  const [file, setFile] = useState(null);
  const dispatch = useDispatch()

  // Calculate week dates
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }) // Monday start
  const weekDates = Array.from({ length: 6 }, (_, i) => addDays(weekStart, i))

  // Navigate weeks
  const goToPreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1))
  }

  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1))
  }

  // Get events for current week
  const weekEvents = useMemo(() => {
    return eventsData.filter((event) => {
      const eventDate = parseISO(event.date)
      return weekDates.some((date) => isSameDay(eventDate, date))
    })
  }, [weekDates])

  // Get events for specific date and time
  const getEventsForDateTime = (date, timeSlot) => {
    return weekEvents.filter((event) => {
      const eventDate = parseISO(event.date)
      return isSameDay(eventDate, date) && event.startTime === timeSlot
    })
  }

  // Calculate event duration in slots
  const getEventDuration = (startTime, endTime) => {
    const start = parseISO(`2025-01-01T${startTime}:00`)
    const end = parseISO(`2025-01-01T${endTime}:00`)
    return Math.ceil((end.getTime() - start.getTime()) / (60 * 60 * 1000)) // hours
  }

  // Get activity types for sidebar
  const activityTypes = [
    {
      name: "Outdoor Activity",
      count: weekEvents.filter((e) => e.category === "Environmental").length,
      color: "#10b981",
    },
    {
      name: "Indoor Activity",
      count: weekEvents.filter((e) => ["Creative", "Music", "Language"].includes(e.category)).length,
      color: "#06b6d4",
    },
    { name: "Physical Activity", count: weekEvents.filter((e) => e.category === "Physical").length, color: "#8b5cf6" },
    { name: "Sensory Activity", count: weekEvents.filter((e) => e.category === "Sensory").length, color: "#ec4899" },
  ]

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
                <p className="text-gray-600 text-sm lg:text-base">Here are your baby's activities and schedule</p>
              </div>

              <div className="flex items-center gap-2 lg:gap-4">
                <div className="relative flex-1 lg:flex-none">
                  <Search className="w-4 h-4 lg:w-5 lg:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search anything here"
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

          {/* Calendar Content */}
          <div className="p-4 lg:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main Calendar */}
              <div className="lg:col-span-3">
                <Card className="bg-white/80 backdrop-blur-sm border-pink-100 rounded-3xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-gray-800">Calendar</CardTitle>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 rounded-full hover:bg-pink-100"
                            onClick={goToPreviousWeek}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <span className="text-sm font-medium text-gray-700 min-w-[300px] text-center">
                            {format(weekDates[0], "dd MMM")} - {format(weekDates[5], "dd MMM, yyyy")}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 rounded-full hover:bg-pink-100"
                            onClick={goToNextWeek}                      
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-pink-100">
                            <Search className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-pink-100">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
                      {/* Time Column Header */}
                      <div className="bg-gray-50 p-2 border-r border-gray-200">
                        <div className="text-xs text-gray-500 text-center">Time</div>
                      </div>

                      {/* Day Headers */}
                      {weekDays.map((day, index) => (
                        <div key={day} className="bg-gray-50 p-2 border-r border-gray-200 last:border-r-0">
                          <div className="text-center">
                            <div className="text-xs font-medium text-gray-700">{day}</div>
                            <div className="text-sm text-gray-500">{format(weekDates[index], "dd MMM")}</div>
                          </div>
                        </div>
                      ))}

                      {/* Time Slots and Events */}
                      {timeSlots.map((timeSlot, timeIndex) => (
                        <div key={timeSlot} className="contents">
                          {/* Time Label */}
                          <div className="bg-gray-50 p-2 border-r border-t border-gray-200 text-xs text-gray-500 text-center">
                            {timeSlot}
                          </div>

                          {/* Day Columns */}
                          {weekDates.map((date, dayIndex) => {
                            const dayEvents = getEventsForDateTime(date, timeSlot)
                            return (
                              <div
                                key={`${timeSlot}-${dayIndex}`}
                                className="border-r border-t border-gray-200 last:border-r-0 p-1 min-h-[120px] relative"
                              >
                                {dayEvents.map((event) => {
                                  const duration = getEventDuration(event.startTime, event.endTime)
                                  return (
                                    <div
                                      key={event.id}
                                      className="absolute inset-1 rounded-lg p-2 cursor-pointer hover:shadow-md transition-all"
                                      style={{
                                        backgroundColor: event.color + "20",
                                        borderLeft: `3px solid ${event.color}`,
                                        // height: `${duration * 58 - 4}px`,
                                        zIndex: 10,
                                      }}
                                      onClick={() => setSelectedEvent(event)}
                                    >
                                      <div className="text-xs font-medium text-gray-800 mb-1 line-clamp-2">
                                        {event.title}
                                      </div>
                                      <div className="text-xs text-gray-600 mb-1">
                                        {event.startTime} - {event.endTime}
                                      </div>
                                      <div className="flex -space-x-1">
                                        {event.participants.slice(0, 3).map((participant, idx) => (
                                          <Avatar key={idx} className="w-7 h-7 border border-white">
                                            <AvatarFallback className="text-xs bg-gradient-to-r from-pink-400 to-purple-400 text-white">
                                              {participant.avatar}
                                            </AvatarFallback>
                                          </Avatar>
                                        ))}
                                        {event.participants.length > 3 && (
                                          <div className="w-4 h-4 rounded-full bg-gray-300 text-xs flex items-center justify-center text-gray-600 border border-white">
                                            +{event.participants.length - 3}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                {/* Selected Event Details */}
                {selectedEvent && (
                  <Card className="bg-white/80 backdrop-blur-sm border-pink-100 rounded-3xl">
                    <CardHeader>
                      <CardTitle className="text-gray-800 text-lg">{selectedEvent.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>
                          {selectedEvent.startTime} - {selectedEvent.endTime}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 leading-relaxed">{selectedEvent.description}</p>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">{selectedEvent.instructor}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">{selectedEvent.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Baby className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">{selectedEvent.ageGroup}</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Participants ({selectedEvent.participants.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedEvent.participants.map((participant, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-pink-50 rounded-full px-2 py-1">
                              <Avatar className="w-5 h-5">
                                <AvatarFallback className="text-xs bg-gradient-to-r from-pink-400 to-purple-400 text-white">
                                  {participant.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-gray-700">{participant.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Activity Types */}
                <Card className="bg-white/80 backdrop-blur-sm border-pink-100 rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-gray-800 text-lg">Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {activityTypes.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: activity.color }}></div>
                          <span className="text-sm text-gray-700">{activity.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {activity.count}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Week Summary */}
                <Card className="bg-gradient-to-br from-pink-100 to-purple-100 border-pink-200 rounded-3xl">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <CalendarIcon className="w-6 h-6 text-pink-500" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-800 mb-2">This Week</h3>
                      <p className="text-xs text-gray-600 mb-3">{weekEvents.length} activities scheduled</p>
                      <div className="text-xs text-gray-600">
                        <p>
                          {weekEvents.reduce((sum, event) => sum + event.participants.length, 0)} total participants
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
