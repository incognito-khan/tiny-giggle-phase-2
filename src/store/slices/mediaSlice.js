import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import axios from "axios";

const initialState = {
    imageUrl: "",
};

export const uploadImage = createAsyncThunk(
    "media/uploadImage",
    async ({ setLoading, parentId, file }) => {
        try {
            setLoading(true);
            const formData = new FormData()
            formData.append("file", file)
            const token = localStorage.getItem("token");
            const { data } = await axios.post(`/api/v1/parents/${parentId}/upload`, formData,
                {
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });
            console.log(data, 'data from upload image')
            return data.url;
        } catch (err) {
            toast.error(err.response?.data || "Image Upload Failed")
            return rejectWithValue(err.response?.data || "Image Upload Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const uploadAudio = createAsyncThunk(
    "media/uploadAudio",
    async ({ setLoading, parentId, file }) => {
        try {
            setLoading(true);
            const formData = new FormData()
            formData.append("audio", file)
            const token = localStorage.getItem("token");
            const { data } = await axios.post(`/api/v1/parents/${parentId}/upload-audio`, formData,
                {
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });
            console.log(data, 'data from upload audio')
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Audio Upload Failed")
            return rejectWithValue(err.response?.data || "Audio Upload Failed");
        } finally {
            setLoading(false);
        }
    }
);

const mediaSlice = createSlice({
    name: "media",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
    },
});

export default mediaSlice.reducer;