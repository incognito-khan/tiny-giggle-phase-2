import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { POST, GET } from '@/lib/api';
import { toast } from "react-toastify";

const initialState = {
    children: [],
    child: {},
    childId: []
};

export const createChild = createAsyncThunk(
    "child/createChild",
    async ({ formData, parentId, setLoading }) => {
        try {
            setLoading(true);
            const { data } = await POST(`/parents/${parentId}/childs/create`, formData);
            toast.success(data?.message)
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data || "Creating Child Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const getSingleChild = createAsyncThunk(
    "child/getSingleChild",
    async ({ parentId, childId, setLoading }) => {
        try {
            setLoading(true);
            const { data } = await GET(`/parents/${parentId}/childs/${childId}`);
            return data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || "Something Went Wrong");
        } finally {
            setLoading(false);
        }
    }
);

const childSlice = createSlice({
    name: "child",
    initialState,
    reducers: {
        setChilds: (state, action) => {
            state.childId = action.payload || [];
        },
        clearChilds: (state) => {
            state.childId = [];
            state.child = []
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getSingleChild.fulfilled, (state, action) => {
                state.child = action.payload
            })
    },
});

export const { setChilds, clearChilds } = childSlice.actions;
export default childSlice.reducer;