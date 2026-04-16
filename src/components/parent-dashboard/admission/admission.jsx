"use client"

import { useState } from "react"
import {
  Bell,
  Calendar,
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
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  Filter,
  Download,
  Phone,
  UserPlus,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { admissionsData } from "@/components/data/parent-dashboard/admission/admission"

export default function AdmissionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const filteredData = admissionsData.filter(
    (admission) =>
      admission.babyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admission.parent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admission.programs.some((program) => program.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700"
      case "Pending":
        return "bg-yellow-100 text-yellow-700"
      case "Waitlist":
        return "bg-blue-100 text-blue-700"
      case "Inactive":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getTuitionStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700"
      case "Pending":
        return "bg-yellow-100 text-yellow-700"
      case "Deposit Paid":
        return "bg-blue-100 text-blue-700"
      case "Overdue":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getMedicalStatusIcon = (status) => {
    switch (status) {
      case "Complete":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "Pending":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case "Expired":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  // Calculate statistics
  const totalApplications = admissionsData.length
  const activeEnrollments = admissionsData.filter((a) => a.status === "Active").length
  const pendingApplications = admissionsData.filter((a) => a.status === "Pending").length
  const waitlistCount = admissionsData.filter((a) => a.status === "Waitlist").length

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
                <p className="text-gray-600 text-sm lg:text-base">
                  Manage baby admissions, enrollments, and joining processes
                </p>
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
                    <p className="text-pink-600 font-medium mb-1 text-sm">Total Applications</p>
                    <p className="text-2xl lg:text-3xl font-bold text-pink-800 mb-2">{totalApplications}</p>
                    <p className="text-xs text-pink-600">+6.2% compared to last month</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-100 to-purple-200 border-purple-200 rounded-3xl hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-4 lg:p-6">
                  <div className="text-center">
                    <p className="text-purple-600 font-medium mb-1 text-sm">Active Enrollments</p>
                    <p className="text-2xl lg:text-3xl font-bold text-purple-800 mb-2">{activeEnrollments}</p>
                    <Progress value={(activeEnrollments / totalApplications) * 100} className="h-2 mt-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-blue-200 rounded-3xl hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-4 lg:p-6">
                  <div className="text-center">
                    <p className="text-blue-600 font-medium mb-1 text-sm">Pending Applications</p>
                    <p className="text-2xl lg:text-3xl font-bold text-blue-800 mb-2">{pendingApplications}</p>
                    <p className="text-xs text-blue-600">+8.1% compared to last month</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-100 to-green-200 border-green-200 rounded-3xl hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-4 lg:p-6">
                  <div className="text-center">
                    <p className="text-green-600 font-medium mb-1 text-sm">Waitlist</p>
                    <p className="text-2xl lg:text-3xl font-bold text-green-800 mb-2">{waitlistCount}</p>
                    <p className="text-xs text-green-600">+2.1% compared to last month</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Admissions List */}
            <Card className="bg-white/80 backdrop-blur-sm border-pink-100 rounded-3xl">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Admission List</h2>

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

                    <Button variant="outline" size="sm" className="rounded-full border-gray-300 bg-transparent">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>

                    <Button variant="outline" size="sm" className="rounded-full border-gray-300 bg-transparent">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>

                    <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-full">
                      <Plus className="w-4 h-4 mr-2" />
                      New Application
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-pink-100 hover:bg-transparent">
                        <TableHead className="text-gray-600 font-semibold">Name</TableHead>
                        <TableHead className="text-gray-600 font-semibold">DOB</TableHead>
                        <TableHead className="text-gray-600 font-semibold">Programs</TableHead>
                        <TableHead className="text-gray-600 font-semibold">Parent</TableHead>
                        <TableHead className="text-gray-600 font-semibold">Days</TableHead>
                        <TableHead className="text-gray-600 font-semibold">Start Date</TableHead>
                        <TableHead className="text-gray-600 font-semibold">End Date</TableHead>
                        <TableHead className="text-gray-600 font-semibold">Status</TableHead>
                        <TableHead className="text-gray-600 font-semibold">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((admission) => (
                        <TableRow key={admission.id} className="border-pink-50 hover:bg-pink-25 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
                                <AvatarFallback className="bg-gradient-to-r from-pink-400 to-purple-400 text-white text-sm">
                                  {admission.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-gray-800">{admission.babyName}</p>
                                <p className="text-xs text-gray-500">{admission.age}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600">{admission.dob}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {admission.programs.map((program, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="bg-blue-50 text-blue-700 border-blue-200 rounded-full text-xs"
                                >
                                  {program}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-gray-800">{admission.parent}</p>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Phone className="w-3 h-3" />
                                {admission.parentContact}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600">{admission.days}</TableCell>
                          <TableCell className="text-gray-600">{admission.startDate}</TableCell>
                          <TableCell className="text-gray-600">{admission.endDate}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge className={`${getStatusColor(admission.status)} border-0 rounded-full text-xs`}>
                                {admission.status}
                              </Badge>
                              <div className="flex items-center gap-1">
                                {getMedicalStatusIcon(admission.medicalClearance)}
                                <span className="text-xs text-gray-500">Medical</span>
                              </div>
                            </div>
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
                                  Edit Application
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-lg">
                                  <FileText className="w-4 h-4 mr-2" />
                                  View Documents
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-lg">
                                  <Phone className="w-4 h-4 mr-2" />
                                  Contact Parent
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-lg">
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-lg">
                                  <Heart className="w-4 h-4 mr-2" />
                                  Medical Records
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600 rounded-lg">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Reject Application
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full bg-transparent"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full bg-transparent"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>

                {filteredData.length === 0 && (
                  <div className="text-center py-12">
                    <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No applications found matching your search.</p>
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
