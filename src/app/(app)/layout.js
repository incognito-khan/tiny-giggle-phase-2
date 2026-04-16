import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { baloo2, roboto, amaticSC } from "./fonts/fonts";
import { AppProvider } from "@/components/appProvider/appProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
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
  title: "Tiny Giggle",
  description: "Tiny Giggle",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${baloo2.variable} ${roboto.variable} antialiased`}>
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
        >
          <AppProvider>
            <Navbar />
            {children}
            <Footer />
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
        </GoogleOAuthProvider>

        <Chatbot />
      </body>
    </html>
  );
}
