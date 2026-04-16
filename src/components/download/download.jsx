import { FaApple } from "react-icons/fa";
import { IoLogoGooglePlaystore } from "react-icons/io5";

export default function Download() {
  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center">
      {/* Page Heading */}
      <div className="text-center mb-12 max-w-2xl">
        <h1 className="text-5xl font-bold text-brand mb-4">Download Our App</h1>
        <p className="text-lg text-gray-500 leading-relaxed">
          Experience Tiny Giggle on your device! Get instant access to our
          engaging content, tips, and activities for children, anytime,
          anywhere.
        </p>
      </div>

      {/* Mobile App Card */}
      <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 flex flex-col items-center max-w-md w-full">
        <div className="mb-8 w-full">
          <div className="w-full border bg-gray-200 rounded-3xl shadow-2xl overflow-hidden">
            <img src="/Mobile.png" alt="Tiny Giggle Mobile App" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center text-brand mb-2">
          Click the button below to download the APK and start exploring today{" "}
          <span className="text-secondary">.</span>
        </h2>
        <p className="text-gray-400 text-sm mb-6">Get APK</p>

        <div className="flex flex-wrap gap-4 justify-center">
          <button className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors">
            <FaApple className="w-7 h-7" />
            <div className="text-left">
              <div className="text-xs">Download on the</div>
              <div className="font-semibold">App Store</div>
            </div>
          </button>

          <button className="bg-secondary text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors">
            <IoLogoGooglePlaystore className="w-7 h-7" />
            <div className="text-left">
              <div className="text-xs">GET IT ON</div>
              <div className="font-semibold">Google Play</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
