"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Search, 
  MessageCircle, 
  Phone, 
  Mail, 
  MoreVertical,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  List,
  Grid3x3,
  Loader2
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card.jsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { useRouter } from "next/navigation";
import { GET } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { Label } from "@/components/ui/label.jsx";
import { toast } from "react-toastify";

const mockPatientsData = [
  {
    id: 1,
    name: "Marcus Xavier",
    email: "marcus@example.com",
    phone: "+1 (555) 123-4567",
    avatar: "https://i.pravatar.cc/150?u=marcus",
    status: "Active",
    lastVisit: "2 days ago",
    conditions: ["Diabetes", "Hypertension"],
    hasChat: true,
    chatId: "chat-marcus-001"
  },
  {
    id: 2,
    name: "Elena Gilbert",
    email: "elena@example.com",
    phone: "+1 (555) 234-5678",
    avatar: "https://i.pravatar.cc/150?u=elena",
    status: "Active",
    lastVisit: "1 week ago",
    conditions: ["Asthma"],
    hasChat: false,
    chatId: null
  },
  {
    id: 3,
    name: "John Smith",
    email: "john@example.com",
    phone: "+1 (555) 345-6789",
    avatar: "https://i.pravatar.cc/150?u=john",
    status: "Inactive",
    lastVisit: "3 months ago",
    conditions: ["Allergies"],
    hasChat: true,
    chatId: "chat-john-001"
  },
  {
    id: 4,
    name: "Alaric Saltzman",
    email: "alaric@example.com",
    phone: "+1 (555) 456-7890",
    avatar: "https://i.pravatar.cc/150?u=alaric",
    status: "Active",
    lastVisit: "5 days ago",
    conditions: ["Pediatric Care", "Vaccination"],
    hasChat: true,
    chatId: "chat-alaric-001"
  },
  {
    id: 5,
    name: "Bonnie Bennett",
    email: "bonnie@example.com",
    phone: "+1 (555) 567-8901",
    avatar: "https://i.pravatar.cc/150?u=bonnie",
    status: "Active",
    lastVisit: "1 day ago",
    conditions: ["General Checkup"],
    hasChat: false,
    chatId: null
  },
  {
    id: 6,
    name: "Caroline Forbes",
    email: "caroline@example.com",
    phone: "+1 (555) 678-9012",
    avatar: "https://i.pravatar.cc/150?u=caroline",
    status: "Active",
    lastVisit: "4 days ago",
    conditions: ["Migraine", "Stress Management"],
    hasChat: true,
    chatId: "chat-caroline-001"
  },
];

const getStatusStyles = (status) => {
  switch (status) {
    case "ACCEPTED":
    case "Active":
      return {
        badge: "bg-emerald-50 text-emerald-600 border-emerald-100",
        icon: CheckCircle,
        dotColor: "bg-emerald-500",
        label: "Active Session"
      };
    case "COMPLETED":
      return {
        badge: "bg-purple-50 text-purple-600 border-purple-100",
        icon: CheckCircle,
        dotColor: "bg-purple-500",
        label: "Completed"
      };
    case "PENDING":
      return {
        badge: "bg-amber-50 text-amber-600 border-amber-100",
        icon: Clock,
        dotColor: "bg-amber-500",
        label: "Pending"
      };
    case "Inactive":
      return {
        badge: "bg-slate-50 text-slate-600 border-slate-100",
        icon: AlertCircle,
        dotColor: "bg-slate-400",
        label: "Inactive"
      };
    default:
      return {
        badge: "bg-slate-50 text-slate-600 border-slate-100",
        icon: Clock,
        dotColor: "bg-slate-400",
        label: status
      };
  }
};

export default function PatientsList() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const [chatLoading, setChatLoading] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatientForSession, setSelectedPatientForSession] = useState(null);
  const [sessionReport, setSessionReport] = useState("");
  const [endingSession, setEndingSession] = useState(false);

  // Fetch real patient data from API
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const { data } = await GET("/patients");
      
      if (data.success && data.data) {
        // Transform API data to match component expectations
        const transformed = data.data.map(patient => ({
          id: patient.id,
          name: patient.firstName && patient.lastName 
            ? `${patient.firstName} ${patient.lastName}` 
            : patient.name || "Unknown",
          email: patient.email || "",
          phone: patient.phone || "",
          avatar: patient.profilePicture || `https://i.pravatar.cc/150?u=${patient.id}`,
          status: patient.status,
          lastVisit: patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : "Never",
          conditions: patient.medicalConditions || [],
          hasChat: !!patient.chatId,
          chatId: patient.chatId || null,
          appointmentId: patient.appointmentId,
          appointmentStatus: patient.appointmentStatus
        }));
        setPatients(transformed);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      // Fallback to mock data if API fails
      setPatients(mockPatientsData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleEndSession = async () => {
    if (!selectedPatientForSession || !sessionReport.trim()) return;
    
    setEndingSession(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/v1/appointments/${selectedPatientForSession.appointmentId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "COMPLETED",
          checkupReport: sessionReport
        }),
      });

      if (response.ok) {
        toast.success("Session ended and report saved successfully!");
        setSelectedPatientForSession(null);
        setSessionReport("");
        // Refresh patients list
        fetchPatients();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to end session");
      }
    } catch (error) {
      console.error("End session error:", error);
      toast.error("An error occurred while ending the session");
    } finally {
      setEndingSession(false);
    }
  };

  const handleChat = async (patient) => {
    setChatLoading(patient.id);
    try {
      // If chat exists, open it
      if (patient.hasChat && patient.chatId) {
        router.push(`/chat?chatId=${patient.chatId}`);
      } else {
        // Create new chat
        const token = localStorage.getItem("token");
        const response = await fetch("/api/v1/doctors/chats", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            patientId: patient.id,
            title: `Chat with ${patient.name}`,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const chatId = data.data?.id || data.data?._id;
          if (chatId) {
            router.push(`/chat?chatId=${chatId}`);
          } else {
            console.error("No chat ID in response:", data);
          }
        } else {
          console.error("Failed to create chat:", response.statusText);
        }
      }
    } catch (error) {
      console.error("Chat creation error:", error);
    } finally {
      setChatLoading(null);
    }
  };

  // Filter patients
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const matchesSearch = 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm);
      
      const matchesStatus = 
        selectedStatus === "all" || 
        (selectedStatus === "Active" && patient.status === "ACCEPTED") ||
        (selectedStatus === "Completed" && patient.status === "COMPLETED");
      
      return matchesSearch && matchesStatus;
    });
  }, [patients, searchTerm, selectedStatus]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Patients</h1>
          <p className="text-slate-500 mt-1">Manage and communicate with your patients</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search patients by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-slate-200 focus:border-teal-500 focus:ring-teal-500"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedStatus === "all" ? "default" : "outline"}
              onClick={() => setSelectedStatus("all")}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              All
            </Button>
            <Button
              variant={selectedStatus === "Active" ? "default" : "outline"}
              onClick={() => setSelectedStatus("Active")}
              className="flex items-center gap-2"
            >
              Active Sessions
            </Button>
            <Button
              variant={selectedStatus === "Completed" ? "default" : "outline"}
              onClick={() => setSelectedStatus("Completed")}
              className="flex items-center gap-2"
            >
              Completed
            </Button>

            {/* View Mode Toggle */}
            <div className="ml-auto flex gap-1 border border-slate-200 rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8 p-0"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 w-8 p-0"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Patients Grid */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-slate-200">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-slate-200 rounded w-24 mb-2" />
                      <div className="h-3 bg-slate-200 rounded w-16" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-200 rounded" />
                    <div className="h-3 bg-slate-200 rounded w-4/5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => {
              const statusStyle = getStatusStyles(patient.status);
              const StatusIcon = statusStyle.icon;

              return (
                <Card 
                  key={patient.appointmentId || patient.id} 
                  className="border-slate-200 hover:shadow-lg transition-all duration-300 hover:border-teal-300 overflow-hidden group"
                >
                  <CardContent className="p-6">
                    {/* Header with Avatar and Status */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="relative">
                          <Avatar className="h-16 w-16 border-3 border-white shadow-md group-hover:scale-105 transition-transform">
                            <AvatarImage src={patient.avatar} alt={patient.name} />
                            <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${statusStyle.dotColor}`} />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-800">{patient.name}</h3>
                          <Badge 
                            variant="outline" 
                            className={`${statusStyle.badge} text-xs px-2 py-1 mt-2 flex items-center gap-1 w-fit`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusStyle.label}
                          </Badge>
                        </div>
                      </div>

                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Conditions */}
                    {patient.conditions.length > 0 && (
                      <div className="mb-4 pb-4 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 mb-2">CONDITIONS</p>
                        <div className="flex flex-wrap gap-2">
                          {patient.conditions.map((condition, idx) => (
                            <Badge 
                              key={idx} 
                              variant="secondary"
                              className="bg-purple-100 text-purple-700 border-purple-200 text-xs"
                            >
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className="space-y-3 mb-4 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-teal-600" />
                        <a 
                          href={`mailto:${patient.email}`}
                          className="text-sm text-slate-600 hover:text-teal-600 transition-colors"
                        >
                          {patient.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-teal-600" />
                        <a 
                          href={`tel:${patient.phone}`}
                          className="text-sm text-slate-600 hover:text-teal-600 transition-colors"
                        >
                          {patient.phone}
                        </a>
                      </div>
                    </div>

                    {/* Last Visit */}
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-slate-500">LAST VISIT</p>
                      <p className="text-sm text-slate-600 mt-1">{patient.lastVisit}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={() => handleChat(patient)}
                        disabled={chatLoading === patient.id}
                        className="flex-1 bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center gap-2"
                      >
                        {chatLoading === patient.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <MessageCircle className="w-4 h-4" />
                        )}
                        {patient.hasChat ? "Open Chat" : "Start Chat"}
                      </Button>
                      {patient.appointmentStatus === "ACCEPTED" && (
                        <Button
                          onClick={() => setSelectedPatientForSession(patient)}
                          className="flex-1 bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          End Session
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50"
                      >
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
              <Search className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-slate-600 font-medium">No patients found</p>
              <p className="text-slate-500 text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      ) : (
        <Card className="border-slate-200 overflow-hidden">
          {filteredPatients.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredPatients.map((patient) => {
                const statusStyle = getStatusStyles(patient.status);
                const StatusIcon = statusStyle.icon;

                return (
                  <div 
                    key={patient.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors last:border-0 group"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="relative">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                          <AvatarImage src={patient.avatar} alt={patient.name} />
                          <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${statusStyle.dotColor}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800">{patient.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {patient.email}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 flex-1 px-4">
                      <div className="flex flex-wrap gap-1">
                        {patient.conditions.slice(0, 2).map((condition, idx) => (
                          <Badge 
                            key={idx} 
                            variant="secondary"
                            className="bg-purple-100 text-purple-700 border-purple-200 text-xs"
                          >
                            {condition}
                          </Badge>
                        ))}
                        {patient.conditions.length > 2 && (
                          <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-xs">
                            +{patient.conditions.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Badge 
                      variant="outline" 
                      className={`${statusStyle.badge} text-xs px-2 py-1 flex items-center gap-1 w-fit`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {statusStyle.label}
                    </Badge>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        onClick={() => handleChat(patient)}
                        disabled={chatLoading === patient.id}
                        size="sm"
                        className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2"
                      >
                        {chatLoading === patient.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <MessageCircle className="w-3 h-3" />
                        )}
                      </Button>
                      {patient.appointmentStatus === "ACCEPTED" && (
                        <Button
                          onClick={() => setSelectedPatientForSession(patient)}
                          size="sm"
                          className="bg-rose-600 hover:bg-rose-700 text-white"
                        >
                          <CheckCircle className="w-3 h-3" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Search className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-slate-600 font-medium">No patients found</p>
              <p className="text-slate-500 text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </Card>
      )}

      {/* Stats Footer */}
      {!loading && filteredPatients.length > 0 && (
        <div className="grid grid-cols-3 gap-4 pt-4">
          <Card className="border-slate-200">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-teal-600">{patients.length}</p>
              <p className="text-xs text-slate-500 mt-1">Total Patients</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">
                {patients.filter(p => p.status === "ACCEPTED").length}
              </p>
              <p className="text-xs text-slate-500 mt-1">Active Sessions</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">
                {filteredPatients.filter(p => p.hasChat).length}
              </p>
              <p className="text-xs text-slate-500 mt-1">Active Chats</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* End Session Dialog */}
      <Dialog open={!!selectedPatientForSession} onOpenChange={(open) => !open && setSelectedPatientForSession(null)}>
        <DialogContent className="sm:max-w-[500px] bg-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-800">End Session</DialogTitle>
            <DialogDescription className="text-slate-500">
              Complete the session for {selectedPatientForSession?.name}. Please add a detailed checkup report for the parent.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="report" className="text-sm font-semibold text-slate-700">Checkup Report</Label>
              <Textarea
                id="report"
                placeholder="Describe your findings, recommendations, and next steps..."
                value={sessionReport}
                onChange={(e) => setSessionReport(e.target.value)}
                className="min-h-[200px] bg-slate-50 border-slate-200 focus:border-teal-500 focus:ring-teal-500 rounded-2xl"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setSelectedPatientForSession(null)}
              className="rounded-xl border-slate-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEndSession}
              disabled={endingSession || !sessionReport.trim()}
              className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center gap-2"
            >
              {endingSession ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {endingSession ? "Saving..." : "End Session & Send Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
