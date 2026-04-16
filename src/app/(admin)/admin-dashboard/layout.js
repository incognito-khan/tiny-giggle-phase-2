"use client";

import { AdminSidebar } from "@/components/layout/sidebar/admin-sidebar";

export default function AdminDashboardLayout({ children }) {
  return (
    <div className="flex w-full min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-[#F9FAFB]">
        {children}
      </main>
    </div>
  );
}
