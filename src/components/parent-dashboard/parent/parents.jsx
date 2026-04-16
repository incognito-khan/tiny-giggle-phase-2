"use client"

import { useState } from "react"
import { Bell, Calendar, MessageCircle, Search, User, Baby, Heart, Camera, Clock, Smile, Moon, Utensils, Bath, BookOpen, Music, MoreVertical, Edit, Trash2, Plus, Filter, Download, Phone, Mail, MapPin } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { parentsData } from "@/components/data/parent-dashboard/parent/parentData"

export default function ParentsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredParents = parentsData.filter(parent =>
    parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.subscription.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.childrenNames.some(child => child.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700"
      case "Inactive":
        return "bg-red-100 text-red-700"
      case "Pending":
        return "bg-yellow-100 text-yellow-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getSubscriptionColor = (subscription) => {
    switch (subscription) {
      case "Premium Plan":
        return "bg-purple-100 text-purple-700 border-purple-200"
      case "Family Plan":
        return "bg-pink-100 text-pink-700 border-pink-200"
      case "Basic Plan":
        return "bg-blue-100 text-blue-700 border-blue-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getActivityColor = (activity) => {
    if (activity.includes("minutes") || activity.includes("hour")) return "text-green-600"
    if (activity.includes("day")) return "text-orange-600"
    return "text-gray-600"
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
                <p className="text-gray-600 text-sm lg:text-base">Manage all parent accounts and their family information</p>
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
          <div className="p-4 lg:p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <Card className="bg-gradient-to-br from-pink-100 to-pink-200 border-pink-200 rounded-3xl hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-4 lg:p-6">
                  <div className="text-center">
                    <p className="text-pink-600 font-medium mb-1 text-sm">Total Parents</p>
                    <p className="text-2xl lg:text-3xl font-bold text-pink-800 mb-2">6</p>
                    <p className="text-xs text-pink-600">+2 compared to last month</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-100 to-purple-200 border-purple-200 rounded-3xl hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-4 lg:p-6">
                  <div className="text-center">
                    <p className="text-purple-600 font-medium mb-1 text-sm">Active Users</p>
                    <p className="text-2xl lg:text-3xl font-bold text-purple-800 mb-2">5</p>
                    <p className="text-xs text-purple-600">+1 compared to last month</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-blue-200 rounded-3xl hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-4 lg:p-6">
                  <div className="text-center">
                    <p className="text-blue-600 font-medium mb-1 text-sm">Premium Members</p>
                    <p className="text-2xl lg:text-3xl font-bold text-blue-800 mb-2">4</p>
                    <p className="text-xs text-blue-600">+2 compared to last month</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-100 to-green-200 border-green-200 rounded-3xl hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-4 lg:p-6">
                  <div className="text-center">
                    <p className="text-green-600 font-medium mb-1 text-sm">Total Memories</p>
                    <p className="text-2xl lg:text-3xl font-bold text-green-800 mb-2">5,370</p>
                    <p className="text-xs text-green-600">+847 compared to last month</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Parents List */}
            <Card className="bg-white/80 backdrop-blur-sm border-pink-100 rounded-3xl">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Parent List</h2>
                  
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search anything here"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64 bg-gray-50 border-gray-200 rounded-full text-sm"
                      />
                    </div>
                    
                    <Button variant="outline" size="sm" className="rounded-full border-gray-300">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    
                    <Button variant="outline" size="sm" className="rounded-full border-gray-300">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    
                    <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Parent
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-pink-100 hover:bg-transparent">
                        <TableHead className="text-gray-600 font-semibold">Name</TableHead>
                        <TableHead className="text-gray-600 font-semibold">Contact</TableHead>
                        <TableHead className="text-gray-600 font-semibold">Children</TableHead>
                        <TableHead className="text-gray-600 font-semibold">Subscription</TableHead>
                        <TableHead className="text-gray-600 font-semibold">Join Date</TableHead>
                        <TableHead className="text-gray-600 font-semibold">Last Activity</TableHead>
                        <TableHead className="text-gray-600 font-semibold">Status</TableHead>
                        <TableHead className="text-gray-600 font-semibold">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredParents.map((parent) => (
                        <TableRow key={parent.id} className="border-pink-50 hover:bg-pink-25 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
                                <AvatarFallback className="bg-gradient-to-r from-pink-400 to-purple-400 text-white text-sm">
                                  {parent.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-gray-800">{parent.name}</p>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <MapPin className="w-3 h-3" />
                                  {parent.location}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Mail className="w-3 h-3" />
                                {parent.email}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Phone className="w-3 h-3" />
                                {parent.phone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-semibold text-gray-800">{parent.children} {parent.children === 1 ? 'Child' : 'Children'}</p>
                              <div className="text-xs text-gray-500 space-y-1">
                                {parent.childrenNames.map((child, index) => (
                                  <div key={index}>{child}</div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getSubscriptionColor(parent.subscription)} border rounded-full`}>
                              {parent.subscription}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-600">{parent.joinDate}</TableCell>
                          <TableCell className={getActivityColor(parent.lastActivity)}>
                            {parent.lastActivity}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(parent.status)} border-0 rounded-full`}>
                              {parent.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-pink-100">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-xl">
                                <DropdownMenuItem className="rounded-lg">
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-lg">
                                  <Baby className="w-4 h-4 mr-2" />
                                  View Children
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-lg">
                                  <Camera className="w-4 h-4 mr-2" />
                                  View Memories
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-lg">
                                  <MessageCircle className="w-4 h-4 mr-2" />
                                  Send Message
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-lg">
                                  <Heart className="w-4 h-4 mr-2" />
                                  Subscription
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600 rounded-lg">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Deactivate
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredParents.length === 0 && (
                  <div className="text-center py-12">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No parents found matching your search.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
