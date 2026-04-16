import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { POST, GET, DELETE, PATCH } from "@/lib/api";
import { toast } from "react-toastify";
import axios from "axios";

const initialState = {
  reel: {},
  reels: [],
  myReels: [],
  comments: {},   // { [reelId]: Comment[] }
};

export const initUpload = createAsyncThunk(
  "reel/initUpload",
  async ({ setLoading, fileName, mimeType, size, id }, { rejectWithValue }) => {
    try {
      setLoading(true);
      const { data } = await POST(`/reels/${id}/upload/init`, {
        fileName,
        mimeType,
        size,
      });
      return data.data;
    } catch (err) {
      toast.error(err.response?.data || "Failed to init upload");
      return rejectWithValue(err.response?.data || "Failed to init upload");
    } finally {
      setLoading(false);
    }
  },
);

export const uploadToS3 = createAsyncThunk(
  "reel/uploadToS3",
  async ({ setLoading, uploadUrl, file }, { rejectWithValue }) => {
    try {
      setLoading(true);
      await axios.put(uploadUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
      });
      return { success: true };
    } catch (err) {
      toast.error(err.response?.data || "Failed to upload");
      return rejectWithValue(err.response?.data || "Failed to upload");
    } finally {
      setLoading(false);
    }
  },
);

export const completeUpload = createAsyncThunk(
  "reel/completeUpload",
  async (
    { setLoading, uploadId, thumbnailKey, key, caption, id, visibility },
    { rejectWithValue },
  ) => {
    try {
      setLoading(true);
      const { data } = await POST(`/reels/${id}/upload/complete`, {
        uploadId,
        key,
        thumbnailKey,
        caption,
        visibility,
      });
      return data.data;
    } catch (err) {
      toast.error(err.response?.data || "Failed to complete upload");
      return rejectWithValue(err.response?.data || "Failed to complete upload");
    } finally {
      setLoading(false);
    }
  },
);

export const getMyReels = createAsyncThunk(
  "reel/getMyReels",
  async ({ setLoading }, { rejectWithValue }) => {
    try {
      setLoading(true);
      const { data } = await GET(`/reels/my-reels`);
      return data.data;
    } catch (err) {
      toast.error(err.response?.data || "Failed to get my reels");
      return rejectWithValue(err.response?.data || "Failed to get my reels");
    } finally {
      setLoading(false);
    }
  },
);

export const getReels = createAsyncThunk(
  "reel/getReels",
  async ({ setLoading }, { rejectWithValue }) => {
    try {
      setLoading(true);
      const { data } = await GET(`/reels/get`);
      return data.data;
    } catch (err) {
      toast.error(err.response?.data || "Failed to get reels");
      return rejectWithValue(err.response?.data || "Failed to get reels");
    } finally {
      setLoading(false);
    }
  },
);

// ─── New action thunks ────────────────────────────────────────────────────────

export const likeReel = createAsyncThunk(
  "reel/likeReel",
  async ({ reelId }, { rejectWithValue }) => {
    try {
      const { data } = await POST(`/reels/${reelId}/like`, {});
      return { reelId, ...data.data };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to like reel");
    }
  },
);

export const saveReel = createAsyncThunk(
  "reel/saveReel",
  async ({ reelId }, { rejectWithValue }) => {
    try {
      const { data } = await POST(`/reels/${reelId}/save`, {});
      return { reelId, ...data.data };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to save reel");
    }
  },
);

export const shareReel = createAsyncThunk(
  "reel/shareReel",
  async ({ reelId }, { rejectWithValue }) => {
    try {
      const { data } = await POST(`/reels/${reelId}/share`, {});
      return { reelId, ...data.data };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to share reel");
    }
  },
);

export const getComments = createAsyncThunk(
  "reel/getComments",
  async ({ reelId }, { rejectWithValue }) => {
    try {
      const { data } = await GET(`/reels/${reelId}/comments`);
      return { reelId, comments: data.data };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch comments");
    }
  },
);

export const postComment = createAsyncThunk(
  "reel/postComment",
  async ({ reelId, text }, { rejectWithValue }) => {
    try {
      const { data } = await POST(`/reels/${reelId}/comments`, { text });
      return { reelId, comment: data.data };
    } catch (err) {
      toast.error(err.response?.data || "Failed to post comment");
      return rejectWithValue(err.response?.data || "Failed to post comment");
    }
  },
);

export const updateReel = createAsyncThunk(
  "reel/updateReel",
  async ({ reelId, caption, visibility, setLoading }, { rejectWithValue }) => {
    try {
      if (setLoading) setLoading(true);
      const { data } = await PATCH(`/reels/${reelId}`, { caption, visibility });
      toast.success("Reel updated successfully");
      return data.data;
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update reel");
      return rejectWithValue(err.response?.data?.error || "Failed to update reel");
    } finally {
      if (setLoading) setLoading(false);
    }
  },
);

export const deleteReel = createAsyncThunk(
  "reel/deleteReel",
  async ({ reelId, setLoading }, { rejectWithValue }) => {
    try {
      if (setLoading) setLoading(true);
      await DELETE(`/reels/${reelId}`);
      toast.success("Reel deleted successfully");
      return reelId;
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete reel");
      return rejectWithValue(err.response?.data?.error || "Failed to delete reel");
    } finally {
      if (setLoading) setLoading(false);
    }
  },
);

const reelSlice = createSlice({
  name: "reel",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(completeUpload.fulfilled, (state, action) => {
        state.reels.unshift(action.payload);
        state.myReels.unshift(action.payload);
      })
      .addCase(initUpload.fulfilled, (state, action) => {
        state.reel = action.payload;
      })
      .addCase(uploadToS3.fulfilled, (state, action) => {
        state.reel = action.payload;
      })
      .addCase(getMyReels.fulfilled, (state, action) => {
        state.myReels = action.payload;
      })
      .addCase(getReels.fulfilled, (state, action) => {
        state.reels = action.payload;
      })
      // Update
      .addCase(updateReel.fulfilled, (state, action) => {
        const updated = action.payload;
        // Update in myReels
        const idxMy = state.myReels.findIndex((r) => r.id === updated.id);
        if (idxMy !== -1) state.myReels[idxMy] = { ...state.myReels[idxMy], ...updated };
        // Update in reels
        const idxReels = state.reels.findIndex((r) => r.id === updated.id);
        if (idxReels !== -1) state.reels[idxReels] = { ...state.reels[idxReels], ...updated };
      })
      // Delete
      .addCase(deleteReel.fulfilled, (state, action) => {
        const reelId = action.payload;
        state.myReels = state.myReels.filter((r) => r.id !== reelId);
        state.reels = state.reels.filter((r) => r.id !== reelId);
      })
      // Like
      .addCase(likeReel.fulfilled, (state, action) => {
        const { reelId, liked, likeCount } = action.payload;
        const reel = state.reels.find((r) => r.id === reelId);
        if (reel) {
          reel.liked = liked;
          reel.likeCount = likeCount;
        }
      })
      // Save
      .addCase(saveReel.fulfilled, (state, action) => {
        const { reelId, saved } = action.payload;
        const reel = state.reels.find((r) => r.id === reelId);
        if (reel) {
          reel.saved = saved;
        }
      })
      // Share
      .addCase(shareReel.fulfilled, (state, action) => {
        const { reelId, shareCount } = action.payload;
        const reel = state.reels.find((r) => r.id === reelId);
        if (reel) {
          reel.shareCount = shareCount;
        }
      })
      // Comments
      .addCase(getComments.fulfilled, (state, action) => {
        const { reelId, comments } = action.payload;
        state.comments[reelId] = comments;
      })
      .addCase(postComment.fulfilled, (state, action) => {
        const { reelId, comment } = action.payload;
        if (!state.comments[reelId]) state.comments[reelId] = [];
        state.comments[reelId].unshift(comment);
        const reel = state.reels.find((r) => r.id === reelId);
        if (reel) reel.commentCount = (reel.commentCount ?? 0) + 1;
      });
  },
});

export default reelSlice.reducer;
