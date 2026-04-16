'use client';

import React, { useState } from 'react';
import SupplierDashboard from "@/components/dashboard/supplier-dashboard";
import ArtistDashboard from '@/components/dashboard/artist-dashboard';
import AdminDashboard from '@/components/dashboard/admin-dashboard';
import { useSelector } from 'react-redux';
import Loading from '@/components/loading';
import AdminHeader from "@/components/layout/header/admin-header";

const data = {
  "totalProducts": 25,
  "totalOrders": 120,
  "totalEarnings": 45230,
  "avgOrderValue": 376.91,
  "pendingOrders": 10,
  "inProgressOrders": 15,
  "completedOrders": 85,
  "cancelOrders": 5,
  "returnRequestOrders": 3,
  "returnedOrders": 2,
  "refundedOrders": 1,
  "failedOrders": 4,
  "pendingPayments": 7,
  "totalQuantitySold": 340,
  "revenuePerProduct": [
    {
      "productId": "prod_001",
      "productName": "Wireless Mouse",
      "quantitySold": 50,
      "revenue": 2500
    },
    {
      "productId": "prod_002",
      "productName": "Mechanical Keyboard",
      "quantitySold": 30,
      "revenue": 9000
    },
    {
      "productId": "prod_003",
      "productName": "USB-C Hub",
      "quantitySold": 20,
      "revenue": 4000
    }
  ],
  "monthlyOrders": [
    { "date": "2025-11-01", "count": 5 },
    { "date": "2025-11-02", "count": 8 },
    { "date": "2025-11-03", "count": 10 },
    { "date": "2025-11-04", "count": 6 }
  ],
  "lowStockProducts": 4,
  "returnRate": 2.5
}

const AdminDashboardPage = () => {
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);
  return (
    <div className='mx-auto w-full p-6 space-y-6'>
      {loading && <Loading />}
      <AdminHeader title={user?.role === 'supplier' ? "Supplier Dashboard" : user?.role === 'artist' ? "Artist Dashboard" : user?.role === 'admin' ? "Admin Dashboard" : ""} subTitle="Your Summary" />
      {user?.role === "supplier" && (
        <SupplierDashboard setLoading={setLoading} />
      )}
      {user?.role === 'artist' && (
        <ArtistDashboard setLoading={setLoading} />
      )}
      {user?.role === 'admin' && (
        <AdminDashboard setLoading={setLoading} />
      )}
    </div>
  )
}

export default AdminDashboardPage;
