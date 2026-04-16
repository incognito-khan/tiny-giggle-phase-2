import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { POST, GET, PATCH, DELETE } from '@/lib/api';
import { toast } from "react-toastify";

const initialState = {
    artist: {},
    artists: [],
};

export const createArtist = createAsyncThunk(
    "artist/createArtist",
    async ({ setLoading, adminId, formData }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await POST(`/admin/${adminId}/artists`, formData);
            console.log(data.data);
            toast.success(data.message);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Creating Artist Failed")
            return rejectWithValue(err.response?.data || "Creating Artist Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const getAllArtists = createAsyncThunk(
    "artist/getAllArtists",
    async ({ setLoading, adminId, search }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await GET(`/admin/${adminId}/artists?search=${search || ""}`);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Fetching Artists Failed")
            return rejectWithValue(err.response?.data || "Fetching Artists Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const updateArtist = createAsyncThunk(
    "artist/updateArtist",
    async ({ setLoading, adminId, artistId, formData }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await PATCH(`/admin/${adminId}/artists/${artistId}`, formData);
            toast.success(data.message)
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Updating Artist Failed")
            return rejectWithValue(err.response?.data || "Updating Artist Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const deleteArtist = createAsyncThunk(
    "artist/deleteArtist",
    async ({ setLoading, adminId, artistId }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await DELETE(`/admin/${adminId}/artists/${artistId}`);
            toast.success(data.message)
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Deleting Artist Failed")
            return rejectWithValue(err.response?.data || "Deleting Artist Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const initializeArtistPayment = createAsyncThunk(
    "artist/initializePayment",
    async ({ setLoading }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await POST(`/auth/artist/payment/init`, {});
            console.log("Artist Payment Init Response:", data);
            if (data.success && data.data.url) {
                console.log("Redirecting to:", data.data.url);
                window.location.href = data.data.url;
            } else {
                toast.error(data.message || "Failed to get checkout URL");
            }
            return data.data;
        } catch (err) {
            console.error("Artist Payment Init Error:", err);
            const errorMsg = err.response?.data?.message || err.message || "Payment Initialization Failed";
            toast.error(errorMsg);
            return rejectWithValue(errorMsg);
        } finally {
            setLoading(false);
        }
    }
);

export const confirmArtistPayment = createAsyncThunk(
    "artist/confirmPayment",
    async ({ setLoading, sessionId }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await POST(`/auth/artist/payment/confirm`, { sessionId });
            if (data.success) {
                toast.success(data.message);
                const user = JSON.parse(localStorage.getItem("user") || "{}");
                localStorage.setItem("user", JSON.stringify({ ...user, isPaid: true, status: "ACTIVE" }));
            }
            return data.data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || "Payment Confirmation Failed";
            toast.error(errorMsg);
            return rejectWithValue(errorMsg);
        } finally {
            setLoading(false);
        }
    }
);

const artistSlice = createSlice({
    name: "artist",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createArtist.fulfilled, (state, action) => {
                state.artists.unshift(action.payload);
            })
            .addCase(getAllArtists.fulfilled, (state, action) => {
                state.artists = action.payload;
            })
            .addCase(updateArtist.fulfilled, (state, action) => {
                const index = state.artists.findIndex((artist) => artist.id === action?.payload?.id)
                if (index !== -1) {
                    state.artists[index] = action.payload
                }
            })
            .addCase(deleteArtist.fulfilled, (state, action) => {
                state.artists = state.artists.filter((artist) => artist.id !== action?.payload);
            })
    },
});

export default artistSlice.reducer;