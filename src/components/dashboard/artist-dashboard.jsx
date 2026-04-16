import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useDispatch, useSelector } from "react-redux";
import { getArtistData } from "@/store/slices/dashboardSlice";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell
} from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f7f"];

const ArtistDashboard = ({ setLoading }) => {
    const data = useSelector((state) => state.dashboard.artist);
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getArtistData({ setLoading, adminId: user?.id }));
    }, []);

    // Pie chart data for FREE vs PAID
    const freePaidData = [
        { name: "Free Music", value: data.freeMusicCount },
        { name: "Paid Music", value: data.paidMusicCount }
    ];

    // Bar chart for revenue per music
    const revenueData = data.revenuePerMusic?.map((item) => ({
        name: item.title,
        revenue: item.revenue,
    }));

    return (
        <div className="p-6 space-y-6 bg-gradient-to-b from-purple-50 to-blue-50 min-h-screen">

            {/* Top Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-purple-200 text-purple-900">
                    <CardContent>
                        <CardTitle>Total Music</CardTitle>
                        <p className="text-2xl font-bold">{data.totalMusic}</p>
                    </CardContent>
                </Card>

                <Card className="bg-pink-200 text-pink-900">
                    <CardContent>
                        <CardTitle>Total Purchases</CardTitle>
                        <p className="text-2xl font-bold">{data.totalPurchases}</p>
                    </CardContent>
                </Card>

                <Card className="bg-blue-200 text-blue-900">
                    <CardContent>
                        <CardTitle>Total Favorites</CardTitle>
                        <p className="text-2xl font-bold">{data.totalFavorites}</p>
                    </CardContent>
                </Card>

                <Card className="bg-green-200 text-green-900">
                    <CardContent>
                        <CardTitle>Total Earnings</CardTitle>
                        <p className="text-2xl font-bold">${data.totalEarnings}</p>
                    </CardContent>
                </Card>
            </div>

            <Separator />

            {/* FREE / PAID + Uploads & Revenue Charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Charts Column */}
                <div className="md:col-span-2 flex gap-4 w-full">

                    {/* Monthly Uploads */}
                    <Card className="w-1/2">
                        <CardHeader>
                            <CardTitle>Monthly Uploads</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={data.monthlyUploads}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#8884d8"
                                        strokeWidth={3}
                                        dot={{ r: 5 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Free vs Paid */}
                    <Card className="w-1/2">
                        <CardHeader>
                            <CardTitle>Free vs Paid Music</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={freePaidData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label
                                    >
                                        {freePaidData.map((_, index) => (
                                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                </div>

                {/* Right Side Cards */}
                <div className="flex flex-col gap-3">

                    <Card className="bg-purple-100 text-purple-800 h-32 flex flex-col justify-center">
                        <CardContent>
                            <CardTitle>Free Music</CardTitle>
                            <p className="text-xl font-bold">{data.freeMusicCount}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-pink-100 text-pink-800 h-32 flex flex-col justify-center">
                        <CardContent>
                            <CardTitle>Paid Music</CardTitle>
                            <p className="text-xl font-bold">{data.paidMusicCount}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-100 text-blue-800 h-32 flex flex-col justify-center">
                        <CardContent>
                            <CardTitle>Total Purchases</CardTitle>
                            <p className="text-xl font-bold">{data.totalPurchases}</p>
                        </CardContent>
                    </Card>
                </div>

            </div>

            <Separator />

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-green-100 text-green-800">
                    <CardContent>
                        <CardTitle>Revenue Sources</CardTitle>
                        <p className="text-xl font-bold">{data.revenuePerMusic?.length}</p>
                    </CardContent>
                </Card>

                <Card className="bg-purple-100 text-purple-800">
                    <CardContent>
                        <CardTitle>Most Purchased Music</CardTitle>
                        <p className="text-xl font-bold">{data.revenuePerMusic?.[0]?.title || "N/A"}</p>
                    </CardContent>
                </Card>

                <Card className="bg-pink-100 text-pink-800">
                    <CardContent>
                        <CardTitle>Top Favorite Track</CardTitle>
                        <p className="text-xl font-bold">{data.topFavoriteTitle || "N/A"}</p>
                    </CardContent>
                </Card>
            </div>

            <Separator />

            {/* Scrollable Revenue List */}
            <Card className="bg-blue-50">
                <CardHeader>
                    <CardTitle>Revenue Per Music</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-64">
                        <div className="space-y-2">
                            {revenueData?.map((item) => (
                                <div
                                    key={item.name}
                                    className="flex justify-between p-4 bg-white rounded-md shadow-sm"
                                >
                                    <span className="text-gray-800">{item.name}</span>
                                    <span className="text-gray-900 font-semibold">${item.revenue}</span>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

        </div>
    );
};

export default ArtistDashboard;
