import "../../(app)/globals.css";
import Sidebar from "@/components/layout/sidebar/doctor-sidebar";

import { baloo2, roboto } from "@/app/(app)/fonts/fonts";
import { AppProvider } from "@/components/appProvider/appProvider";
import CheckAuth from "@/components/checkAuth/checkAuth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Chatbot from "@/components/Chatbot";

export const metadata = {
  title: "Doctor Dashboard - Tiny Giggle",
  description: "Modern healthcare management for Tiny Giggle doctors",
};

export default function DoctorLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${baloo2.variable} ${roboto.variable} antialiased bg-[#F9FAFB]`}>
        <AppProvider>
          <CheckAuth />
          <div className="flex min-h-screen relative">
            <Sidebar />
            <main className="flex-1 lg:ml-72 transition-all duration-300 ease-in-out">
              <div className="p-4 md:p-8 max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
          <ToastContainer
            position="top-right"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            draggable
          />
        </AppProvider>

        <Chatbot />
      </body>
    </html>
  );
}
