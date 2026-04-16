"use client";

function ActionBtn({ onClick, count, children, highlight = false }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 bg-transparent border-0 cursor-pointer group"
    >
      <div
        className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md border transition-transform duration-150 group-hover:scale-110
          ${highlight ? "bg-black/35 border-pink-500/40" : "bg-black/35 border-white/15"}`}
      >
        {children}
      </div>
      {count !== undefined && (
        <span className="text-[11px] font-bold text-white/90">
          {count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}
        </span>
      )}
    </button>
  );
}

export default ActionBtn;
