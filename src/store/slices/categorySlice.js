import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { POST, GET, DELETE, PATCH } from '@/lib/api';
import { toast } from "react-toastify";

const initialState = {
    category: {},
    categories: []
};

export const createCategory = createAsyncThunk(
    "category/createCategory",
    async ({ setLoading, formData }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await POST(`/categories`, formData);
            console.log(data)
            toast.success(data.message || 'Category created successfully');
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Creating Category Failed")
            return rejectWithValue(err.response?.data || "Creating Category Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const createSubCategory = createAsyncThunk(
    "category/createSubCategory",
    async ({ setLoading, formData, categoryId }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await POST(`/categories/${categoryId}/sub`, formData);
            console.log(data)
            toast.success(data.message || 'Sub Category created successfully');
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Sub Creating Category Failed")
            return rejectWithValue(err.response?.data || "Sub Creating Category Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const getAllCategories = createAsyncThunk(
    "category/getAllCategories",
    async ({ setLoading }) => {
        try {
            setLoading(true);
            const { data } = await GET(`/categories`);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Fetching Categories Failed")
            return rejectWithValue(err.response?.data || "Fetching Categories Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const updateCategory = createAsyncThunk(
    "category/updateCategory",
    async ({ setLoading, categoryId, formData }) => {
        try {
            setLoading(true);
            const { data } = await PATCH(`/categories/${categoryId}`, formData);
            toast.success("Category Updated Successfully");
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Updating Category Failed")
            return rejectWithValue(err.response?.data || "Updating Category Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const updateSubCategory = createAsyncThunk(
    "category/updateSubCategory",
    async ({ setLoading, categoryId, formData, subCategoryId }) => {
        try {
            setLoading(true);
            const { data } = await PATCH(`/categories/${categoryId}/sub/${subCategoryId}`, formData);
            toast.success("Sub Category Updated Successfully");
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Updating Sub Category Failed")
            return rejectWithValue(err.response?.data || "Updating Sub Category Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const delCategory = createAsyncThunk(
    "category/delCategory",
    async ({ setLoading, categoryId }) => {
        try {
            setLoading(true);
            const { data } = await DELETE(`/categories/${categoryId}`);
            toast.success("Category Deleted Successfully");
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Deleting Category Failed")
            return rejectWithValue(err.response?.data || "Deleting Category Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const delSubCategory = createAsyncThunk(
    "category/delSubCategory",
    async ({ setLoading, categoryId, subCategoryId }) => {
        try {
            setLoading(true);
            const { data } = await DELETE(`/categories/${categoryId}/sub/${subCategoryId}`);
            toast.success("Sub Category Deleted Successfully");
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Deleting Sub Category Failed")
            return rejectWithValue(err.response?.data || "Deleting Sub Category Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const addMusicCategory = createAsyncThunk(
    "category/addMusicCategory",
    async ({ setLoading, formData }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await POST(`/categories/music`, formData);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Creating Music Category Failed")
            return rejectWithValue(err.response?.data || "Creating Music Category Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const addSubMusicCategory = createAsyncThunk(
    "category/addSubMusicCategory",
    async ({ setLoading, categoryId, formData }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await POST(`/categories/${categoryId}/music/sub`, formData);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Creating Music Sub Category Failed")
            return rejectWithValue(err.response?.data || "Creating Music Sub Category Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const getAllMusicCategories = createAsyncThunk(
    "category/getAllMusicCategories",
    async ({ setLoading }) => {
        try {
            setLoading(true);
            const { data } = await GET(`/categories/music/music-categories`);
            console.log(data.data, 'thunk music categories')
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Fetching Music Categories Failed")
            return rejectWithValue(err.response?.data || "Fetching Music Categories Failed");
        } finally {
            setLoading(false);
        }
    }
);

const categorySlice = createSlice({
    name: "category",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createCategory.fulfilled, (state, action) => {
                state.categories.unshift(action.payload);
            })
            .addCase(createSubCategory.fulfilled, (state, action) => {
                const category = state.categories.find((cat) => cat.id === action.payload.parentId)
                category.subCategories.unshift(action.payload)
            })
            .addCase(addMusicCategory.fulfilled, (state, action) => {
                state.categories.unshift(action.payload);
            })
            .addCase(addSubMusicCategory.fulfilled, (state, action) => {
                const category = state.categories.find((cat) => cat.id === action.payload.parentId)
                category.subCategories.unshift(action.payload)
            })
            .addCase(getAllCategories.fulfilled, (state, action) => {
                state.categories = action.payload;
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                if (action.payload) {
                    const index = state.categories.findIndex(category => category.id === action.payload.id);
                    if (index !== -1) {
                        state.categories[index] = action.payload;
                    }
                }
            })
            .addCase(updateSubCategory.fulfilled, (state, action) => {
                const category = state.categories.find((cat) => cat.id === action.payload.parentId)
                const subCategoryIndex = category.subCategories.findIndex((sub) => sub.id === action?.payload?.id)
                if (subCategoryIndex !== -1) {
                    category.subCategories[subCategoryIndex] = action.payload;
                }
            })
            .addCase(delCategory.fulfilled, (state, action) => {
                if (action.payload) {
                    state.categories = state.categories.filter(category => category.id !== action.payload);
                }
            })
            .addCase(delSubCategory.fulfilled, (state, action) => {
                const subCategoryId = action.payload;

                // Loop through each category
                state.categories = state.categories.map((category) => {
                    return {
                        ...category,
                        subCategories: category.subCategories?.filter(
                            (sub) => sub.id !== subCategoryId
                        ),
                    };
                });
            })
            .addCase(getAllMusicCategories.fulfilled, (state, action) => {
                state.categories = action.payload;
            })
},
});

export default categorySlice.reducer;