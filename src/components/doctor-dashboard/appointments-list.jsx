"use client";

import React from "react";
import { Clock, MoreVertical, BadgeCheck, CircleAlert } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card.jsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";

import { format } from "date-fns";

const getStatusStyles = (status) => {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-600 border-emerald-100";
    case "ACCEPTED":
      return "bg-blue-50 text-blue-600 border-blue-100";
    case "PENDING":
      return "bg-amber-50 text-amber-600 border-amber-100";
    case "REJECTED":
    case "CANCELLED":
      return "bg-rose-50 text-rose-600 border-rose-100";
    default:
      return "bg-slate-50 text-slate-600 border-slate-100";
  }
};

export default function AppointmentsList({ appointments = [] }) {
  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold text-slate-800">Upcoming Appointments</CardTitle>
          <p className="text-sm text-slate-500">
            {appointments.length > 0 
              ? `You have ${appointments.length} upcoming appointments`
              : "No upcoming appointments scheduled"}
          </p>
        </div>
        <Button variant="ghost" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50">View All</Button>
      </CardHeader>
      <CardContent className="px-0">
        <div className="space-y-1">
          {appointments.map((appointment) => (
            <div 
              key={appointment.id} 
              className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 group"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                  <AvatarImage src={appointment.parent?.profilePicture} />
                  <AvatarFallback>{appointment.child?.name?.charAt(0) || "P"}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-slate-800">{appointment.child?.name || "Unknown Patient"}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 
                      {appointment.appointmentDate ? format(new Date(appointment.appointmentDate), "hh:mm a") : "TBD"}
                    </span>
                    <span className="text-slate-200">|</span>
                    <span className="text-xs text-slate-500">{appointment.child?.type || "General"}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Badge variant="outline" className={`${getStatusStyles(appointment.status)} px-3 py-1 rounded-full font-medium border text-[10px]`}>
                  {appointment.status}
                </Badge>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
