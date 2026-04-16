import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { POST, GET, PATCH, DELETE } from '@/lib/api';
import { toast } from "react-toastify";

const initialState = {
    doctor: {},
    doctors: [],
    pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1
    }
};

export const createDoctor = createAsyncThunk(
    "doctor/createDoctor",
    async ({ setLoading, adminId, formData }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await POST(`/admin/${adminId}/doctors`, formData);
            toast.success(data.message);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data?.message || "Creating Doctor Failed")
            return rejectWithValue(err.response?.data?.message || "Creating Doctor Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const getAllDoctors = createAsyncThunk(
    "doctor/getAllDoctors",
    async ({ setLoading, adminId, search, page = 1, limit = 10 }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await GET(`/admin/${adminId}/doctors?search=${search || ""}&page=${page}&limit=${limit}`);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data?.message || "Fetching Doctors Failed")
            return rejectWithValue(err.response?.data?.message || "Fetching Doctors Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const updateDoctor = createAsyncThunk(
    "doctor/updateDoctor",
    async ({ setLoading, adminId, doctorId, formData }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await PATCH(`/admin/${adminId}/doctors/${doctorId}`, formData);
            toast.success(data.message)
            return data.data;
        } catch (err) {
            toast.error(err.response?.data?.message || "Updating Doctor Failed")
            return rejectWithValue(err.response?.data?.message || "Updating Doctor Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const deleteDoctor = createAsyncThunk(
    "doctor/deleteDoctor",
    async ({ setLoading, adminId, doctorId }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await DELETE(`/admin/${adminId}/doctors/${doctorId}`);
            toast.success(data.message)
            return data.data?._id || doctorId;
        } catch (err) {
            toast.error(err.response?.data?.message || "Deleting Doctor Failed")
            return rejectWithValue(err.response?.data?.message || "Deleting Doctor Failed");
        } finally {
            setLoading(false);
        }
    }
);

const doctorSlice = createSlice({
    name: "doctor",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createDoctor.fulfilled, (state, action) => {
                state.doctors.unshift(action.payload);
            })
            .addCase(getAllDoctors.fulfilled, (state, action) => {
                state.doctors = action.payload.doctors || [];
                if (action.payload.pagination) {
                    state.pagination = action.payload.pagination;
                }
            })
            .addCase(updateDoctor.fulfilled, (state, action) => {
                const index = state.doctors.findIndex((doc) => doc.id === action?.payload?.id)
                if (index !== -1) {
                    state.doctors[index] = action.payload
                }
            })
            .addCase(deleteDoctor.fulfilled, (state, action) => {
                state.doctors = state.doctors.filter((doc) => doc.id !== action.payload && doc._id !== action.payload);
            })
    },
});

export default doctorSlice.reducer;
