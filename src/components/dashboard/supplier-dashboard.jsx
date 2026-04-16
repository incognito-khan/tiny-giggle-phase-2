// import React, { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Separator } from "@/components/ui/separator";
// import { useDispatch, useSelector } from "react-redux";
// import { getSupplierData } from "@/store/slices/dashboardSlice";

// const SupplierDashboard = ({ setLoading }) => {
//     const data = useSelector((state) => state.dashboard.supplier);
//     const user = useSelector((state) => state.auth.user);
//     const dispatch = useDispatch();

//     const gettingSupplierData = () => {
//         dispatch(getSupplierData({ setLoading, adminId: user?.id }))
//     };

//     useEffect(() => {
//         gettingSupplierData();
//     }, []);

//     return (
//         <div className="p-6 space-y-6 bg-gradient-to-b from-purple-50 to-blue-50 min-h-screen">

//             {/* Top Stats */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//                 <Card className="bg-purple-200 text-purple-900">
//                     <CardContent>
//                         <CardTitle>Total Products</CardTitle>
//                         <p className="text-2xl font-bold">{data.totalProducts}</p>
//                     </CardContent>
//                 </Card>

//                 <Card className="bg-pink-200 text-pink-900">
//                     <CardContent>
//                         <CardTitle>Total Orders</CardTitle>
//                         <p className="text-2xl font-bold">{data.totalOrders}</p>
//                     </CardContent>
//                 </Card>

//                 <Card className="bg-blue-200 text-blue-900">
//                     <CardContent>
//                         <CardTitle>Total Earnings</CardTitle>
//                         <p className="text-2xl font-bold">${data.totalEarnings}</p>
//                     </CardContent>
//                 </Card>

//                 <Card className="bg-green-200 text-green-900">
//                     <CardContent>
//                         <CardTitle>Average Order Value</CardTitle>
//                         <p className="text-2xl font-bold">${data?.avgOrderValue?.toFixed(2)}</p>
//                     </CardContent>
//                 </Card>
//             </div>

//             <Separator />

//             {/* Order Status */}
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 <Card className="bg-purple-100 text-purple-800">
//                     <CardContent>
//                         <CardTitle>Pending Orders</CardTitle>
//                         <p className="text-xl font-bold">{data.pendingOrders}</p>
//                     </CardContent>
//                 </Card>

//                 <Card className="bg-pink-100 text-pink-800">
//                     <CardContent>
//                         <CardTitle>In Progress Orders</CardTitle>
//                         <p className="text-xl font-bold">{data.inProgressOrders}</p>
//                     </CardContent>
//                 </Card>

//                 <Card className="bg-blue-100 text-blue-800">
//                     <CardContent>
//                         <CardTitle>Completed Orders</CardTitle>
//                         <p className="text-xl font-bold">{data.completedOrders}</p>
//                     </CardContent>
//                 </Card>

//                 <Card className="bg-green-100 text-green-800">
//                     <CardContent>
//                         <CardTitle>Cancelled Orders</CardTitle>
//                         <p className="text-xl font-bold">{data.cancelOrders}</p>
//                     </CardContent>
//                 </Card>
//             </div>

//             <Separator />

//             {/* Returns and Refunds */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <Card className="bg-purple-100 text-purple-800">
//                     <CardContent>
//                         <CardTitle>Return Requests</CardTitle>
//                         <p className="text-xl font-bold">{data.returnRequestOrders}</p>
//                     </CardContent>
//                 </Card>

//                 <Card className="bg-pink-100 text-pink-800">
//                     <CardContent>
//                         <CardTitle>Returned Orders</CardTitle>
//                         <p className="text-xl font-bold">{data.returnedOrders}</p>
//                     </CardContent>
//                 </Card>

//                 <Card className="bg-blue-100 text-blue-800">
//                     <CardContent>
//                         <CardTitle>Refunded Orders</CardTitle>
//                         <p className="text-xl font-bold">{data.refundedOrders}</p>
//                     </CardContent>
//                 </Card>
//             </div>

//             <Separator />

//             {/* Additional Stats */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <Card className="bg-green-100 text-green-800">
//                     <CardContent>
//                         <CardTitle>Total Quantity Sold</CardTitle>
//                         <p className="text-xl font-bold">{data.totalQuantitySold}</p>
//                     </CardContent>
//                 </Card>

//                 <Card className="bg-purple-100 text-purple-800">
//                     <CardContent>
//                         <CardTitle>Low Stock Products</CardTitle>
//                         <p className="text-xl font-bold">{data.lowStockProducts}</p>
//                     </CardContent>
//                 </Card>

//                 <Card className="bg-pink-100 text-pink-800">
//                     <CardContent>
//                         <CardTitle>Return Rate</CardTitle>
//                         <p className="text-xl font-bold">{data?.returnRate?.toFixed(2)}%</p>
//                     </CardContent>
//                 </Card>
//             </div>

//             <Separator />

//             {/* Scrollable Revenue Per Product */}
//             <Card className="bg-blue-50">
//                 <CardHeader>
//                     <CardTitle>Revenue per Product</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                     <ScrollArea className="h-64">
//                         <div className="space-y-2">
//                             {data?.revenuePerProduct?.map((item) => (
//                                 <div key={item.productId} className="flex justify-between p-2 bg-white rounded-md shadow-sm">
//                                     <span className="text-gray-800">{item.productName}</span>
//                                     <span className="text-gray-900 font-semibold">${item.revenue}</span>
//                                 </div>
//                             ))}
//                         </div>
//                     </ScrollArea>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// };

// export default SupplierDashboard;

import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useDispatch, useSelector } from "react-redux";
import { getSupplierData } from "@/store/slices/dashboardSlice";

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
    Cell,
} from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f7f"];

const SupplierDashboard = ({ setLoading }) => {
    const data = useSelector((state) => state.dashboard.supplier);
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();

    const gettingSupplierData = () => {
        dispatch(getSupplierData({ setLoading, adminId: user?.id }));
    };

    useEffect(() => {
        gettingSupplierData();
    }, []);

    // Prepare chart data
    const orderStatusData = [
        { name: "Pending", value: data.pendingOrders },
        { name: "In Progress", value: data.inProgressOrders },
        { name: "Completed", value: data.completedOrders },
        { name: "Cancelled", value: data.cancelOrders },
    ];

    const revenueData = data.revenuePerProduct?.map((item) => ({
        name: item.productName,
        revenue: item.revenue,
    }));

    return (
        <div className="p-6 space-y-6 bg-gradient-to-b from-purple-50 to-blue-50 min-h-screen">

            {/* Top Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-purple-200 text-purple-900">
                    <CardContent>
                        <CardTitle>Total Products</CardTitle>
                        <p className="text-2xl font-bold">{data.totalProducts}</p>
                    </CardContent>
                </Card>

                <Card className="bg-pink-200 text-pink-900">
                    <CardContent>
                        <CardTitle>Total Orders</CardTitle>
                        <p className="text-2xl font-bold">{data.totalOrders}</p>
                    </CardContent>
                </Card>

                <Card className="bg-blue-200 text-blue-900">
                    <CardContent>
                        <CardTitle>Total Earnings</CardTitle>
                        <p className="text-2xl font-bold">${data.totalEarnings}</p>
                    </CardContent>
                </Card>

                <Card className="bg-green-200 text-green-900">
                    <CardContent>
                        <CardTitle>Average Order Value</CardTitle>
                        <p className="text-2xl font-bold">${data?.avgOrderValue?.toFixed(2)}</p>
                    </CardContent>
                </Card>
            </div>

            <Separator />

            {/* Order Status */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-purple-100 text-purple-800">
                    <CardContent>
                        <CardTitle>Pending Orders</CardTitle>
                        <p className="text-xl font-bold">{data.pendingOrders}</p>
                    </CardContent>
                </Card>

                <Card className="bg-pink-100 text-pink-800">
                    <CardContent>
                        <CardTitle>In Progress Orders</CardTitle>
                        <p className="text-xl font-bold">{data.inProgressOrders}</p>
                    </CardContent>
                </Card>

                <Card className="bg-blue-100 text-blue-800">
                    <CardContent>
                        <CardTitle>Completed Orders</CardTitle>
                        <p className="text-xl font-bold">{data.completedOrders}</p>
                    </CardContent>
                </Card>

                <Card className="bg-green-100 text-green-800">
                    <CardContent>
                        <CardTitle>Cancelled Orders</CardTitle>
                        <p className="text-xl font-bold">{data.cancelOrders}</p>
                    </CardContent>
                </Card>
            </div>

            <Separator />

            {/* Returns and Refunds */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Charts Column */}
                <div className="md:col-span-2 flex gap-4 w-full">
                    {/* Orders Over Time */}
                    <Card className="w-1/2">
                        <CardHeader>
                            <CardTitle>Orders Over Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={data.monthlyOrders}>
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

                    {/* Revenue per Product */}
                    <Card className="w-1/2">
                    <CardHeader>
                        <CardTitle>Order Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={orderStatusData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label
                                >
                                    {orderStatusData.map((_, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                </div>

                {/* Right Column Cards */}
                <div className="flex flex-col gap-3">
                    <Card className="bg-purple-100 text-purple-800 h-32 flex flex-col justify-center">
                        <CardContent>
                            <CardTitle>Return Requests</CardTitle>
                            <p className="text-xl font-bold">{data.returnRequestOrders}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-pink-100 text-pink-800 h-32 flex flex-col justify-center">
                        <CardContent>
                            <CardTitle>Returned Orders</CardTitle>
                            <p className="text-xl font-bold">{data.returnedOrders}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-100 text-blue-800 h-32 flex flex-col justify-center">
                        <CardContent>
                            <CardTitle>Refunded Orders</CardTitle>
                            <p className="text-xl font-bold">{data.refundedOrders}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>




            <Separator />

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-green-100 text-green-800">
                    <CardContent>
                        <CardTitle>Total Quantity Sold</CardTitle>
                        <p className="text-xl font-bold">{data.totalQuantitySold}</p>
                    </CardContent>
                </Card>

                <Card className="bg-purple-100 text-purple-800">
                    <CardContent>
                        <CardTitle>Low Stock Products</CardTitle>
                        <p className="text-xl font-bold">{data.lowStockProducts}</p>
                    </CardContent>
                </Card>

                <Card className="bg-pink-100 text-pink-800">
                    <CardContent>
                        <CardTitle>Return Rate</CardTitle>
                        <p className="text-xl font-bold">{data?.returnRate?.toFixed(2)}%</p>
                    </CardContent>
                </Card>
            </div>

            <Separator />

            {/* Scrollable Revenue Per Product */}
            <Card className="bg-blue-50">
                <CardHeader>
                    <CardTitle>Revenue per Product</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-64">
                        <div className="space-y-2">
                            {data?.revenuePerProduct?.map((item) => (
                                <div
                                    key={item.productId}
                                    className="flex justify-between p-4 bg-white rounded-md shadow-sm"
                                >
                                    <span className="text-gray-800">{item.productName}</span>
                                    <span className="text-gray-900 font-semibold">${item.revenue}</span>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Charts Section */}
            {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Orders Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data.monthlyOrders}>
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

                <Card>
                    <CardHeader>
                        <CardTitle>Revenue per Product</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="revenue" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Order Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={orderStatusData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label
                                >
                                    {orderStatusData.map((_, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div> */}
        </div>
    );
};

export default SupplierDashboard;
