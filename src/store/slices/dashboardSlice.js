import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { POST, GET, PATCH, DELETE } from '@/lib/api';
import { toast } from "react-toastify";

const initialState = {
    parent: [],
    admin: [],
    supplier: [],
    artist: [],
    unifiedUsers: [],
    usersLoading: false,
};

export const getAdminData = createAsyncThunk(
    "dashboard/getAdminData",
    async ({ setLoading, adminId }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await GET(`/admin/${adminId}/dashboard`);
            console.log(data.data);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Fetching Admin Dashboard Data Failed");
            return rejectWithValue(err.response?.data || "Fetching Admin Dashboard Data Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const getAdminUsersDirectory = createAsyncThunk(
    "dashboard/getAdminUsersDirectory",
    async (adminId, { rejectWithValue }) => {
        try {
            const { data } = await GET(`/admin/${adminId}/dashboard/users`);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Fetching Unified Users Directory Failed");
            return rejectWithValue(err.response?.data || "Fetching Unified Users Directory Failed");
        }
    }
);

export const getParentData = createAsyncThunk(
    "dashboard/getParentData",
    async ({ setLoading, parentId, childId }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await GET(`/parents/${parentId}/childs/${childId}/dashboard`);
            console.log(data.data);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Fetching Parent Dashboard Data Failed")
            return rejectWithValue(err.response?.data || "Fetching Parent Dashboard Data Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const getSupplierData = createAsyncThunk(
    "dashboard/getSupplierData",
    async ({ setLoading, adminId }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await GET(`/admin/${adminId}/suppliers/dashboard`);
            console.log(data.data);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Fetching Supplier Dashboard Data Failed")
            return rejectWithValue(err.response?.data || "Fetching Supplier Dashboard Data Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const getArtistData = createAsyncThunk(
    "dashboard/getArtistData",
    async ({ setLoading, adminId }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await GET(`/admin/${adminId}/artists/dashboard`);
            console.log(data.data);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Fetching Artist Dashboard Data Failed")
            return rejectWithValue(err.response?.data || "Fetching Artist Dashboard Data Failed");
        } finally {
            setLoading(false);
        }
    }
);

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAdminData.fulfilled, (state, action) => {
                state.admin = action.payload;
            })
            .addCase(getParentData.fulfilled, (state, action) => {
                state.parent = action.payload;
            })
            .addCase(getSupplierData.fulfilled, (state, action) => {
                state.supplier = action.payload;
            })
            .addCase(getArtistData.fulfilled, (state, action) => {
                state.artist = action.payload;
            })
            .addCase(getAdminUsersDirectory.pending, (state) => {
                state.usersLoading = true;
            })
            .addCase(getAdminUsersDirectory.fulfilled, (state, action) => {
                state.usersLoading = false;
                state.unifiedUsers = action.payload;
            })
            .addCase(getAdminUsersDirectory.rejected, (state) => {
                state.usersLoading = false;
            })
    },
});

export default dashboardSlice.reducer;