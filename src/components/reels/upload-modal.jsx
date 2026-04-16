"use client";

import { useState } from "react";
import {
  ArrowLeft,
  X,
  Upload,
  Check,
  Camera,
  Sparkles,
  Globe,
  Users,
  Lock,
  Loader2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  initUpload,
  uploadToS3,
  completeUpload,
} from "@/store/slices/reelSlice";
import { updateProfile } from "@/store/slices/authSlice";
import { POST } from "@/lib/api";
import { generateThumbnail } from "@/lib/helpers/ffmpeg";
import { toast } from "react-toastify";

const PRIVACY_OPTIONS = [
  {
    value: "PUBLIC",
    label: "Public",
    desc: "Anyone on or off TinyGiggle can see this",
    icon: Globe,
  },
  {
    value: "FAMILY_ONLY",
    label: "Family",
    desc: "Only people you add to your family can see this",
    icon: Users,
  },
  {
    value: "PRIVATE",
    label: "Private",
    desc: "Only you can see this",
    icon: Lock,
  },
];

function UploadModal({ onClose, mode = "REEL" }) {
  const user = useSelector((state) => state.auth.user);
  const [step, setStep] = useState(1);
  const [privacy, setPrivacy] = useState("PUBLIC");
  const [caption, setCaption] = useState("");
  const [isDraft, setIsDraft] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const isProfileMode = mode === "PROFILE_PICTURE";

  const handleFile = (f) => {
    if (f) {
      if (isProfileMode && !f.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (!isProfileMode && !f.type.startsWith("video/")) {
        toast.error("Please select a video file");
        return;
      }
      setFile(f);
      setStep(2);
    }
  };

  const handleUploadProfilePicture = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      const { data: uploadRes } = await POST("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (uploadRes?.success) {
        const imageUrl = uploadRes.data.url;
        const res = await dispatch(
          updateProfile({
            body: { profilePicture: imageUrl },
          }),
        ).unwrap();

        if (res) {
          onClose();
        }
      }
    } catch (err) {
      console.error("Profile upload failed", err);
      toast.error("Failed to update profile picture");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadReel = async () => {
    try {
      setLoading(true);

      // 1. Generate thumbnail in browser using FFmpeg
      console.log("Generating thumbnail...");
      const thumbnailBlob = await generateThumbnail(file);
      console.log("Thumbnail generated!", thumbnailBlob);

      // 2. Init video upload
      const initVideoResponse = await dispatch(
        initUpload({
          setLoading,
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
          id: user.id,
        }),
      );
      if (!initUpload.fulfilled.match(initVideoResponse)) return;
      const { uploadId, uploadUrl, key } = initVideoResponse.payload;
      console.log("Video upload initiated!", key);

      // 3. Init thumbnail upload
      const initThumbResponse = await dispatch(
        initUpload({
          setLoading,
          fileName: "thumbnail.jpg",
          mimeType: "image/jpeg",
          size: thumbnailBlob.size,
          id: user.id,
        }),
      );
      if (!initUpload.fulfilled.match(initThumbResponse)) return;
      const { uploadUrl: thumbUploadUrl, key: thumbKey } =
        initThumbResponse.payload;
      console.log("Thumbnail upload initiated!", thumbKey);

      // 4. Upload video directly to S3
      const uploadVideoResponse = await dispatch(
        uploadToS3({
          setLoading,
          uploadUrl,
          file,
        }),
      );
      if (!uploadToS3.fulfilled.match(uploadVideoResponse)) return;
      console.log("Video uploaded to S3!");

      // 5. Upload thumbnail directly to S3
      const uploadThumbResponse = await dispatch(
        uploadToS3({
          setLoading,
          uploadUrl: thumbUploadUrl,
          file: thumbnailBlob,
        }),
      );
      if (!uploadToS3.fulfilled.match(uploadThumbResponse)) return;
      console.log("Thumbnail uploaded to S3!");

      // 6. Tell server both are uploaded, save keys in DB
      const completeResponse = await dispatch(
        completeUpload({
          setLoading,
          uploadId,
          key,
          thumbnailKey: thumbKey,
          caption,
          id: user.id,
          visibility: privacy,
        }),
      );

      if (completeUpload.fulfilled.match(completeResponse)) {
        console.log("Reel uploaded successfully!");
        onClose();
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="bg-[#141414] rounded-t-3xl w-full max-w-lg border-t border-white/10 overflow-visible animate-[slideUp_0.35s_cubic-bezier(0.32,0.72,0,1)] max-h-[95dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <button
            onClick={step === 2 ? () => setStep(1) : onClose}
            className="bg-transparent border-0 cursor-pointer text-white/70 p-1"
          >
            {step === 2 ? <ArrowLeft size={20} /> : <X size={20} />}
          </button>
          <h2 className="text-lg font-extrabold text-white">
            {step === 1 ? (isProfileMode ? "Profile Picture" : "New Reel") : "Details"}
          </h2>
          <div className="w-8" />
        </div>

        {step === 1 ? (
          /* Drop zone */
          <div
            onClick={() => document.getElementById("reel-file-input").click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFile(e.dataTransfer.files[0]);
            }}
            className={`mx-5 my-6 rounded-2xl border-2 border-dashed flex flex-col items-center gap-3 py-14 px-6 cursor-pointer transition-colors duration-200
              ${
                dragOver
                  ? "border-[#D18109] bg-[#D18109]/5"
                  : "border-white/15 bg-white/[0.02] hover:border-[#D18109]/60"
              }`}
          >
            <input
              id="reel-file-input"
              type="file"
              accept={isProfileMode ? "image/*" : "video/*"}
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
            <div className="w-20 h-20 rounded-full bg-[#D18109]/12 border border-[#D18109]/25 flex items-center justify-center">
              <Camera size={38} color="#D18109" />
            </div>
            <p className="text-base font-extrabold text-white">
              {isProfileMode ? "Tap to select a photo" : "Tap to select a video"}
            </p>
            <p className="text-[13px] text-white/45">
              {isProfileMode ? "JPG, PNG or WebP" : "MP4, MOV up to 60 seconds"}
            </p>
            <div className="flex items-center gap-2 mt-1 px-5 py-2 bg-[#D18109] rounded-full text-white text-[13px] font-bold">
              <Upload size={14} /> Browse Files
            </div>
          </div>
        ) : (
          /* Details step */
          <div className="px-5 pb-8 pt-4 flex flex-col gap-5">
            {/* Preview */}
            <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-black flex items-center justify-center">
              {file && (
                isProfileMode ? (
                  <img
                    src={URL.createObjectURL(file)}
                    className="w-full h-full object-contain"
                    alt="profile preview"
                  />
                ) : (
                  <video
                    src={URL.createObjectURL(file)}
                    className="w-full h-full object-cover"
                    muted
                  />
                )
              )}
              <div className="absolute top-2.5 right-2.5 bg-black/60 text-[#f5b84a] text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Sparkles size={11} /> Preview
              </div>
            </div>

            {!isProfileMode && (
              <>
                {/* Caption */}
                <div className="flex flex-col gap-2 relative">
                  <label className="text-[11px] font-extrabold text-white/55 uppercase tracking-widest">
                    Caption
                  </label>
                  <textarea
                    rows={3}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value.slice(0, 150))}
                    placeholder="Share what's happening... ✨"
                    className="bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/25 outline-none resize-none focus:border-[#D18109] transition-colors duration-200"
                  />
                  <span className="absolute right-3 bottom-3 text-[11px] text-white/30 pointer-events-none">
                    {caption.length}/150
                  </span>
                </div>

                {/* Privacy selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-extrabold text-white/55 uppercase tracking-widest">
                    Who can see this?
                  </label>
                  <div className="flex flex-col gap-2">
                    {PRIVACY_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const selected = privacy === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setPrivacy(opt.value)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left cursor-pointer transition-all duration-200
                            ${
                              selected
                                ? "border-[#D18109] bg-[#D18109]/[0.08]"
                                : "border-white/10 bg-[#1e1e1e] hover:border-white/20"
                            }`}
                        >
                          <div className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0">
                            <Icon size={17} color="white" />
                          </div>
                          <div className="flex-1">
                            <span className="text-sm font-bold text-white block">
                              {opt.label}
                            </span>
                            <span className="text-xs text-white/45">
                              {opt.desc}
                            </span>
                          </div>
                          {selected && <Check size={15} color="#D18109" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Draft toggle */}
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => setIsDraft((v) => !v)}
                >
                  <div
                    className={`relative w-11 h-6 rounded-full border border-white/10 transition-colors duration-200 shrink-0
                      ${isDraft ? "bg-[#D18109]" : "bg-[#1e1e1e]"}`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200
                        ${isDraft ? "translate-x-5" : "translate-x-0.5"}`}
                    />
                  </div>
                  <span className="text-sm font-bold text-white/80 select-none">
                    Save as Draft
                  </span>
                </div>
              </>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={onClose}
                className="flex-1 py-3.5 rounded-xl border border-white/12 bg-transparent text-white/70 font-bold text-sm cursor-pointer hover:border-white/25 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                className="flex-[2] py-3.5 rounded-xl bg-[#D18109] text-white font-extrabold text-sm cursor-pointer flex items-center justify-center gap-2 hover:bg-[#b86f08] transition-colors duration-200"
                onClick={isProfileMode ? handleUploadProfilePicture : (!isDraft && handleUploadReel)}
              >
                {!loading ? (
                  <>
                    <Upload size={15} />
                    {isProfileMode ? "Save Profile Picture" : (isDraft ? "Save Draft" : "Post Reel")}
                  </>
                ) : (
                  <Loader2 size={20} className="animate-spin" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadModal;
