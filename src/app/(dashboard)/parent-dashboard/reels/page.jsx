"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import ReelCard from "@/components/reels/reel-card";
import UploadModal from "@/components/reels/upload-modal";
import ProfilePanel from "@/components/reels/profile-panel";
import { useDispatch, useSelector } from "react-redux";
import { getReels } from "@/store/slices/reelSlice";

// ─── Data ─────────────────────────────────────────────────────────────────────

const REELS = [
  {
    id: 1,
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=700&fit=crop",
    author: {
      name: "Sarah M.",
      avatar: "https://i.pravatar.cc/80?img=47",
      username: "@sarahm",
    },
    caption:
      "Little Emma's first steps 🥹 She's growing so fast! #BabyMilestone #ToddlerLife",
    likes: 1284,
    comments: 94,
    shares: 47,
    privacy: "public",
    liked: false,
    saved: false,
  },
  {
    id: 2,
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400&h=700&fit=crop",
    author: {
      name: "James & Priya",
      avatar: "https://i.pravatar.cc/80?img=32",
      username: "@jamespriya",
    },
    caption:
      "Bath time chaos 😂 Pure gold every single time! #KidsAreHilarious #ParentLife",
    likes: 3412,
    comments: 211,
    shares: 130,
    privacy: "friends",
    liked: true,
    saved: false,
  },
  {
    id: 3,
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=700&fit=crop",
    author: {
      name: "Layla K.",
      avatar: "https://i.pravatar.cc/80?img=25",
      username: "@laylak",
    },
    caption:
      "Homemade slime day ✨ Best 3 hours we've spent this week #CraftsWithKids",
    likes: 892,
    comments: 57,
    shares: 23,
    privacy: "public",
    liked: false,
    saved: true,
  },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReelsPage() {
   const [activeIndex, setActiveIndex] = useState(0);
   const [showUpload, setShowUpload] = useState(false);
   const [uploadMode, setUploadMode] = useState("REEL"); // "REEL" | "PROFILE_PICTURE"
   const [showProfile, setShowProfile] = useState(false);
   const [loading, setLoading] = useState(false);
   const containerRef = useRef(null);
   const scrolling = useRef(false);
   const dispatch = useDispatch();
   const { user } = useSelector((state) => state.auth);
   const { reels } = useSelector((state) => state.reel);

  useEffect(() => {
    dispatch(getReels({ setLoading }));
  }, [dispatch]);

  const handleScroll = () => {
    if (!containerRef.current || scrolling.current) return;
    const { scrollTop, clientHeight } = containerRef.current;
    setActiveIndex(Math.round(scrollTop / clientHeight));
  };

  const navigateReel = (dir) => {
    if (!containerRef.current) return;
    const total = reels?.length ?? 0;
    const next = Math.max(0, Math.min(total - 1, activeIndex + dir));
    scrolling.current = true;
    containerRef.current.scrollTo({
      top: next * containerRef.current.clientHeight,
      behavior: "smooth",
    });
    setActiveIndex(next);
    setTimeout(() => {
      scrolling.current = false;
    }, 600);
  };

  return (
    <div className="relative h-dvh w-full bg-black overflow-hidden">
      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 z-50 flex items-center justify-between px-5 pt-4 pb-2 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
        {/* <span className="text-[22px] font-extrabold bg-gradient-to-r from-[#D18109] to-[#f5b84a] bg-clip-text text-transparent tracking-tight pointer-events-auto select-none">
          TinyGiggle
        </span> */}
        <div />
        <div className="flex gap-1 bg-black/35 p-1 rounded-full backdrop-blur-md border border-white/12 pointer-events-auto">
          <button className="px-3.5 py-1.5 rounded-full text-[13px] font-bold text-white/55 bg-transparent border-0 cursor-pointer hover:text-white transition-colors duration-200">
            Following
          </button>
          <button className="px-3.5 py-1.5 rounded-full text-[13px] font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 cursor-pointer">
            For You
          </button>
        </div>
        <button
          onClick={() => setShowProfile(true)}
          className="bg-transparent border-0 cursor-pointer p-0 pointer-events-auto"
        >
          <img
            src={user?.profilePicture || "https://i.pravatar.cc/80?img=47"}
            alt="my profile"
            className="w-9 h-9 rounded-full object-cover border-2 border-gradient-to-r from-pink-500 to-purple-500"
          />
        </button>
      </div>

      {/* Reel feed */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-scroll snap-y snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {!loading && reels?.length > 0 ? (
          reels?.map((reel, i) => (
            <ReelCard key={reel.id} reel={reel} isActive={i === activeIndex} />
          ))
        ) : loading ? (
          <div className="flex items-center justify-center h-full text-white">
            <Loader2 size={24} className="animate-spin" />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-white">No reels found</p>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 inset-x-0 z-50 flex items-center justify-between px-6 pb-6 pt-3 bg-gradient-to-t from-black/70 to-transparent">
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => navigateReel(-1)}
            disabled={activeIndex === 0}
            className="w-9 h-9 rounded-full bg-white/[0.08] border border-white/12 flex items-center justify-center cursor-pointer hover:bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:border-[#D18109] transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronUp size={18} />
          </button>
          <button
            onClick={() => navigateReel(1)}
            disabled={activeIndex === (reels?.length ?? 0) - 1}
            className="w-9 h-9 rounded-full bg-white/[0.08] border border-white/12 flex items-center justify-center cursor-pointer hover:bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:border-[#D18109] transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronDown size={18} />
          </button>
        </div>

        <button
          onClick={() => setShowUpload(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 flex items-center justify-center cursor-pointer hover:bg-[#b86f08] transition-colors duration-200 shadow-[0_4px_20px_rgba(209,129,9,0.5)]"
        >
          <Plus size={26} color="white" strokeWidth={2.5} />
        </button>

        <span className="text-[12px] font-bold text-white/50 tabular-nums">
          {activeIndex + 1} / {reels?.length || 0}
        </span>
      </div>

      {showUpload && (
        <UploadModal
          mode={uploadMode}
          onClose={() => {
            setShowUpload(false);
            setUploadMode("REEL");
          }}
        />
      )}
      {showProfile && (
        <ProfilePanel
          onClose={() => setShowProfile(false)}
          onUploadProfilePicture={() => {
            setUploadMode("PROFILE_PICTURE");
            setShowUpload(true);
          }}
        />
      )}
    </div>
  );
}
