"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CheckCircle2, Loader2, ArrowRight, Home } from "lucide-react";
import Link from "next/link";

export default function JoinSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("Verifying your payment...");

  const sessionId = searchParams.get("session_id");
  const type = searchParams.get("type");

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  useEffect(() => {
    if (!sessionId || !type) {
      setStatus("error");
      setMessage("Missing session information.");
      return;
    }

    const confirmPayment = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setStatus("error");
          setMessage("Authentication required. Please login to confirm your activation.");
          return;
        }

        let endpoint = "";
        switch (type) {
          case "DOCTOR_ACTIVATION":
            endpoint = "/api/v1/auth/doctor/payment/confirm";
            break;
          case "BABYSITTER_ACTIVATION":
            endpoint = "/api/v1/auth/babysitter/payment/confirm";
            break;
          case "ARTIST_ACTIVATION":
            endpoint = "/api/v1/auth/artist/payment/confirm";
            break;
          case "SUPPLIER_ACTIVATION":
            endpoint = "/api/v1/auth/supplier/payment/confirm";
            break;
          default:
            throw new Error("Invalid activation type");
        }

        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ sessionId })
        });

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage("Your account has been successfully activated!");
          toast.success("Account activated!");
        } else {
          // If the token is invalid or expired, clear it
          if (res.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setIsLoggedIn(false);
          }
          setStatus("error");
          setMessage(data.message || "Failed to verify payment.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("An unexpected error occurred.");
        console.error(err);
      }
    };

    confirmPayment();
  }, [sessionId, type]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-600 to-orange-400 flex items-center justify-center p-6 text-center">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center">
        
        {status === "loading" && (
          <>
            <div className="mb-6 bg-purple-100 p-6 rounded-full animate-pulse">
              <Loader2 size={64} className="text-purple-600 animate-spin" />
            </div>
            <h1 className="text-3xl font-black text-gray-800 mb-4 tracking-tight">One Moment...</h1>
            <p className="text-gray-500 font-medium leading-relaxed">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mb-6 bg-green-100 p-6 rounded-full">
              <CheckCircle2 size={64} className="text-green-600" />
            </div>
            <h1 className="text-4xl font-black text-gray-800 mb-4 tracking-tight">Awesome!</h1>
            <p className="text-gray-500 font-medium leading-relaxed mb-10">
              {message} Welcome to the TinyGiggle team. You can now access your professional tools.
            </p>
            <div className="w-full grid gap-3">
                {isLoggedIn ? (
                    <Link 
                        href={
                            type === "DOCTOR_ACTIVATION" ? "/doctor-dashboard" :
                            type === "BABYSITTER_ACTIVATION" ? "/babysitter-dashboard" :
                            "/admin-dashboard"
                        } 
                        className="flex items-center justify-center gap-2 w-full bg-purple-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-purple-700 transition-all active:scale-95"
                    >
                        Visit Dashboard <ArrowRight size={20} />
                    </Link>
                ) : (
                    <Link 
                        href="/auth" 
                        className="flex items-center justify-center gap-2 w-full bg-purple-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-purple-700 transition-all active:scale-95"
                    >
                        Login to Dashboard <ArrowRight size={20} />
                    </Link>
                )}
                <Link 
                    href="/" 
                    className="flex items-center justify-center gap-2 w-full bg-gray-50 text-gray-500 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all"
                >
                    <Home size={18} /> Back to Home
                </Link>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mb-6 bg-red-100 p-6 rounded-full">
              <span className="text-4xl">⚠️</span>
            </div>
            <h1 className="text-3xl font-black text-gray-800 mb-4 tracking-tight">Oops!</h1>
            <p className="text-gray-500 font-medium leading-relaxed mb-8">{message}</p>
            <div className="w-full grid gap-3">
                {isLoggedIn ? (
                    <button 
                        onClick={() => router.push("/join")}
                        className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-orange-700 transition-all active:scale-95"
                    >
                        Try Again
                    </button>
                ) : (
                    <Link 
                        href="/auth"
                        className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-orange-700 transition-all active:scale-95 flex items-center justify-center"
                    >
                        Login Now
                    </Link>
                )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
