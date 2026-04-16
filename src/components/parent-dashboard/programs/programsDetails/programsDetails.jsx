"use client"

import { useState } from "react"
import { Bell, Calendar, MessageCircle, Search, User, Baby, Heart, Camera, Clock, Smile, Moon, Utensils, Bath, BookOpen, Music, ChevronRight, Star, Play, CheckCircle, Circle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

export default function ProgramsDetailsPage() {
  const [checkedItems, setCheckedItems] = useState({
    "introduce-tummy-time": true,
    "sensory-play": false,
    "motor-skills": true,
    "social-interaction": false,
  })

  const handleCheckboxChange = (id) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
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
                <p className="text-gray-600 text-sm lg:text-base">Discover amazing activities for your little one's development</p>
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
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
              <span>All Programs</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-pink-600 font-medium">Program Details</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Hero Image and Program Info */}
                <Card className="bg-white/80 backdrop-blur-sm border-pink-100 rounded-3xl overflow-hidden">
                  <div className="relative h-64 lg:h-80">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 flex items-center justify-center">
                      <div className="text-center">
                        <Baby className="w-16 h-16 text-pink-600 mx-auto mb-4" />
                        <p className="text-gray-600">Baby enjoying tummy time and sensory play</p>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Tiny Tots Sensory Development</h1>
                      <Badge className="bg-green-100 text-green-700 border-green-200 rounded-full">
                        Developmental
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 leading-relaxed mb-6">
                      Our Tiny Tots Sensory Development is a specialized early development program designed specifically for babies aged 0-12 months. 
                      Through a mix of interactive play, gentle sensory activities, and engaging learning sessions, this program aims to 
                      enhance your baby's cognitive development while building essential motor skills and emotional bonding.
                    </p>

                    {/* Key Skills */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Skills:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-pink-500 rounded-full mt-2"></div>
                          <div>
                            <p className="font-medium text-gray-800">Motor Skills Building</p>
                            <p className="text-sm text-gray-600">Introduces new movements and coordination skills</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                          <div>
                            <p className="font-medium text-gray-800">Sensory Exploration</p>
                            <p className="text-sm text-gray-600">Helps babies explore textures, sounds, and visual stimuli</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div>
                            <p className="font-medium text-gray-800">Cognitive Development</p>
                            <p className="text-sm text-gray-600">Encourages problem-solving and memory building</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <div>
                            <p className="font-medium text-gray-800">Social Bonding</p>
                            <p className="text-sm text-gray-600">Promotes parent-child interaction and emotional connection</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Learning Outcomes */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Learning Outcomes:</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-800">Enhanced Motor Skills:</p>
                            <p className="text-sm text-gray-600">Babies will improve their ability to reach, grasp, and coordinate movements.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-800">Improved Sensory Processing:</p>
                            <p className="text-sm text-gray-600">Toddlers will learn to process different textures, sounds, and visual stimuli more effectively.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-800">Better Sleep Patterns:</p>
                            <p className="text-sm text-gray-600">Regular sensory activities help establish better sleep routines and longer rest periods.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-800">Stronger Parent-Child Bond:</p>
                            <p className="text-sm text-gray-600">Interactive activities foster deeper emotional connections and communication development.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Enhance Your Routine Card */}
                <Card className="bg-gradient-to-br from-pink-100 to-purple-100 border-pink-200 rounded-3xl">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
                        <Heart className="w-8 h-8 text-pink-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Enhance Your Baby's Routine</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Discover personalized activities and milestones tracking to make every moment count in your baby's development journey.
                        </p>
                        <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-full">
                          <Play className="w-4 h-4 mr-2" />
                          Start Activity
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                {/* About The Caregiver */}
                <Card className="bg-white/80 backdrop-blur-sm border-pink-100 rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-gray-800">About The Caregiver</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src="/placeholder.svg?height=48&width=48" />
                        <AvatarFallback className="bg-gradient-to-r from-pink-400 to-purple-400 text-white">
                          AW
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-800">Anna Wilson</p>
                        <p className="text-sm text-gray-600">Pediatric Specialist</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      A highly skilled pediatric specialist who specializes in early childhood development and sensory play. She has extensive experience in creating engaging activities that promote healthy growth and development.
                    </p>
                    
                    <p className="text-sm text-gray-600 leading-relaxed">
                      She often hosts advanced sessions in motor skills, sensory exploration, and cognitive development, and they are particularly effective at helping babies develop problem-solving skills. Her expertise helps parents understand developmental milestones and language development.
                    </p>
                    
                    <div className="flex items-center gap-2 mt-4">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">(4.9/5)</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Program Guide */}
                <Card className="bg-white/80 backdrop-blur-sm border-pink-100 rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-gray-800">Program Guide</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="introduce-tummy-time"
                        checked={checkedItems["introduce-tummy-time"]}
                        onCheckedChange={() => handleCheckboxChange("introduce-tummy-time")}
                        className="rounded-md"
                      />
                      <label htmlFor="introduce-tummy-time" className="text-sm text-gray-700 cursor-pointer">
                        1. Introduce new tummy time and motor skills daily
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="sensory-play"
                        checked={checkedItems["sensory-play"]}
                        onCheckedChange={() => handleCheckboxChange("sensory-play")}
                        className="rounded-md"
                      />
                      <label htmlFor="sensory-play" className="text-sm text-gray-700 cursor-pointer">
                        2. Begin to lay the groundwork for understanding different textures and sounds
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="motor-skills"
                        checked={checkedItems["motor-skills"]}
                        onCheckedChange={() => handleCheckboxChange("motor-skills")}
                        className="rounded-md"
                      />
                      <label htmlFor="motor-skills" className="text-sm text-gray-700 cursor-pointer">
                        3. Encourage active learning through play and song
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="social-interaction"
                        checked={checkedItems["social-interaction"]}
                        onCheckedChange={() => handleCheckboxChange("social-interaction")}
                        className="rounded-md"
                      />
                      <label htmlFor="social-interaction" className="text-sm text-gray-700 cursor-pointer">
                        4. Promote the use of new vocabulary in everyday interactions
                      </label>
                    </div>

                    <div className="pt-4 border-t border-pink-100">
                      <p className="text-xs text-gray-500 mb-2">Progress: 50% Complete</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full w-1/2"></div>
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
