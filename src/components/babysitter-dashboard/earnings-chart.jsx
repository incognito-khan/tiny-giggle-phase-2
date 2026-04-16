"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card.jsx";

const COLORS = ["#A855F7", "#9333EA", "#7E22CE", "#70197a", "#581C87", "#3B0764", "#2E1065"];

const DEFAULT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => ({ day, amount: 0 }));

export default function EarningsChart({ data, total, loading }) {
  const chartData = data?.length ? data : DEFAULT_DAYS;
  const weeklyTotal = total ?? 0;

  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden h-[400px] rounded-3xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-purple-50 to-transparent">
        <div>
          <CardTitle className="text-xl font-black text-slate-800 tracking-tight">
            Weekly Earnings
          </CardTitle>
          <p className="text-sm text-slate-500 font-medium">
            Your revenue for the last 7 days
          </p>
        </div>
        <div className="bg-white p-2 px-4 rounded-2xl shadow-sm border border-purple-50">
          {loading ? (
            <div className="h-8 w-20 bg-slate-100 animate-pulse rounded-lg" />
          ) : (
            <>
              <span className="text-2xl font-black text-purple-600">
                ${weeklyTotal.toLocaleString()}
              </span>
              <span className="text-[10px] block text-slate-400 font-bold uppercase tracking-wider">
                This Week
              </span>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="h-full pb-14 pt-8">
        {loading ? (
          <div className="flex items-end justify-around h-full pb-10 gap-3">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-slate-100 animate-pulse rounded-t-xl"
                style={{ height: `${30 + Math.random() * 50}%` }}
              />
            ))}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3E8FF" />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#7E22CE", fontSize: 12, fontWeight: 600 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#7E22CE", fontSize: 12, fontWeight: 600 }}
                tickFormatter={v => (v === 0 ? "0" : `$${v}`)}
              />
              <Tooltip
                cursor={{ fill: "#F5F3FF" }}
                formatter={(value) => [`$${value}`, "Earnings"]}
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "20px",
                  border: "1px solid #F3E8FF",
                  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05)",
                  padding: "12px",
                }}
                itemStyle={{ color: "#7E22CE", fontWeight: 800 }}
                labelStyle={{ color: "#581C87", fontWeight: 700, marginBottom: "4px" }}
              />
              <Bar dataKey="amount" radius={[10, 10, 0, 0]} animationDuration={1500}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
