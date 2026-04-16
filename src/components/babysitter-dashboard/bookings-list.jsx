"use client";

import React from "react";
import { Clock, CheckCircle2, MoreVertical, Calendar, Baby, User } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card.jsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { format } from "date-fns";
import Link from "next/link";

const getStatusStyles = (status) => {
  switch (status) {
    case "ACCEPTED":  return "bg-emerald-50 text-emerald-600 border-emerald-100";
    case "PENDING":   return "bg-amber-50 text-amber-600 border-amber-100";
    case "REJECTED":  return "bg-rose-50 text-rose-600 border-rose-100";
    case "COMPLETED": return "bg-purple-50 text-purple-600 border-purple-100";
    default:          return "bg-slate-50 text-slate-600 border-slate-100";
  }
};

const statusLabel = (status) => {
  switch (status) {
    case "ACCEPTED":  return "Confirmed";
    case "PENDING":   return "Pending";
    case "REJECTED":  return "Rejected";
    case "COMPLETED": return "Completed";
    default:          return status;
  }
};

export default function BookingsList({ bookings, loading }) {
  const confirmedCount = (bookings || []).filter(b => b.status === "ACCEPTED").length;

  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden rounded-3xl">
      <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
        <div>
          <CardTitle className="text-xl font-black text-slate-800 tracking-tight">
            Active Bookings
          </CardTitle>
          {loading ? (
            <div className="h-4 w-40 bg-slate-100 animate-pulse rounded-lg mt-1" />
          ) : (
            <p className="text-sm text-slate-500 font-medium">
              {bookings?.length
                ? `You have ${confirmedCount} confirmed booking${confirmedCount !== 1 ? "s" : ""}`
                : "No upcoming bookings"}
            </p>
          )}
        </div>
        <Link href="/babysitter-dashboard/bookings">
          <Button variant="ghost" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-xl font-bold">
            View All
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="px-0">
        {loading ? (
          <div className="space-y-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-5 border-b border-slate-50 last:border-0">
                <div className="w-14 h-14 bg-slate-100 animate-pulse rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 animate-pulse rounded-lg w-32" />
                  <div className="h-3 bg-slate-100 animate-pulse rounded-lg w-24" />
                  <div className="h-3 bg-slate-100 animate-pulse rounded-lg w-40" />
                </div>
              </div>
            ))}
          </div>
        ) : !bookings?.length ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-3">
              <Calendar className="w-8 h-8 text-purple-300" />
            </div>
            <p className="text-slate-600 font-bold">No upcoming bookings</p>
            <p className="text-slate-400 text-sm mt-1">Accepted & pending sessions will appear here.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between px-6 py-5 hover:bg-purple-50/30 transition-all cursor-pointer border-b border-slate-50 last:border-0 group"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-14 w-14 border-4 border-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <AvatarImage src={booking.parent?.profilePicture} alt={booking.parent?.name} />
                      <AvatarFallback className="bg-purple-100 text-purple-700 font-bold text-lg">
                        {booking.parent?.name?.charAt(0) || <User className="w-5 h-5" />}
                      </AvatarFallback>
                    </Avatar>
                    {booking.status === "ACCEPTED" && (
                      <div className="absolute -right-1 -bottom-1 bg-white rounded-full p-0.5 shadow-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-white" />
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-purple-600 transition-colors">
                      {booking.parent?.name || "Unknown Parent"}
                    </h4>
                    {booking.child ? (
                      <p className="text-xs font-black text-purple-500 uppercase tracking-widest mt-0.5 flex items-center gap-1">
                        <Baby className="w-3 h-3" />
                        {booking.child.name}
                        {booking.child.type ? ` · ${booking.child.type}` : ""}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 mt-0.5">No child specified</p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-purple-400" />
                        {format(new Date(booking.appointmentDate), "MMM d, yyyy · h:mm a")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge
                    variant="outline"
                    className={`${getStatusStyles(booking.status)} px-3 py-1 rounded-2xl font-bold border`}
                  >
                    {statusLabel(booking.status)}
                  </Badge>
                  <Button variant="ghost" size="icon" className="text-slate-300 hover:text-slate-600 rounded-full">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
