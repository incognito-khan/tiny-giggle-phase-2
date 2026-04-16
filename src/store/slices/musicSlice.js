import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { POST, GET, DELETE, PATCH } from '@/lib/api';
import { toast } from "react-toastify";

const initialState = {
    music: {},
    musics: []
};


export const createMusic = createAsyncThunk(
    "music/createMusic",
    async ({ formData, setLoading, categoryId, subCategoryId }) => {
        try {
            setLoading(true);
            const { data } = await POST(`categories/${categoryId}/music/${subCategoryId}`, formData);
            if (data.success) {
                toast.success(data?.message)
            } else {
                toast.error(data.message)
            }
            return data?.data;
        } catch (err) {
            toast.error(err.response?.data || "Creating Music Failed")
            return rejectWithValue(err.response?.data || "Creating Music Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const getAllMusics = createAsyncThunk(
    "music/getAllMusics",
    async ({ setLoading, search }) => {
        try {
            setLoading(true);
            const { data } = await GET(`categories/music?search=${search || ""}`);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Fetching Musics Failed")
            return rejectWithValue(err.response?.data || "Fetching Musics Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const getAllArtistMusics = createAsyncThunk(
    "music/getAllArtistMusics",
    async ({ setLoading, search, adminId }) => {
        try {
            setLoading(true);
            const { data } = await GET(`admin/${adminId}/artists/music?search=${search || ""}`);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Fetching Musics Failed")
            return rejectWithValue(err.response?.data || "Fetching Musics Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const updateMusic = createAsyncThunk(
    "music/updateMusic",
    async ({ setLoading, musicId, body }) => {
        try {
            setLoading(true);
            const { data } = await PATCH(`categories/music/${musicId}`, body);
            if (data.success) {
                toast.success(data?.message)
            }
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Updating Music Failed")
            return rejectWithValue(err.response?.data || "Updating Music Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const delMusic = createAsyncThunk(
    "music/delMusic",
    async ({ setLoading, musicId }) => {
        try {
            setLoading(true);
            const { data } = await DELETE(`categories/music/${musicId}`);
            if (data.success) {
                toast.success(data?.message)
            }
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Deleting Music Failed")
            return rejectWithValue(err.response?.data || "Deleting Music Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const purchaseMusic = createAsyncThunk(
    "music/purchaseMusic",
    async ({ musicId, setLoading, parentId, body, router }) => {
        try {
            setLoading(true);
            const { data } = await POST(`parents/${parentId}/purchase/music/${musicId}`, body);
            console.log(data, 'data from purchase music')
            if (data?.success) {
                toast.success(data.message || "Order Placed Successfully");
                if (data.url) {
                    router.push(data.url);
                } else {
                    router.push(`/parent-dashboard/music/my-music`);
                }
            }
            return data?.data;
        } catch (err) {
            toast.error(err.response?.data || "Purchasing Music Failed")
            return rejectWithValue(err.response?.data || "Purchasing Music Failed");
        } finally {
            setLoading(false);
        }
    }
);


export const confirmStripePurchase = createAsyncThunk(
    "music/confirmStripePurchase",
    async ({ setLoading, parentId, body }) => {
        try {
            setLoading(true);
            const { data } = await POST(`/parents/${parentId}/purchase/music/confirm`, body);
            if (data?.success) {
                toast.success(data.message || "Music Purchased Successfully");
            } else {
                toast.error(data.error || "Payment not completed");
            }
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Confirming Purchase Failed")
            return rejectWithValue(err.response?.data || "Confirming Purchase Failed");
        } finally {
            setLoading(false);
        }
    }
);


export const getPurchaseMusic = createAsyncThunk(
    "music/getPurchaseMusic",
    async ({ setLoading, parentId }) => {
        try {
            setLoading(true);
            const { data } = await GET(`parents/${parentId}/purchase/music`);
            console.log(data, 'data from getPurchaseMusic')
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Fetching Purchased Music Failed")
            return rejectWithValue(err.response?.data || "Fetching Purchased Music Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const getMusicForDownload = createAsyncThunk(
    "music/getMusicForDownload",
    async ({ setLoading, parentId, musicId }, { rejectWithValue }) => {
        try {
            setLoading(true);

            let token = null;
            if (typeof window !== "undefined") {
                token = localStorage.getItem("token");
            }

            const res = await fetch(
                `/api/v1/parents/${parentId}/purchase/music/${musicId}`,
                {
                    method: "GET",
                    headers: {
                        "Authorization": token ? `Bearer ${token}` : "",
                        "Accept": "audio/mpeg",
                    },
                },
            );

            if (!res.ok) {
                throw new Error("Failed to download music");
            }

            const blob = await res.blob();

            let filename = "music.mp3";
            const disposition = res.headers.get("Content-Disposition");
            if (disposition && disposition.includes("filename=")) {
                filename = disposition
                    .split("filename=")[1]
                    .replace(/['"]/g, "")
                    .trim();
            }

            // Create a temporary link to download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            toast.success("Download started");
            return true;
        } catch (err) {
            toast.error("Downloading failed");
            return rejectWithValue(err.message);
        } finally {
            setLoading(false);
        }
    }
);


export const getMusicById = createAsyncThunk(
    "music/getMusicById",
    async ({ setLoading, musicId }) => {
        try {
            setLoading(true);
            const { data } = await GET(`categories/music/${musicId}`);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Fetching Music Failed")
            return rejectWithValue(err.response?.data || "Fetching Music Failed");
        } finally {
            setLoading(false);
        }
    }
);

const musicSlice = createSlice({
    name: "music",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createMusic.fulfilled, (state, action) => {
                state.musics.unshift(action.payload);
            })
            .addCase(getAllMusics.fulfilled, (state, action) => {
                state.musics = action.payload;
            })
            .addCase(getAllArtistMusics.fulfilled, (state, action) => {
                state.musics = action.payload;
            })
            .addCase(getPurchaseMusic.fulfilled, (state, action) => {
                state.musics = action.payload;
            })
            .addCase(updateMusic.fulfilled, (state, action) => {
                if (action.payload?.id) {
                    state.musics = state.musics.map(music => music.id === action.payload.id ? action.payload : music);
                }
            })
            .addCase(delMusic.fulfilled, (state, action) => {
                if (action.payload) {
                    state.musics = state.musics.filter(music => music.id !== action.payload);
                }
            })
            .addCase(getMusicById.fulfilled, (state, action) => {
                state.music = action.payload;
            })
            .addCase(getMusicForDownload.fulfilled, (state, action) => {
                state.music = action.payload;
            })
    },
});

export default musicSlice.reducer;