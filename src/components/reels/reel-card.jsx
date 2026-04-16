import { useEffect, useRef, useState, useCallback } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Play,
  Volume2,
  VolumeX,
  MoreHorizontal,
  X,
  Loader2,
} from "lucide-react";
import PrivacyBadge from "./privacy-badge";
import ActionBtn from "./action-button";
import { useDispatch, useSelector } from "react-redux";
import {
  likeReel,
  saveReel,
  shareReel,
  getComments,
  postComment,
} from "@/store/slices/reelSlice";

export default function ReelCard({ reel, isActive }) {
  const dispatch = useDispatch();
  const allComments = useSelector((state) => state.reel.comments);
  const comments = allComments[reel?.id] ?? null;

  const videoRef = useRef(null);
  const commentInputRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [liked, setLiked] = useState(reel?.liked || false);
  const [saved, setSaved] = useState(reel?.saved || false);
  const [likeCount, setLikeCount] = useState(reel?.likeCount || 0);
  const [shareCount, setShareCount] = useState(reel?.shareCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [heartPop, setHeartPop] = useState(false);
  const [videoRatio, setVideoRatio] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [likePending, setLikePending] = useState(false);
  const [savePending, setSavePending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [showVolumeBadge, setShowVolumeBadge] = useState(false);
  const [volumeBadgeType, setVolumeBadgeType] = useState(null);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.play().catch(() => {});
      setPlaying(true);
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setPlaying(false);
      setShowComments(false);
    }
  }, [isActive]);

  useEffect(() => {
    setVideoRatio(null);
  }, [reel?.id]);

  useEffect(() => {
    if (showComments && comments === null && reel?.id) {
      dispatch(getComments({ reelId: reel.id }));
    }
  }, [showComments, comments, reel?.id, dispatch]);

  const handleLike = async () => {
    if (likePending || !reel?.id) return;
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));
    if (!wasLiked) {
      setHeartPop(true);
      setTimeout(() => setHeartPop(false), 700);
    }
    setLikePending(true);
    try {
      const res = await dispatch(likeReel({ reelId: reel.id })).unwrap();
      setLiked(res.liked);
      setLikeCount(res.likeCount);
    } catch {
      setLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
    } finally {
      setLikePending(false);
    }
  };

  const handleSave = async () => {
    if (savePending || !reel?.id) return;
    const wasSaved = saved;
    setSaved(!wasSaved);
    setSavePending(true);
    try {
      const res = await dispatch(saveReel({ reelId: reel.id })).unwrap();
      setSaved(res.saved);
    } catch {
      setSaved(wasSaved);
    } finally {
      setSavePending(false);
    }
  };

  const handleShare = async () => {
    if (!reel?.id) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: reel.caption ?? "Check out this reel!",
          text: reel.caption ?? "",
          url: window.location.href,
        });
        const res = await dispatch(shareReel({ reelId: reel.id })).unwrap();
        setShareCount(res.shareCount);
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
      dispatch(shareReel({ reelId: reel.id }))
        .unwrap()
        .then((res) => setShareCount(res.shareCount))
        .catch(() => {});
    }
  };

  const handlePostComment = async () => {
    const text = commentText.trim();
    if (!text || postingComment || !reel?.id) return;
    setPostingComment(true);
    try {
      await dispatch(postComment({ reelId: reel.id, text })).unwrap();
      setCommentText("");
    } catch {
    } finally {
      setPostingComment(false);
    }
  };

  const handleVideoMetadata = (e) => {
    const { videoWidth, videoHeight } = e.target;
    if (videoWidth && videoHeight) {
      setVideoRatio(videoWidth / videoHeight);
    }
  };

  const handleTimeUpdate = (e) => {
    if (e.target.duration) {
      setProgress((e.target.currentTime / e.target.duration) * 100);
    }
  };

  const handleToggleMute = (e) => {
    e?.stopPropagation();
    setMuted((m) => {
      const next = !m;
      setVolumeBadgeType(next ? "mute" : "unmute");
      setShowVolumeBadge(true);
      setTimeout(() => setShowVolumeBadge(false), 800);
      return next;
    });
  };

  const handleVideoTap = (e) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      if (!liked) handleLike();
      setShowHeartAnim(true);
      setTimeout(() => setShowHeartAnim(false), 1000);
    } else {
      handleToggleMute(e);
    }
    setLastTap(now);
  };

  useEffect(() => {
    if (showComments) {
      const timer = setTimeout(() => {
        commentInputRef.current?.focus();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [showComments]);

  return (
    <div className="relative w-full h-dvh overflow-hidden bg-black snap-start snap-always">
      <div className="absolute inset-0 z-0 overflow-hidden select-none">
        {reel?.thumbnailUrl && (
          <img
            src={reel.thumbnailUrl}
            alt=""
            className="w-full h-full object-cover blur-[80px] opacity-40 scale-110"
          />
        )}
      </div>

      <div
        className="absolute inset-0 z-[1] flex items-center justify-center cursor-pointer"
        onClick={handleVideoTap}
      >
        <video
          ref={videoRef}
          src={reel?.videoUrl}
          poster={reel?.thumbnailUrl}
          loop
          muted={muted}
          playsInline
          onLoadedMetadata={handleVideoMetadata}
          onTimeUpdate={handleTimeUpdate}
          className={`w-full h-full ${
            videoRatio !== null && videoRatio < 1
              ? "object-contain"
              : "object-cover"
          }`}
        />
        {showHeartAnim && (
          <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
            <div className="animate-[heartPop_0.8s_ease-out_forwards]">
              <Heart
                size={100}
                fill="#ff2d55"
                color="#ff2d55"
                className="drop-shadow-2xl"
              />
            </div>
          </div>
        )}
        {showVolumeBadge && (
          <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
            <div className="bg-black/50 backdrop-blur-md p-5 rounded-full animate-[fade_0.8s_ease-out_forwards]">
              {volumeBadgeType === "mute" ? (
                <VolumeX size={32} color="white" />
              ) : (
                <Volume2 size={32} color="white" />
              )}
            </div>
          </div>
        )}
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/20 z-50">
          <div
            className="h-full bg-white transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-[2]" />
      <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/85 to-transparent pointer-events-none z-[2]" />

      <div className="absolute bottom-20 left-4 right-16 z-10 flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <img
            src={
              reel?.createdBy?.profilePicture ??
              "https://i.pravatar.cc/80?img=47"
            }
            alt={reel?.createdBy?.name}
            className="w-9 h-9 rounded-full object-cover border-2 border-[#D18109] shrink-0"
          />
          <p className="text-sm font-extrabold text-white leading-tight">
            {reel?.createdBy?.name}
          </p>
          <button className="ml-1 px-3 py-1 rounded-full border border-white/80 text-white text-xs font-bold bg-transparent hover:bg-white hover:text-black transition-colors duration-200">
            Follow
          </button>
        </div>
        <p className="text-[13px] text-white/90 font-semibold leading-relaxed">
          {reel?.caption}
        </p>
        <PrivacyBadge privacy={reel?.visibility} />
      </div>

      <div className="absolute right-3 bottom-20 z-10 flex flex-col items-center gap-5">
        <ActionBtn onClick={handleLike} count={likeCount} highlight={liked}>
          <Heart
            size={24}
            fill={liked ? "#ff4d6d" : "none"}
            color={liked ? "#ff4d6d" : "white"}
            className={liked ? "animate-[heartPulse_0.35s_ease]" : ""}
          />
        </ActionBtn>
        <ActionBtn
          onClick={() => setShowComments(true)}
          count={reel?.commentCount ?? 0}
        >
          <MessageCircle size={24} color="white" />
        </ActionBtn>
        <ActionBtn onClick={handleShare} count={shareCount}>
          <Share2 size={22} color="white" />
        </ActionBtn>
        <ActionBtn onClick={handleSave}>
          <Bookmark
            size={22}
            fill={saved ? "#f9c74f" : "none"}
            color={saved ? "#f9c74f" : "white"}
          />
        </ActionBtn>
        <ActionBtn onClick={handleToggleMute}>
          {muted ? (
            <VolumeX size={20} color="white" />
          ) : (
            <Volume2 size={20} color="white" />
          )}
        </ActionBtn>
        <ActionBtn>
          <MoreHorizontal size={20} color="white" />
        </ActionBtn>

        {/* Spinning disc */}
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/25 animate-spin-slow">
          <img
            src={
              reel?.createdBy?.avatar
                ? reel?.createdBy?.avatar
                : "https://i.pravatar.cc/80?img=47"
            }
            alt={reel?.createdBy?.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Comments drawer */}
      {showComments && (
        <div className="absolute inset-x-4 bottom-6 z-[100] bg-[#141414] rounded-2xl border border-white/10 flex flex-col max-h-[70%] shadow-2xl shadow-black animate-[slideUp_0.3s_ease] will-change-transform transform-gpu">
          <div className="w-10 h-1.5 bg-white/15 rounded-full mx-auto mt-3 mb-2" />
          <div className="flex justify-between items-center px-5 pb-3 border-b border-white/[0.08]">
            <span className="text-white font-extrabold">
              Comments ({reel?.commentCount ?? 0})
            </span>
            <button
              onClick={() => setShowComments(false)}
              className="bg-transparent border-0 cursor-pointer text-white/60 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Comment list */}
          <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-4 py-3">
            {comments === null ? (
              <div className="flex justify-center py-8">
                <Loader2 size={24} className="animate-spin text-white/40" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-center text-white/30 text-sm py-8">
                No comments yet. Be the first!
              </p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex gap-3 items-start">
                  <img
                    src={
                      c.authorAvatar
                        ? c.authorAvatar
                        : `https://i.pravatar.cc/40?u=${c.userId}`
                    }
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                    alt=""
                  />
                  <div>
                    <span className="text-xs font-extrabold text-white/80">
                      {c.authorName}
                    </span>
                    <p className="text-[13px] text-white/70 mt-0.5">{c.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Comment input */}
          <div className="flex gap-2 px-4 py-3 pb-6 border-t border-white/[0.06]">
            <input
              ref={commentInputRef}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handlePostComment();
                }
              }}
              className="flex-1 bg-white/[0.07] border border-white/12 rounded-full px-4 py-2 text-white text-[13px] placeholder:text-white/35 outline-none focus:border-white/30 transition-colors"
              placeholder="Add a comment..."
            />
            <button
              onClick={handlePostComment}
              disabled={!commentText.trim() || postingComment}
              className="px-4 py-2 bg-[#D18109] rounded-full text-white font-extrabold text-[13px] border-0 cursor-pointer hover:bg-[#b86f08] transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {postingComment ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                "Post"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
