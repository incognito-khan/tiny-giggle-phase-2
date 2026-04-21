import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { POST, GET, DELETE } from '@/lib/api';
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
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                const user = JSON.parse(storedUser);
                if (!user.childs) user.childs = [];
                user.childs.push(data?.data?.id);
                localStorage.setItem("user", JSON.stringify(user));
            }
            console.log(data, "data.data")
            return data.data;
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
            console.log(data, "data.data");
            return data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || "Something Went Wrong");
        } finally {
            setLoading(false);
        }
    }
);

export const getChildren = createAsyncThunk(
    "child/getChildren",
    async ({ parentId, setLoading }, { rejectWithValue }) => {
        try {
            if (setLoading) setLoading(true);
            const { data } = await GET(`/parents/${parentId}/childs`);
            return data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || "Fetching Children Failed");
        } finally {
            if (setLoading) setLoading(false);
        }
    }
);

export const removeChild = createAsyncThunk(
    "child/removeChild",
    async ({ parentId, childId, setLoading }, { rejectWithValue }) => {
        try {
            if (setLoading) setLoading(true);
            const { data } = await DELETE(`/parents/${parentId}/childs/${childId}`);
            toast.success(data?.message || "Child removed successfully");
            return childId;
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to remove child");
            return rejectWithValue(err.response?.data || "Failed to remove child");
        } finally {
            if (setLoading) setLoading(false);
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
            state.child = [];
            state.children = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getChildren.fulfilled, (state, action) => {
                state.children = action.payload || [];
            })
            .addCase(createChild.fulfilled, (state, action) => {
                console.log(action.payload, "action.payload")
                state.child = action.payload;
                state.childId?.push(action.payload.id) || []
            })
            .addCase(getSingleChild.fulfilled, (state, action) => {
                state.child = action.payload
            })
            .addCase(removeChild.fulfilled, (state, action) => {
                const removedChildId = action.payload;
                // Remove from childId list
                state.childId = (state.childId || []).filter(
                    (id) => (typeof id === "object" ? id.id : id) !== removedChildId
                );
                // Clear child if it's the one removed
                if (state.child?.id === removedChildId) {
                    state.child = {};
                }
                // Sync to localStorage
                try {
                    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
                    if (storedUser?.childs) {
                        storedUser.childs = storedUser.childs.filter(
                            (c) => (typeof c === "object" ? c.id : c) !== removedChildId
                        );
                        localStorage.setItem("user", JSON.stringify(storedUser));
                    }
                } catch (_) { }
            })
    },
});

export const { setChilds, clearChilds } = childSlice.actions;
export default childSlice.reducer;