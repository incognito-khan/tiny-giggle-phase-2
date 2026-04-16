"use client";

import { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { signupUser, login, googleLogin, loginRelaive, loginArtist, loginSupplier, loginDoctor, loginBabysitter } from "@/store/slices/authSlice";
import { useDispatch } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Loading from "@/components/loading";
import ReCAPTCHA from "react-google-recaptcha";
import { toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";

export default function SignUp() {
  const [activeTab, setActiveTab] = useState("signup");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [role, setRole] = useState("PARENT");
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (tab === "signup") {
      setActiveTab("signup");
    } else if (tab === "login") {
      setActiveTab("login");
    } else {
      setActiveTab("signup");
    }
  }, []);

  const handleTabChange = (value) => {
    setActiveTab(value);
    router.push(`?tab=${value}`, { scroll: false });
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    type: "",
    agreeTerms: false,
    hp_email: "",
  });
  const [loginformData, setLoginFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
    hp_email: "",
  });

  const InputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const honeypot = formData.hp_email?.trim() || "";

    if (honeypot) {
      console.log("Spam bot detected!");
      return;
    }

    // if (!captchaToken) {
    //   toast.error("Please verify the captcha first!");
    //   return;
    // };

    if (!formData.email) {
      toast.error("Email is required");
      return;
    }

    const atIndex = formData.email.indexOf("@");
    const dotIndex = formData.email.lastIndexOf(".");
    if (atIndex < 1 || dotIndex <= atIndex + 1 || dotIndex === formData.email.length - 1) {
      toast.error("Please enter a valid email address!");
      return;
    }

    if (!formData.password) {
      toast.error("Password is required");
      return;
    }

    if (!formData.name) {
      toast.error("Name is required");
      return;
    }

    if (!formData.agreeTerms) {
      toast.error("You must agree to the terms and conditions");
      return;
    }

    // const body = {
    //   ...formData,
    //   captcha: captchaToken,
    // }

    dispatch(
      signupUser({
        body: formData,
        router,
        setLoading,
      })
    );
  };

  const handleLogin = (e) => {
    e.preventDefault();

    const email = loginformData.email?.trim() || "";
    const honeypot = loginformData.hp_email?.trim() || "";

    if (honeypot) {
      console.log("Spam bot detected!");
      return;
    }

    console.log("Before validation:", loginformData);

    // if (!captchaToken) {
    //   toast.error("Please verify the captcha first!");
    //   return;
    // }

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

    if (!loginformData.password?.trim()) {
      toast.error("Password is required");
      return;
    }

    // const body = {
    //   ...loginformData,
    //   email,
    //   captcha: captchaToken,
    // };

    const body = {
      ...loginformData,
      email
    }

    if (role === 'PARENT') {
      dispatch(login({ body, router, setLoading }));
    }
    if (role === 'RELATIVE') {
      dispatch(loginRelaive({ body, router, setLoading }));
    }
    if (role === 'ARTIST') {
      dispatch(loginArtist({ body, router, setLoading }));
    }
    if (role === 'SUPPLIER') {
      dispatch(loginSupplier({ body, router, setLoading }));
    }
    if (role === 'DOCTOR') {
      dispatch(loginDoctor({ body, router, setLoading }));
    }
    if (role === 'BABYSITTER') {
      dispatch(loginBabysitter({ body, router, setLoading }));
    }
  };

  const handleSuccess = async (credentialResponse) => {
    const token = credentialResponse?.credential;
    if (!token) return;

    dispatch(googleLogin({ token, router, setLoading }));
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
        {/* Tabs */}
        <div className="flex justify-between items-center mb-8">
          <div className="border-b border-gray-300 w-full flex items-center justify-start">
            <button
              className={`px-4 py-2 text-base font-semibold hover:border-b-2 hover:border-secondary cursor-pointer ${activeTab === "signup"
                ? "text-secondary border-b-2 border-secondary"
                : "text-gray-600"
                }`}
              onClick={() => handleTabChange("signup")}
            >
              Sign Up
            </button>
            <button
              className={`px-4 py-2 text-base font-semibold cursor-pointer hover:border-b-2 hover:border-secondary ${activeTab === "login"
                ? "text-secondary border-b-2 border-secondary "
                : "text-gray-600"
                }`}
              onClick={() => handleTabChange("login")}
            >
              Login
            </button>
          </div>
          {tab === "login" && (
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-60 py-1 px-2 rounded-md border border-gray-300 focus:border-gray-300 focus:outline-none">
              <option value="PARENT">Parent</option>
              <option value="RELATIVE">Relative</option>
              <option value="ARTIST">Artist</option>
              <option value="SUPPLIER">Supplier</option>
              <option value="DOCTOR">Doctor</option>
              <option value="BABYSITTER">Babysitter</option>
            </select>
          )}
        </div>

        {/* Form Header */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-5"
          >
            <h2 className="text-3xl font-bold text-[#2C3E50]">
              {activeTab === "signup" ? "Create Account" : "Welcome Back"}
            </h2>
          </motion.div>
        </AnimatePresence>

        {/* Form */}
        <AnimatePresence mode="wait">
          {activeTab === "signup" ? (
            <motion.form
              key="signup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <input
                type="text"
                name="hp_email"
                value={formData.hp_email || ""}
                onChange={InputChange}
                style={{ display: "none" }}
                autoComplete="off"
              />

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  className="text-gray-800 w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter Email"
                  className="text-gray-800 w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  className="text-gray-800 w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  id="terms"
                  checked={formData.agreeTerms}
                  onChange={handleInputChange}
                  className="mt-1 w-4 h-4 text-secondary border-gray-300 rounded focus:ring-secondary"
                />
                <label htmlFor="terms" className="text-sm text-[#6B7280]">
                  I agree to the{" "}
                  <a href="#" className="text-secondary hover:underline">
                    Terms & Conditions
                  </a>
                </label>
              </div>

              {/* <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                onChange={(token) => setCaptchaToken(token)}
              /> */}

              {/* Sign Up Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#F39C12] to-secondary text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity"
                onClick={handleRegister}
              >
                Sign Up
              </button>

              {/* Divider */}
              {/* <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">or</span>
                </div>
              </div> */}

              {/* Social Login Buttons */}
              <div className="space-y-3">
                {/* Google Button */}
                {/* <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FcGoogle className="w-6 h-6 group-hover:text-white" />
                  <span className="text-[#EA4335] font-medium">
                    Continue with Google
                  </span>
                </button> */}

                {/* Facebook Button */}
                {/* <button
                  type="button"
                  className="w-full text-[#1877F2] flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FaFacebook className="w-6 h-6 group-hover:text-white" />
                  <span className="font-medium">Continue with Facebook</span>
                </button> */}
              </div>
            </motion.form>
          ) : (
            <motion.form
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
              onSubmit={handleLogin}
            >

              {/* <div className="flex justify-center gap-3 mb-5">
                <div className={`px-4 py-2 rounded-lg cursor-pointer ${role === 'parent' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => setRole('parent')}>
                  Parent
                </div>
                <div className={`px-4 py-2 rounded-lg cursor-pointer ${role === 'relative' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => setRole('relative')}>
                  Relative
                </div>
              </div> */}

              <input
                type="text"
                name="hp_email"
                value={loginformData.hp_email || ""}
                onChange={InputChange}
                style={{ display: "none" }}
                autoComplete="off"
              />

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={loginformData.email}
                  onChange={InputChange}
                  placeholder="Enter Email"
                  className="text-gray-800 w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={loginformData.password}
                  onChange={InputChange}
                  placeholder="Password"
                  className="text-gray-800 w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                onChange={(token) => setCaptchaToken(token)}
              /> */}

              {/* RememberMe Checkbox */}
              <div className="flex justify-between items-end gap-3">
                <div className="flex gap-2">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    id="rememberMe"
                    checked={loginformData.rememberMe}
                    onChange={InputChange}
                    className="mt-1 w-4 h-4 text-secondary border-gray-300 rounded focus:ring-secondary"
                  />
                  <label
                    htmlFor="rememberMe"
                    className="text-sm text-secondary"
                  >
                    Remember Me
                  </label>
                </div>
                <div className="text-secondary text-sm cursor-pointer">
                  <Link href={`/enter-mail`}>
                    <p>Forget Password?</p>
                  </Link>
                </div>
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#F39C12] to-secondary text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity"
              // onClick={handleLogin}
              >
                Login
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">or</span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-3">
                {/* Google Button */}
                {/* <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FcGoogle className="w-6 h-6 group-hover:text-white" />
                  <span className="text-[#EA4335] font-medium">
                    Continue with Google
                  </span>
                </button> */}

                <GoogleLogin
                  onSuccess={handleSuccess}
                  onError={() => {
                    console.error("Google Login Failed");
                  }}
                  useOneTap
                />

                {/* Facebook Button */}
                {/* <button
                  type="button"
                  className="w-full text-[#1877F2] flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FaFacebook className="w-6 h-6 group-hover:text-white" />
                  <span className="font-medium">Continue with Facebook</span>
                </button> */}
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
