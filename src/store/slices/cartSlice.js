import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { POST, GET, PATCH, DELETE } from '@/lib/api';
import { toast } from "react-toastify";

const initialState = {
    cart: [],
};

export const addToCart = createAsyncThunk(
    "cart/addToCart",
    async ({ parentId, productId, quantity }) => {
        try {
            const { data } = await POST(`/parents/${parentId}/cart/${productId}`, { quantity });
            console.log(data);
            // toast.success('Added To Cart');
            console.log("after added cart")
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Adding Item To Cart Failed")
            return rejectWithValue(err.response?.data || "Adding Item To Cart Failed");
        }
    }
);

export const relativeAddToCart = createAsyncThunk(
    "cart/relativeAddToCart",
    async ({ relativeId, productId, quantity }) => {
        try {
            const { data } = await POST(`/relative/${relativeId}/cart/${productId}`, { quantity });
            console.log(data);
            toast.success('Added To Cart');
            console.log("after added cart")
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Adding Item To Cart Failed")
            return rejectWithValue(err.response?.data || "Adding Item To Cart Failed");
        }
    }
);

export const gettingCart = createAsyncThunk(
    "cart/gettingCart",
    async ({ parentId, setLoading }) => {
        try {
            setLoading(true);
            const { data } = await GET(`/parents/${parentId}/cart`);
            console.log(data.data);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Fetching Cart Failed")
            return rejectWithValue(err.response?.data || "Fetching Cart Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const gettingRelativeCart = createAsyncThunk(
    "cart/gettingRelativeCart",
    async ({ relativeId, setLoading }) => {
        try {
            setLoading(true);
            const { data } = await GET(`/relative/${relativeId}/cart`);
            console.log(data.data);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Fetching Cart Failed")
            return rejectWithValue(err.response?.data || "Fetching Cart Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const reduceQuantity = createAsyncThunk(
    "cart/reduceQuantity",
    async ({ parentId, productId, reduceBy }) => {
        try {
            const { data } = await PATCH(`/parents/${parentId}/cart/${productId}`, { reduceBy });
            console.log(data.data);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Reducing Quantity Failed")
            return rejectWithValue(err.response?.data || "Reducing Quantity Failed");
        }
    }
);

export const relativeReduceQuantity = createAsyncThunk(
    "cart/relativeReduceQuantity",
    async ({ relativeId, productId, reduceBy }) => {
        try {
            const { data } = await PATCH(`/relative/${relativeId}/cart/${productId}`, { reduceBy });
            console.log(data.data);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Reducing Quantity Failed")
            return rejectWithValue(err.response?.data || "Reducing Quantity Failed");
        }
    }
);

export const deleteCartProduct = createAsyncThunk(
    "cart/deleteCartProduct",
    async ({ parentId, productId, setLoading }) => {
        try {
            setLoading(true);
            const { data } = await DELETE(`/parents/${parentId}/cart/${productId}`);
            console.log(data.data);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Deletng Cart Failed")
            return rejectWithValue(err.response?.data || "Deletng Cart Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const deleteRelationCartProduct = createAsyncThunk(
    "cart/deleteRelationCartProduct",
    async ({ relativeId, productId, setLoading }) => {
        try {
            setLoading(true);
            const { data } = await DELETE(`/relative/${relativeId}/cart/${productId}`);
            console.log(data.data);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Deletng Cart Failed")
            return rejectWithValue(err.response?.data || "Deletng Cart Failed");
        } finally {
            setLoading(false);
        }
    }
);

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        setCart: (state, action) => {
            state.cart = action.payload || [];
        },
        resetCart: (state, action) => {
            state.cart = [];
        },
        updateLocalQuantity: (state, action) => {
            const { productId, change, price } = action.payload;
            const item = state.cart.find((i) => i?.product?.id === productId);
            if (item) {
                item.quantity += change;
                if (item.quantity < 1) {
                    state.cart = state.cart.filter((item) => item?.product?.id !== productId);
                }
                item.price = item.quantity * (item.product?.salePrice || item.price / item.quantity);
            } else {
                if (change > 0) {
                    state.cart.push({
                        product: {
                            id: productId,
                            salePrice: price
                        },
                        quantity: change,
                        price: change * (price || 0),
                    });
                }
            }
            
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(addToCart.fulfilled, (state, action) => {
                if (action.payload.type === 'add') {
                    state.cart.push(action.payload.cartItem);
                }
                if (action.payload.type === 'update') {
                    const index = state.cart.findIndex((item) => item.id === action.payload.cartItem.id);
                    if (index !== -1) {
                        state.cart[index] = action.payload.cartItem;
                    }
                }
            })
            .addCase(relativeAddToCart.fulfilled, (state, action) => {
                if (action.payload.type === 'add') {
                    state.cart.push(action.payload.cartItem);
                }
                if (action.payload.type === 'update') {
                    const index = state.cart.findIndex((item) => item.id === action.payload.cartItem.id);
                    if (index !== -1) {
                        state.cart[index] = action.payload.cartItem;
                    }
                }
            })
            .addCase(gettingCart.fulfilled, (state, action) => {
                state.cart = action.payload;
            })
            .addCase(gettingRelativeCart.fulfilled, (state, action) => {
                state.cart = action.payload;
            })
            .addCase(reduceQuantity.fulfilled, (state, action) => {
                const index = state.cart.findIndex((item) => item.id === action.payload.id);
                if (index !== -1) {
                    state.cart[index] = action.payload;
                }
            })
            .addCase(relativeReduceQuantity.fulfilled, (state, action) => {
                const index = state.cart.findIndex((item) => item.id === action.payload.id);
                if (index !== -1) {
                    state.cart[index] = action.payload;
                }
            })
            .addCase(deleteCartProduct.fulfilled, (state, action) => {
                state.cart = state.cart.filter((item) => item?.product?.id !== action.payload)
            })
            .addCase(deleteRelationCartProduct.fulfilled, (state, action) => {
                state.cart = state.cart.filter((item) => item?.product?.id !== action.payload)
            })

            .addCase(addToCart.rejected, (state, action) => {
                const { productId } = action.payload || {};
                const item = state.cart.find((i) => i?.product?.id === productId);
                if (item) {
                    item.quantity -= 1; // revert optimistic increment
                    if (item.quantity < 1) item.quantity = 1;
                    item.price = item.quantity * (item.product?.salePrice || item.price / item.quantity);
                }
            })

            .addCase(relativeAddToCart.rejected, (state, action) => {
                const { productId } = action.payload || {};
                const item = state.cart.find((i) => i?.product?.id === productId);
                if (item) {
                    item.quantity -= 1; // revert optimistic increment
                    if (item.quantity < 1) item.quantity = 1;
                    item.price = item.quantity * (item.product?.salePrice || item.price / item.quantity);
                }
            })

            .addCase(relativeReduceQuantity.rejected, (state, action) => {
                const { productId } = action.payload || {};
                const item = state.cart.find((i) => i?.product?.id === productId);
                if (item) {
                    item.quantity += 1; // revert optimistic decrement
                    item.price = item.quantity * (item.product?.salePrice || item.price / item.quantity);
                }
            });
    },
});

export const { setCart, resetCart } = cartSlice.actions;
export default cartSlice.reducer;