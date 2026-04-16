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
  Loader2,
  Calendar,
  Baby
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card.jsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { useRouter } from "next/navigation";
import { GET, PATCH, POST } from "@/lib/api";
import { toast } from "react-toastify";
import { format } from "date-fns";

const getStatusStyles = (status) => {
  switch (status) {
    case "ACCEPTED":
      return {
        badge: "bg-emerald-50 text-emerald-600 border-emerald-100",
        icon: CheckCircle,
        dotColor: "bg-emerald-500",
        label: "Accepted"
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
    case "REJECTED":
    case "CANCELLED":
      return {
        badge: "bg-rose-50 text-rose-600 border-rose-100",
        icon: AlertCircle,
        dotColor: "bg-rose-500",
        label: status === "REJECTED" ? "Rejected" : "Cancelled"
      };
    default:
      return {
        badge: "bg-slate-50 text-slate-600 border-slate-100",
        icon: Clock,
        dotColor: "bg-slate-400",
        label: status || "Unknown"
      };
  }
};

export default function BabysitterBookings() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [chatLoading, setChatLoading] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data } = await GET("/appointments");
      if (data.success && data.data) {
        setBookings(data.data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (bookingId, status) => {
    setActionLoading(bookingId);
    try {
      const { data } = await PATCH(`/appointments/${bookingId}/status`, { status });
      if (data.success) {
        toast.success(`Booking ${status.toLowerCase()} successfully`);
        fetchBookings();
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleChatClick = async (booking) => {
    setChatLoading(booking.id);
    try {
      if (!booking.parentId && !booking.parent?.id) {
        toast.error("Cannot start chat without a parent profile.");
        return;
      }

      const payloadBody = booking.childId 
        ? { patientId: booking.childId, parentId: booking.parentId || booking.parent?.id }
        : { parentId: booking.parentId || booking.parent?.id };

      // Check for existing chat
      const { data: checkData } = await POST("/babysitters/chats/check", payloadBody);

      if (checkData?.success) {
        if (checkData.data?.id) {
          router.push(`/chat?chatId=${checkData.data.id}`);
          return;
        }
      }

      // Create new chat
      const parentName = booking.parent?.name || "Parent";
      const { data: createData } = await POST("/babysitters/chats", {
        ...payloadBody,
        title: `Chat with ${parentName}`,
      });

      if (createData?.success) {
        if (createData.data?.id) {
          router.push(`/chat?chatId=${createData.data.id}`);
        }
      } else {
        toast.error("Failed to create chat");
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Error starting chat");
    } finally {
      setChatLoading(null);
    }
  };

  // Filter bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const parentName = booking.parent?.name || "";
      const childName = booking.child?.name || "";
      
      const matchesSearch = 
        parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        childName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        selectedStatus === "all" || 
        booking.status === selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, selectedStatus]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">My Bookings</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage your childcare sessions and appointments</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by parent or child name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 rounded-2xl bg-white border-slate-200 focus:border-purple-500 focus:ring-purple-500 shadow-sm"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedStatus === "all" ? "default" : "outline"}
              onClick={() => setSelectedStatus("all")}
              className={`rounded-2xl h-12 px-6 shadow-sm border-slate-200 ${selectedStatus === "all" ? "bg-purple-600 hover:bg-purple-700 text-white" : "text-slate-600 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200"}`}
            >
              <Filter className="w-4 h-4 mr-2" />
              All
            </Button>
            <Button
              variant={selectedStatus === "PENDING" ? "default" : "outline"}
              onClick={() => setSelectedStatus("PENDING")}
              className={`rounded-2xl h-12 px-6 shadow-sm border-slate-200 ${selectedStatus === "PENDING" ? "bg-purple-600 hover:bg-purple-700 text-white" : "text-slate-600 hover:bg-purple-50"}`}
            >
              Pending
            </Button>
            <Button
              variant={selectedStatus === "ACCEPTED" ? "default" : "outline"}
              onClick={() => setSelectedStatus("ACCEPTED")}
              className={`rounded-2xl h-12 px-6 shadow-sm border-slate-200 ${selectedStatus === "ACCEPTED" ? "bg-purple-600 hover:bg-purple-700 text-white" : "text-slate-600 hover:bg-purple-50"}`}
            >
              Accepted
            </Button>

            {/* View Mode Toggle */}
            <div className="ml-auto flex gap-1 border border-slate-200 rounded-2xl p-1 bg-white shadow-sm">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`h-10 w-10 p-0 rounded-xl ${viewMode === "grid" ? "bg-purple-100 text-purple-700" : ""}`}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={`h-10 w-10 p-0 rounded-xl ${viewMode === "list" ? "bg-purple-100 text-purple-700" : ""}`}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-slate-100 rounded-3xl shadow-sm">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-slate-100 rounded-full w-24 mb-2" />
                      <div className="h-3 bg-slate-100 rounded-full w-16" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-100 rounded-full" />
                    <div className="h-3 bg-slate-100 rounded-full w-4/5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => {
              const statusStyle = getStatusStyles(booking.status);
              const StatusIcon = statusStyle.icon;

              return (
                <Card 
                  key={booking.id} 
                  className="border-slate-100 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 rounded-[2rem] overflow-hidden group border-2 hover:border-purple-200 bg-white/50 backdrop-blur-xl"
                >
                  <CardContent className="p-6">
                    {/* Header with Avatar and Status */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="relative">
                          <Avatar className="h-16 w-16 border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                            <AvatarImage src={booking.parent?.profilePicture} alt={booking.parent?.name} />
                            <AvatarFallback className="bg-purple-100 text-purple-700 font-bold text-xl">
                              {booking.parent?.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${statusStyle.dotColor}`} />
                        </div>
                        
                        <div className="flex-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Parent</p>
                          <h3 className="text-xl font-bold text-slate-800 leading-tight">{booking.parent?.name}</h3>
                          <Badge 
                            variant="outline" 
                            className={`${statusStyle.badge} text-[10px] uppercase font-black tracking-wider px-3 py-1 mt-2 flex items-center gap-1.5 w-fit rounded-full border border-current`}
                          >
                            <StatusIcon className="w-3 h-3 block" />
                            {statusStyle.label}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                       {/* Date & Time */}
                       <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100/50">
                         <p className="text-[10px] font-black uppercase text-purple-400 tracking-widest leading-none mb-2 flex items-center gap-1"><Calendar className="w-3 h-3" /> Scheduled</p>
                         <p className="text-sm font-bold text-slate-800">{format(new Date(booking.appointmentDate), "MMM do, yyyy")}</p>
                         <p className="text-xs font-semibold text-slate-500 mt-1">{format(new Date(booking.appointmentDate), "h:mm a")}</p>
                       </div>

                       {/* Child Info */}
                       {booking.child ? (
                         <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                           <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest leading-none mb-2 flex items-center gap-1"><Baby className="w-3 h-3" /> Child</p>
                           <p className="text-sm font-bold text-slate-800">{booking.child.name}</p>
                           <p className="text-xs font-semibold text-slate-500 mt-1">{booking.child.type}</p>
                         </div>
                       ) : (
                         <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-center">
                           <p className="text-xs font-medium text-slate-400">No child specified</p>
                         </div>
                       )}
                    </div>

                    {/* Notes */}
                    {booking.notes && (
                      <div className="mb-6 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-medium text-slate-600 line-clamp-2">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-1">Notes</span>
                        {booking.notes}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-4">
                      {booking.status === "PENDING" && (
                        <>
                          <Button 
                            onClick={() => handleUpdateStatus(booking.id, "ACCEPTED")}
                            disabled={actionLoading === booking.id}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-12 font-bold shadow-lg shadow-purple-200"
                          >
                            {actionLoading === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Accept"}
                          </Button>
                          <Button 
                            onClick={() => handleUpdateStatus(booking.id, "REJECTED")}
                            disabled={actionLoading === booking.id}
                            variant="outline"
                            className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl h-12 font-bold"
                          >
                            {actionLoading === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Decline"}
                          </Button>
                        </>
                      )}
                      
                      {booking.status === "ACCEPTED" && (
                        <>
                          <Button 
                            onClick={() => handleUpdateStatus(booking.id, "COMPLETED")}
                            disabled={actionLoading === booking.id}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 font-bold shadow-lg shadow-emerald-200"
                          >
                            {actionLoading === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Complete Session"}
                          </Button>
                          <Button 
                            onClick={() => handleChatClick(booking)}
                            disabled={chatLoading === booking.id || (!booking.parentId && !booking.parent?.id)}
                            className="flex-none bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-12 px-6 font-bold shadow-lg gap-2"
                          >
                            {chatLoading === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                          </Button>
                        </>
                      )}

                      {["COMPLETED", "REJECTED", "CANCELLED"].includes(booking.status) && (
                         <Button 
                           disabled
                           variant="outline"
                           className="w-full h-12 rounded-xl font-bold bg-slate-50 border-slate-200 text-slate-400"
                         >
                           {booking.status === "COMPLETED" ? "Session Completed" : "Archived"}
                         </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
              <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-10 h-10 text-purple-300" />
              </div>
              <p className="text-xl font-black text-slate-800">No bookings found</p>
              <p className="text-slate-500 font-medium mt-1 text-center max-w-sm">We couldn't find any bookings matching your current filters.</p>
            </div>
          )}
        </div>
      ) : (
        <Card className="border-slate-100 rounded-3xl overflow-hidden shadow-sm">
          {filteredBookings.length > 0 ? (
            <div className="divide-y divide-slate-100 bg-white">
              {filteredBookings.map((booking) => {
                const statusStyle = getStatusStyles(booking.status);
                
                return (
                  <div 
                    key={booking.id}
                    className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                        <AvatarImage src={booking.parent?.profilePicture} alt={booking.parent?.name} />
                        <AvatarFallback className="bg-purple-100 text-purple-700 font-bold">{booking.parent?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-bold text-slate-800 leading-tight">{booking.parent?.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                           <Badge variant="outline" className={`${statusStyle.badge} text-[9px] uppercase font-black px-2 py-0 h-5`}>
                             {statusStyle.label}
                           </Badge>
                           <span className="text-xs font-semibold text-slate-500">
                             {format(new Date(booking.appointmentDate), "MMM d, h:mm a")}
                           </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {booking.status === "PENDING" && (
                        <>
                          <Button size="sm" onClick={() => handleUpdateStatus(booking.id, "ACCEPTED")} disabled={actionLoading === booking.id} className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg h-9 px-4">Accept</Button>
                          <Button size="sm" onClick={() => handleUpdateStatus(booking.id, "REJECTED")} disabled={actionLoading === booking.id} variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 font-bold rounded-lg h-9 px-4">Decline</Button>
                        </>
                      )}
                      {booking.status === "ACCEPTED" && (
                        <>
                          <Button size="sm" onClick={() => handleUpdateStatus(booking.id, "COMPLETED")} disabled={actionLoading === booking.id} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg h-9 px-4">Complete</Button>
                          <Button size="sm" onClick={() => handleChatClick(booking)} disabled={chatLoading === booking.id || (!booking.parentId && !booking.parent?.id)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg h-9 px-4 flex items-center gap-2">
                            {chatLoading === booking.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <MessageCircle className="w-3 h-3" />}
                            Chat
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <Calendar className="w-12 h-12 text-slate-200 mb-3" />
              <p className="text-slate-600 font-medium text-lg">No bookings found</p>
            </div>
          )}
        </Card>
      )}

      {/* Stats Footer */}
      {!loading && filteredBookings.length > 0 && (
        <div className="grid grid-cols-3 gap-6 pt-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
             <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center shrink-0">
               <Calendar className="w-6 h-6 text-purple-600" />
             </div>
             <div>
               <p className="text-3xl font-black text-slate-800 leading-none mb-1">{bookings.length}</p>
               <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Total Bookings</p>
             </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
             <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
               <CheckCircle className="w-6 h-6 text-emerald-600" />
             </div>
             <div>
               <p className="text-3xl font-black text-slate-800 leading-none mb-1">{bookings.filter(b => b.status === "ACCEPTED").length}</p>
               <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Active Jobs</p>
             </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
             <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0">
               <Clock className="w-6 h-6 text-amber-600" />
             </div>
             <div>
               <p className="text-3xl font-black text-slate-800 leading-none mb-1">{bookings.filter(b => b.status === "PENDING").length}</p>
               <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Pending Requests</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
