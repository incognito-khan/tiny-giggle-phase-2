"use client";

import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { verifyOTP } from "@/store/slices/authSlice";
import { useDispatch } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import Loading from "@/components/loading";
import ReCAPTCHA from "react-google-recaptcha";

export default function SignUp() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const type = searchParams.get("type");
  const [activeTab, setActiveTab] = useState("signup");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const dispatch = useDispatch();
  const router = useRouter();

  const [formData, setFormData] = useState({
    otp: "",
    hp_otp: "",
  });

  const InputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    const honeypot = formData.hp_otp?.trim() || "";
    if (honeypot) {
      console.log("Spam bot detected!");
      return;
    }

    // if (!captchaToken) {
    //   toast.error("Please complete the CAPTCHA");
    //   return;
    // }

    if (!formData.otp || formData.otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    const body = {
      email: email,
      otp: formData.otp,
      type: type,
      role: "parent"
      // captcha: captchaToken,
    };
    dispatch(verifyOTP({ body, router, setLoading }));
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 py-20 bg-center bg-cover object-center"
      style={{
        backgroundImage: `url(https://html.vecurosoft.com/toddly/demo/assets/img/service/service-bg.png)`,
      }}
    >
      {loading && <Loading />}
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg">
        {/* Form Header */}
        <div className="text-center mb-5">
          <h2 className="text-3xl font-bold text-[#2C3E50]">
            Enter your Verification Code
          </h2>
        </div>

        {/* Form */}
        <form
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >

          <input
            type="text"
            name="hp_otp"
            value={formData.hp_otp || ""}
            onChange={InputChange}
            style={{ display: "none" }}
            autoComplete="off"
          />

          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-2">
              Verification Code
            </label>
            <input
              type="text"
              name="otp"
              value={formData.otp}
              onChange={InputChange}
              placeholder="Code..."
              className="text-gray-800 w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* <ReCAPTCHA
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
            onChange={(token) => setCaptchaToken(token)}
          /> */}

          {/* Sign Up Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#F39C12] to-secondary text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity"
            onClick={handleVerifyOTP}
          >
            Verify
          </button>
        </form>
      </div>
    </div>
  );
}
