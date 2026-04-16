import "../../(app)/globals.css";
import Sidebar from "@/components/layout/sidebar/parent-sidebar";

import { Geist, Geist_Mono } from "next/font/google";
import { baloo2, roboto, amaticSC } from "@/app/(app)/fonts/fonts";
import { AppProvider } from "@/components/appProvider/appProvider";
import CheckAuth from "@/components/checkAuth/checkAuth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Script from "next/script";
import Chatbot from "@/components/Chatbot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Dashboard - Tiny Giggle",
  description: "Dashboard - Tiny Giggle",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${baloo2.variable} ${roboto.variable} antialiased`}>
        <AppProvider>
          <CheckAuth />
          <div className="flex">
            <Sidebar />
            {children}
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
