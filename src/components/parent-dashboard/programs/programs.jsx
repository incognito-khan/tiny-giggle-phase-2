"use client"

import { useState } from "react"
import { Bell, Calendar, MessageCircle, Search, User, Baby, Heart, Camera, Clock, Smile, Moon, Utensils, Bath, BookOpen, Music, Star, Users, Timer, Target } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { programsData } from "@/components/data/parent-dashboard/program/programsData"

// Calculate category data for chart
const categoryData = programsData.reduce((acc, program) => {
  const existing = acc.find(item => item.name === program.category)
  if (existing) {
    existing.value += 1
    existing.participants += program.participants
  } else {
    acc.push({
      name: program.category,
      value: 1,
      color: program.categoryColor,
      participants: program.participants
    })
  }
  return acc
},[])

const totalPrograms = programsData.length
const totalParticipants = programsData.reduce((sum, program) => sum + program.participants, 0)

export default function ProgramsPage() {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [hoveredProgram, setHoveredProgram] = useState(null)

  const filteredPrograms = selectedCategory 
    ? programsData.filter(program => program.category === selectedCategory)
    : programsData

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(selectedCategory === categoryName ? null : categoryName)
  }

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
                <p className="text-gray-600 text-sm lg:text-base">Explore amazing development programs for your little ones</p>
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

          {/* Page Content */}
          <div className="p-4 lg:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Programs Grid */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">All Programs</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Categories:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-gray-300"
                    >
                      All Categories
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                  {filteredPrograms.map((program) => (
                    <Link key={program.id} href={`/parent-dashboard/programs/${program.id}`}>
                      <Card 
                        className="bg-white/80 backdrop-blur-sm border-pink-100 rounded-3xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer transform"
                        onMouseEnter={() => setHoveredProgram(program.id)}
                        onMouseLeave={() => setHoveredProgram(null)}
                      >
                        <div className="relative h-48">
                          <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 flex items-center justify-center">
                            <div className="text-center">
                              <Baby className="w-12 h-12 text-pink-600 mx-auto mb-2" />
                              <p className="text-xs text-gray-600 px-4">{program.title}</p>
                            </div>
                          </div>
                          <div className="absolute top-4 right-4">
                            <Badge 
                              className="text-white border-0 rounded-full text-xs"
                              style={{ backgroundColor: program.categoryColor }}
                            >
                              {program.category}
                            </Badge>
                          </div>
                        </div>
                        
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-gray-800 mb-2">{program.title}</h3>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-3">{program.description}</p>
                          
                          <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                            <div>
                              <p className="text-gray-500">Age</p>
                              <p className="font-medium">{program.age}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Duration</p>
                              <p className="font-medium">{program.duration}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Time</p>
                              <p className="font-medium">{program.time}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{program.rating}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Users className="w-4 h-4" />
                              <span>{program.participants}/{program.capacity}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
              {/* Right Sidebar */}
              <div className="space-y-6 mt-[16%]">
                {/* Programs by Category Chart */}
                <Card className="bg-white/80 backdrop-blur-sm border-pink-100 rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-gray-800">Programs by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative flex justify-center items-center flex-col">
                      <ChartContainer config={{}} className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryData}
                              cx="50%"
                              cy="50%"
                              innerRadius={30}
                              outerRadius={70}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {categoryData.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={entry.color}
                                  className="cursor-pointer hover:opacity-80"
                                  onClick={() => handleCategoryClick(entry.name)}
                                />
                              ))}
                            </Pie>
                            <ChartTooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload
                                  return (
                                    <div className="bg-white p-3 border rounded-lg shadow-lg">
                                      <p className="font-semibold">{data.name}</p>
                                      <p className="text-sm text-gray-600">{data.value} programs</p>
                                      <p className="text-sm text-gray-600">{data.participants} participants</p>
                                    </div>
                                  )
                                }
                                return null
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                      
                      <div className="text-center mt-4 flex justify-center items-center gap-2">
                        <p className="text-lg text-gray-600">Total Programs:</p>
                        <p className="text-xl font-bold text-gray-800">{totalPrograms}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Program Names List */}
                <Card className="bg-white/80 backdrop-blur-sm border-pink-100 rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-gray-800">Program Names</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {programsData.map((program) => (
                      <div 
                        key={program.id}
                        className={`p-3 rounded-lg transition-all cursor-pointer ${
                          hoveredProgram === program.id ? 'bg-pink-50 border border-pink-200' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleCategoryClick(program.category)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-800 text-sm">{program.title}</h4>
                          <Badge 
                            className="text-white border-0 rounded-full text-xs"
                            style={{ backgroundColor: program.categoryColor }}
                          >
                            {program.category}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                          <span>{program.participants} participants</span>
                          <span>Full capacity: {program.capacity}</span>
                        </div>
                        
                        <Progress 
                          value={(program.participants / program.capacity) * 100} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Enhance Your Routine */}
                <Card className="bg-gradient-to-br from-pink-100 to-purple-100 border-pink-200 rounded-3xl">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8 text-pink-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Enhance Your Routine</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Discover personalized activities and development programs tailored for your baby's growth.
                      </p>
                      <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-full">
                        Get Started
                      </Button>
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
