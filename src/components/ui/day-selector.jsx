import React from "react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function DaySelector({ selected, setSelected }) {
  return (
    <div className="flex flex-wrap gap-2">
      {DAYS.map((day) => (
        <button
          key={day}
          onClick={() =>
            setSelected((prev) =>
              prev.includes(day)
                ? prev.filter((d) => d !== day)
                : [...prev, day],
            )
          }
          className={`px-3 py-2 rounded-lg text-sm ${
            (selected || []).includes(day) ? "bg-purple-600 text-white" : "bg-gray-100"
          }`}
        >
          {day}
        </button>
      ))}
    </div>
  );
}
