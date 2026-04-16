import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { POST, GET, DELETE, PATCH } from '@/lib/api';
import { toast } from "react-toastify";

const initialState = {
    product: {},
    products: []
};

export const createProduct = createAsyncThunk(
    "product/createProduct",
    async ({ setLoading, categoryId, body, subCategoryId }) => {
        try {
            setLoading(true);
            const { data } = await POST(`/categories/${categoryId}/products/sub/${subCategoryId}`, body);
            toast.success("Product Created Successfully");
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Fetching Products Failed")
            return rejectWithValue(err.response?.data || "Fetching Products Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const getAllProducts = createAsyncThunk(
    "product/getAllProducts",
    async ({ setLoading, search }) => {
        try {
            setLoading(true);
            const { data } = await GET(`/products?search=${search || ""}`);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Fetching Products Failed")
            return rejectWithValue(err.response?.data || "Fetching Products Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const getAllParentProducts = createAsyncThunk(
    "product/getAllParentProducts",
    async ({ setLoading, search, parentId }) => {
        try {
            setLoading(true);
            const { data } = await GET(`/parents/${parentId}/products?search=${search || ""}`);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Fetching Products Failed")
            return rejectWithValue(err.response?.data || "Fetching Products Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const updateProduct = createAsyncThunk(
    "product/updateCategory",
    async ({ setLoading, categoryId, formData, productId }) => {
        try {
            setLoading(true);
            const { data } = await PATCH(`/categories/${categoryId}/products/${productId}`, formData);
            toast.success("Product Updated Successfully");
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Updating Product Failed")
            return rejectWithValue(err.response?.data || "Updating Product Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const delProduct = createAsyncThunk(
    "product/delProduct",
    async ({ setLoading, categoryId, productId }) => {
        try {
            setLoading(true);
            const { data } = await DELETE(`/categories/${categoryId}/products/${productId}`);
            toast.success("Product Deleted Successfully");
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Deleting Products Failed")
            return rejectWithValue(err.response?.data || "Deleting Products Failed");
        } finally {
            setLoading(false);
        }
    }
);

const productSlice = createSlice({
    name: "product",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createProduct.fulfilled, (state, action) => {
                state.products.unshift(action.payload);
            })
            .addCase(getAllProducts.fulfilled, (state, action) => {
                state.products = action.payload;
            })
            .addCase(getAllParentProducts.fulfilled, (state, action) => {
                state.products = action.payload;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                if (action.payload) {
                    const index = state.products.findIndex(product => product.id === action.payload.id);
                    if (index !== -1) {
                        state.products[index] = action.payload;
                    }
                }
            })
            .addCase(delProduct.fulfilled, (state, action) => {
                if (action.payload) {
                    state.products = state.products.filter(product => product.id !== action.payload);
                }
            })
    },
});

export default productSlice.reducer;