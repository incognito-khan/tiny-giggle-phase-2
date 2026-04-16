import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { POST, GET } from '@/lib/api';
import { toast } from "react-toastify";

const initialState = {
    favoriteMusic: [],
    favoriteProducts: [],
};

export const toggleFavoriteMusic = createAsyncThunk(
    "favorite/toggleFavoriteMusic",
    async ({ parentId, musicId }) => {
        try {
            const { data } = await POST(`/parents/${parentId}/favorites/music`, { musicId });
            console.log(data.data);
            // toast.success(data.message);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Toggling Favorite Failed")
            return rejectWithValue(err.response?.data || "Toggling Favorite Failed");
        }
    }
);

export const getMusicFavorites = createAsyncThunk(
    "favorite/getMusicFavorites",
    async ({ setLoading, parentId }) => {
        try {
            setLoading(true);
            const { data } = await GET(`/parents/${parentId}/favorites/music`);
            console.log(data.data);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Fetching Favorites Failed")
            return rejectWithValue(err.response?.data || "Fetching Favorites Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const toggleFavoriteProduct = createAsyncThunk(
    "favorite/toggleFavoriteProduct",
    async ({ parentId, productId }) => {
        try {
            const { data } = await POST(`/parents/${parentId}/favorites/products`, { productId });
            console.log(data.data);
            // toast.success(data.message);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Toggling Favorite Failed")
            return rejectWithValue(err.response?.data || "Toggling Favorite Failed");
        }
    }
);

export const getProductFavorites = createAsyncThunk(
    "favorite/getProductFavorites",
    async ({ setLoading, parentId }) => {
        try {
            setLoading(true);
            const { data } = await GET(`/parents/${parentId}/favorites/products`);
            console.log(data.data);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Fetching Favorites Failed")
            return rejectWithValue(err.response?.data || "Fetching Favorites Failed");
        } finally {
            setLoading(false);
        }
    }
);

const favoriteSlice = createSlice({
    name: "favorite",
    initialState,
    reducers: {
        setMusicFavorites: (state, action) => {
            state.favoriteMusic = action.payload || [];
        },
        setResetAllFavorites: (state, action) => {
            state.favoriteMusic = []
            state.favoriteProducts = []
        },
        toggleLocalFavorite: (state, action) => {
            const { productId, product } = action.payload;

            if (!state.favoriteProducts) {
                state.favoriteProducts = [];
            }

            const exists = state.favoriteProducts.find((f) => f?.id === productId);

            if (exists) {
                state.favoriteProducts = state.favoriteProducts.filter((f) => f?.productId !== productId);
                toast.success("Removed From Wishlist");
            } else {
                state.favoriteProducts.push({
                    productId,
                });
                toast.success("Added To Wishlist");
            }
        },
        toggleLocalFavoriteMusic: (state, action) => {
            const { musicId, music } = action.payload;

            if (!state.favoriteMusic) {
                state.favoriteMusic = [];
            }

            const exists = state.favoriteMusic.find((f) => f?.musicId === musicId);

            if (exists) {
                state.favoriteMusic = state.favoriteMusic.filter((f) => f?.musicId !== musicId);
                toast.success("Removed From Wishlist");
            } else {
                state.favoriteMusic.push({
                    musicId,
                    ...music,
                });
                toast.success("Added To Wishlist");
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(toggleFavoriteMusic.fulfilled, (state, action) => {
                const favorite = action.payload;

                if (favorite) {
                    const exists = state.favoriteMusic.find((f) => f.id === favorite.id);
                    if (!exists) {
                        state.favoriteMusic.push(favorite);
                    }
                } else {
                    const { musicId } = action.meta.arg;
                    state.favoriteMusic = state.favoriteMusic.filter(
                        (f) => f.id !== musicId
                    );
                }
            })
            .addCase(toggleFavoriteProduct.fulfilled, (state, action) => {
                const favorite = action.payload;

                if (!state.favoriteProducts) {
                    state.favoriteProducts = [];
                }

                if (favorite) {
                    const exists = state.favoriteProducts?.find((f) => f.id === favorite.id);
                    if (!exists) {
                        state.favoriteProducts.push(favorite);
                    }
                } else {
                    const { productId } = action.meta.arg;
                    state.favoriteProducts = state.favoriteProducts.filter(
                        (f) => f.productId !== productId
                    );
                }
            })
            .addCase(toggleFavoriteProduct.rejected, (state, action) => {
                const { productId } = action.meta.org || {};
                const item = state.favoriteProducts.find((i) => i?.productId === productId);
                if (item) {
                    state.favoriteProducts = state.favoriteProducts.filter(
                        (f) => f.productId !== productId
                    );
                } else {
                    state.favoriteProducts.push(productId)
                }
            })
            .addCase(getMusicFavorites.fulfilled, (state, action) => {
                state.favoriteMusic = action.payload;
            })
            .addCase(getProductFavorites.fulfilled, (state, action) => {
                state.favoriteProducts = action.payload;
            })
    },
});

export const { setMusicFavorites, setResetAllFavorites } = favoriteSlice.actions;
export default favoriteSlice.reducer;