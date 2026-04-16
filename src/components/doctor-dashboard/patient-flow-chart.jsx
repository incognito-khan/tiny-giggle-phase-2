"use client";

import React from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card.jsx";

export default function PatientFlowChart({ data = [] }) {
  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden h-[400px]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl font-bold text-slate-800">Patient Flow</CardTitle>
          <p className="text-sm text-slate-500">Weekly appointment distribution</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-xs text-slate-500">Appointments</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-full pb-14 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#70197a" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#70197a" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
              }}
              cursor={{ stroke: '#E2E8F0', strokeWidth: 2 }}
            />
            <Area 
              type="monotone" 
              dataKey="patients" 
              stroke="#70197a" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPatients)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
