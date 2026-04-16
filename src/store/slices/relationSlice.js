import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { POST, GET, DELETE } from '@/lib/api';
import { toast } from "react-toastify";

const initialState = {
    relation: {},
    relations: [],
};

export const createRelation = createAsyncThunk(
    "relation/createRelation",
    async ({ setLoading, parentId, childId, formData }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await POST(`/parents/${parentId}/childs/${childId}/relations/create`, formData);
            console.log(data.data);
            toast.success(data.message);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Creating Relation Failed")
            return rejectWithValue(err.response?.data || "Creating Relation Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const getAllRelations = createAsyncThunk(
    "relation/getAllRelations",
    async ({ setLoading, parentId, childId }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await GET(`/parents/${parentId}/childs/${childId}/relations`);
            console.log(data.data);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Fetching Relations Failed")
            return rejectWithValue(err.response?.data || "Fetching Relations Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const deleteRelation = createAsyncThunk(
    "relation/deleteRelation",
    async ({ setLoading, parentId, childId, relativeId }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await DELETE(`/parents/${parentId}/childs/${childId}/relations/${relativeId}/delete`);
            console.log(data.data);
            toast.success(data?.message);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Deleting Relation Failed")
            return rejectWithValue(err.response?.data || "Deleting Relation Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const leaveRelation = createAsyncThunk(
    "relation/leaveRelation",
    async ({ router, relativeId }, { rejectWithValue }) => {
        try {
            const { data } = await DELETE(`/relatives/${relativeId}/leave`);
            console.log(data.data);
            if (data.success) {
                toast.success("Leaved Successfully!");
                router.push('/auth?tab=login')
            }
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Leaving Relation Failed")
            return rejectWithValue(err.response?.data || "Leaving Relation Failed");
        }
    }
);

const relationSlice = createSlice({
    name: "relation",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllRelations.fulfilled, (state, action) => {
                state.relations = action.payload;
            })
            .addCase(deleteRelation.fulfilled, (state, action) => {
                state.relations = state.relations.filter((r) => r.id !== action.payload);
            })
    },
});

export default relationSlice.reducer;