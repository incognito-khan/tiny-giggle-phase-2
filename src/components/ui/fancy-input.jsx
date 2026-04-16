import React from "react";

export default function FancyInput({ label, ...props }) {
  return (
    <div className="relative w-full">
      <input
        {...props}
        placeholder=" "
        className="peer w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500"
      />
      <label
        className="absolute left-4 transition-all bg-white px-1 pointer-events-none
        top-3 text-sm text-gray-400
        peer-focus:-top-2 peer-focus:text-xs peer-focus:text-purple-600
        peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs"
      >
        {label}
      </label>
    </div>
  );
}
