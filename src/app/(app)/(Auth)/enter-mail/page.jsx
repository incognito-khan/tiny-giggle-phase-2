"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { requestPasswordReset } from "@/store/slices/authSlice";
import Loading from "@/components/loading";
import ReCAPTCHA from "react-google-recaptcha";
import { toast } from "react-toastify";

export default function EnterMail() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [hp_mail, setHp_mail] = useState("");
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSendMail = (e) => {
    e.preventDefault();
    if (hp_mail) {
      console.log("Spam bot detected!");
      return;
    }
    // if (!captchaToken) {
    //   toast.error("Please complete the CAPTCHA");
    //   return;
    // };
    if (!email) {
      toast.error("Email is required");
      return;
    }
    const atIndex = email.indexOf("@");
    const dotIndex = email.lastIndexOf(".");
    if (atIndex < 1 || dotIndex <= atIndex + 1 || dotIndex === email.length - 1) {
      toast.error("Please enter a valid email address!");
      return;
    }
    const body = {
      email,
      role: "parent",
      // captcha: captchaToken,
    }
    dispatch(requestPasswordReset({ body, setLoading, router }));
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
          <h2 className="text-3xl font-bold text-[#2C3E50]">Enter Mail</h2>
        </div>

        {/* Form */}
        <form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >

          <input
            type="text"
            name="hp_email"
            value={hp_mail || ""}
            onChange={() => setHp_mail(e.target.value)}
            style={{ display: "none" }}
            autoComplete="off"
          />

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="text-gray-800 w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* <ReCAPTCHA
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
            onChange={(token) => setCaptchaToken(token)}
          /> */}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#F39C12] to-secondary text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity"
            onClick={handleSendMail}
          >
            Send Code
          </button>
        </form>
      </div>
    </div>
  );
}
