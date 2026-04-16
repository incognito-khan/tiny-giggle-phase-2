"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Settings,
  Camera,
  Edit3,
  Grid3X3,
  Lock,
  Users,
  Heart,
  X,
  Loader2,
  Trash2,
  Globe,
  Shield,
  User,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getMyReels, updateReel, deleteReel } from "@/store/slices/reelSlice";

function ProfilePanel({ onClose, onUploadProfilePicture }) {
  const [activeTab, setActiveTab] = useState("reels");
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState(
    "Mom of 2 🌸 Sharing our everyday magic ✨ Faisalabad, Pakistan",
  );
  const [editingReel, setEditingReel] = useState(null);

  const myReels = useSelector((state) => state.reel.myReels);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    dispatch(getMyReels({ setLoading }));
  }, [dispatch]);

  const totalLikes =
    myReels?.reduce((acc, r) => acc + (r.likeCount || 0), 0) || 0;

  const tabs = [
    { id: "reels", label: "Reels", icon: Grid3X3 },
    { id: "private", label: "Private", icon: Lock },
  ];

  const filtered =
    activeTab === "private"
      ? myReels?.filter((r) => r.visibility === "PRIVATE")
      : myReels?.filter((r) => r.visibility !== "PRIVATE");

  const formatCount = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return num;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] overflow-y-auto animate-[slideInRight_0.35s_cubic-bezier(0.32,0.72,0,1)]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a] flex items-center justify-between px-5 py-4 border-b border-white/10">
        <button
          onClick={onClose}
          className="bg-transparent border-0 cursor-pointer text-white/70 p-1.5"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="text-[17px] font-extrabold text-white">
          My Profile
        </span>
        <button className="bg-transparent border-0 cursor-pointer text-white/70 p-1.5">
          <Settings size={20} />
        </button>
      </div>

      {/* Cover band */}
      <div className="relative h-28 bg-gradient-to-br from-[#1a0a00] via-[#3d1f00] to-[#1a0a00] overflow-visible">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(209,129,9,0.25),transparent_70%)]" />
        <div className="absolute -bottom-11 left-5">
          <div className="relative">
            <img
              src={user?.profilePicture || "https://i.pravatar.cc/120?img=47"}
              alt="avatar"
              className="w-[88px] h-[88px] rounded-full object-cover border-[3px] border-[#D18109]"
            />
            <button
              onClick={onUploadProfilePicture}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#D18109] border-[3px] border-[#0a0a0a] flex items-center justify-center cursor-pointer hover:bg-[#b86f08] hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg z-10"
              title="Change Profile Picture"
            >
              <Camera size={14} color="white" />
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="px-5 pt-14 pb-4">
        <h2 className="text-xl font-extrabold text-white">
          {user?.name || "User"}
        </h2>
        <p className="text-[13px] text-white/45 mt-0.5">
          @{user?.email?.split("@")[0] || "username"}
        </p>

        {editingBio ? (
          <div className="flex flex-col gap-2 mt-3">
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="bg-[#1e1e1e] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none resize-none"
            />
            <button
              onClick={() => setEditingBio(false)}
              className="self-end px-4 py-1.5 bg-[#D18109] rounded-full text-white text-[13px] font-bold border-0 cursor-pointer hover:bg-[#b86f08] transition-colors duration-200"
            >
              Save
            </button>
          </div>
        ) : (
          <div className="flex items-start gap-2 mt-2.5">
            <p className="text-sm text-white/70 leading-relaxed flex-1">
              {bio}
            </p>
            <button
              onClick={() => setEditingBio(true)}
              className="bg-transparent border-0 cursor-pointer text-[#D18109] p-0.5 shrink-0"
            >
              <Edit3 size={14} />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center mt-4 bg-[#1e1e1e] rounded-2xl border border-white/10 divide-x divide-white/10">
          {[
            { num: myReels?.length || 0, label: "Reels" },
            { num: formatCount(totalLikes), label: "Hearts" },
            { num: "0", label: "Following" },
          ].map((s) => (
            <div
              key={s.label}
              className="flex-1 flex flex-col items-center py-3.5"
            >
              <span className="text-xl font-extrabold text-white">{s.num}</span>
              <span className="text-[10px] text-white/45 font-bold uppercase tracking-widest mt-0.5">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 px-5 mt-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[13px] font-bold cursor-pointer bg-transparent border-0 border-b-2 -mb-px transition-colors duration-200
                ${
                  activeTab === t.id
                    ? "text-[#D18109] border-[#D18109]"
                    : "text-white/45 border-transparent hover:text-white/70"
                }`}
            >
              <Icon size={15} />{" "}
              {t.label && <span className="ml-1.5">{t.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-0.5 p-0.5">
        {loading ? (
          <div className="col-span-3 flex flex-col items-center gap-3 py-14 text-white/30">
            <Loader2 size={32} />
            <p className="text-sm">Loading...</p>
          </div>
        ) : filtered?.length === 0 && !loading ? (
          <div className="col-span-3 flex flex-col items-center gap-3 py-14 text-white/30">
            <Lock size={32} />
            <p className="text-sm">No private reels yet</p>
          </div>
        ) : (
          filtered?.map((r) => (
            <div
              key={r.id}
              onClick={() => setEditingReel(r)}
              className="relative aspect-[9/16] overflow-hidden bg-[#111] cursor-pointer group"
            >
              {r.thumbnailUrl ? (
                <img
                  src={r.thumbnailUrl}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <video
                  src={r.videoUrl}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  autoPlay
                  muted
                  playsInline
                  loop={false}
                  onCanPlay={(e) => {
                    e.target.pause();
                    e.target.currentTime = 0;
                  }}
                />
              )}
              <div className="absolute bottom-1.5 left-1.5 z-10 flex items-center gap-1 text-[11px] font-bold text-white drop-shadow-md">
                <Heart size={11} fill="white" color="white" />
                <span>{formatCount(r.likeCount || 0)}</span>
              </div>
              {r.visibility !== "PUBLIC" && (
                <div className="absolute top-1.5 right-1.5 text-white/80">
                  {r.visibility === "PRIVATE" ? (
                    <Lock size={11} />
                  ) : (
                    <Users size={11} />
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Edit Reel Modal */}
      {editingReel && (
        <EditReelModal
          reel={editingReel}
          onClose={() => setEditingReel(null)}
          onUpdate={async (data) => {
            const result = await dispatch(
              updateReel({
                reelId: editingReel.id,
                ...data,
                setLoading: setUpdating,
              }),
            );
            if (result.meta.requestStatus === "fulfilled") {
              setEditingReel(null);
            }
          }}
          onDelete={() => {
            if (window.confirm("Are you sure you want to delete this reel?")) {
              dispatch(
                deleteReel({ reelId: editingReel.id, setLoading: setUpdating }),
              );
              setEditingReel(null);
            }
          }}
          loading={updating}
        />
      )}
    </div>
  );
}

function EditReelModal({ reel, onClose, onUpdate, onDelete, loading }) {
  const [caption, setCaption] = useState(reel.caption || "");
  const [visibility, setVisibility] = useState(reel.visibility || "PUBLIC");

  const visibilityOptions = [
    { id: "PUBLIC", label: "Public", icon: Globe, desc: "Anyone can see this" },
    {
      id: "FAMILY_ONLY",
      label: "Family",
      icon: Shield,
      desc: "Only relatives can see this",
    },
    {
      id: "PRIVATE",
      label: "Private",
      icon: User,
      desc: "Only you can see this",
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-[#1c1c1e] rounded-3xl overflow-hidden shadow-2xl animate-[slideUp_0.3s_ease]">
        <div className="px-6 pt-6 pb-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Edit Reel</h3>
            <button
              onClick={onDelete}
              className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Caption */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider ml-1">
                Caption
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption..."
                rows={3}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none focus:border-[#D18109] transition-colors resize-none"
              />
            </div>

            {/* Visibility */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider ml-1">
                Who can see this?
              </label>
              <div className="grid gap-2">
                {visibilityOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setVisibility(opt.id)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 ${
                        visibility === opt.id
                          ? "bg-[#D18109]/10 border-[#D18109] text-white"
                          : "bg-white/[0.02] border-white/5 text-white/50 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl ${visibility === opt.id ? "bg-[#D18109] text-white" : "bg-white/5"}`}
                      >
                        <Icon size={16} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold">{opt.label}</p>
                        <p className="text-[11px] opacity-60 leading-tight">
                          {opt.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white/[0.02] border-t border-white/5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl bg-white/5 text-white text-sm font-bold hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onUpdate({ caption, visibility })}
            disabled={loading}
            className="flex-1 py-3.5 rounded-2xl bg-[#D18109] text-white text-sm font-bold hover:bg-[#b86f08] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePanel;
