import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { POST, GET, PATCH, DELETE } from '@/lib/api';
import { toast } from "react-toastify";

const initialState = {
    babysitter: {},
    babysitters: [],
    pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1
    }
};

export const createBabysitter = createAsyncThunk(
    "babysitter/createBabysitter",
    async ({ setLoading, adminId, formData }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await POST(`/admin/${adminId}/babysitters`, formData);
            toast.success(data.message);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data?.message || "Creating Babysitter Failed")
            return rejectWithValue(err.response?.data?.message || "Creating Babysitter Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const getAllBabysitters = createAsyncThunk(
    "babysitter/getAllBabysitters",
    async ({ setLoading, adminId, search, page = 1, limit = 10 }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await GET(`/admin/${adminId}/babysitters?search=${search || ""}&page=${page}&limit=${limit}`);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data?.message || "Fetching Babysitters Failed")
            return rejectWithValue(err.response?.data?.message || "Fetching Babysitters Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const updateBabysitter = createAsyncThunk(
    "babysitter/updateBabysitter",
    async ({ setLoading, adminId, babysitterId, formData }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await PATCH(`/admin/${adminId}/babysitters/${babysitterId}`, formData);
            toast.success(data.message)
            return data.data;
        } catch (err) {
            toast.error(err.response?.data?.message || "Updating Babysitter Failed")
            return rejectWithValue(err.response?.data?.message || "Updating Babysitter Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const deleteBabysitter = createAsyncThunk(
    "babysitter/deleteBabysitter",
    async ({ setLoading, adminId, babysitterId }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await DELETE(`/admin/${adminId}/babysitters/${babysitterId}`);
            toast.success(data.message)
            return data.data?._id || babysitterId;
        } catch (err) {
            toast.error(err.response?.data?.message || "Deleting Babysitter Failed")
            return rejectWithValue(err.response?.data?.message || "Deleting Babysitter Failed");
        } finally {
            setLoading(false);
        }
    }
);

const babysitterSlice = createSlice({
    name: "babysitter",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createBabysitter.fulfilled, (state, action) => {
                state.babysitters.unshift(action.payload);
            })
            .addCase(getAllBabysitters.fulfilled, (state, action) => {
                state.babysitters = action.payload.babysitters || [];
                if (action.payload.pagination) {
                    state.pagination = action.payload.pagination;
                }
            })
            .addCase(updateBabysitter.fulfilled, (state, action) => {
                const index = state.babysitters.findIndex((bs) => bs.id === action?.payload?.id)
                if (index !== -1) {
                    state.babysitters[index] = action.payload
                }
            })
            .addCase(deleteBabysitter.fulfilled, (state, action) => {
                state.babysitters = state.babysitters.filter((bs) => bs.id !== action.payload && bs._id !== action.payload);
            })
    },
});

export default babysitterSlice.reducer;
