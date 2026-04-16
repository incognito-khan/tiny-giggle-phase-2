import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { POST, GET } from '@/lib/api';
import { toast } from "react-toastify";

const initialState = {
    growth: {},
    growths: [],
};

export const createGrowth = createAsyncThunk(
    "growth/createGrowth",
    async ({ setLoading, parentId, childId, formData }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await POST(`/parents/${parentId}/childs/${childId}/growth-summary`, formData);
            console.log(data.data, 'create growth console');
            toast.success(data.message);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Creating Growth Failed")
            return rejectWithValue(err.response?.data || "Creating Growth Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const getAllGrowths = createAsyncThunk(
    "growth/getAllGrowths",
    async ({ setLoading, parentId, childId }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await GET(`/parents/${parentId}/childs/${childId}/growth-summary`);
            console.log(data.data);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Fetching Growths Failed")
            return rejectWithValue(err.response?.data || "Fetching Growths Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const getLatestGrowth = createAsyncThunk(
    "growth/getLatestGrowth",
    async ({ setLoading, parentId, childId }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await GET(`/parents/${parentId}/childs/${childId}/growth-summary/latest`);
            console.log(data.data);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Fetching Growths Failed")
            return rejectWithValue(err.response?.data || "Fetching Growths Failed");
        } finally {
            setLoading(false);
        }
    }
);

const growthSlice = createSlice({
    name: "growth",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createGrowth.fulfilled, (state, action) => {
                state.growths.unshift(action.payload);
                state.growth.weight = action.payload.weight;
                state.growth.height = action.payload.height;
            })
            .addCase(getAllGrowths.fulfilled, (state, action) => {
                state.growths = action.payload;
            })
            .addCase(getLatestGrowth.fulfilled, (state, action) => {
                state.growth = action.payload;
            })
    },
});

export default growthSlice.reducer;