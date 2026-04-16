import "../(app)/globals.css";
import { baloo2, roboto } from "@/app/(app)/fonts/fonts";
import { AppProvider } from "@/components/appProvider/appProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Chatbot from "@/components/Chatbot";

export const metadata = {
  title: "Admin Panel | Tiny Giggle",
  description: "Administrative dashboard for Tiny Giggle",
};

export default function AdminRootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${baloo2.variable} ${roboto.variable} antialiased`}>
        <AppProvider>
          {children}
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
