import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { POST, GET } from '@/lib/api';
import { toast } from "react-toastify";

const initialState = {
    chat: {},
    chats: [],
};

export const createChat = createAsyncThunk(
    "chat/createChat",
    async ({ setLoading, parentId, title, participants, router }) => {
        try {
            setLoading(true);
            const { data } = await POST(`/parents/${parentId}/chats`, { title, participants });
            console.log(data.data);
            if (data.success) {
                router.push('/chat');
                toast.success(data.message);
            }
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Creating Chat Failed")
            return rejectWithValue(err.response?.data || "Creating Chat Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const getAllChats = createAsyncThunk(
    "chat/getAllChats",
    async ({ setLoading, userId, userRole }) => {
        try {
            setLoading(true);
            const endpoint = userRole === 'doctor' 
                ? `/doctors/chats` 
                : userRole === 'babysitter'
                    ? `/babysitters/chats`
                    : `/parents/chats`;
            const { data } = await GET(endpoint);
            console.log(data.data);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Fetching Chats Failed")
            return rejectWithValue(err.response?.data || "Fetching Chats Failed");
        } finally {
            setLoading(false);
        }
    }
);

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllChats.fulfilled, (state, action) => {
                state.chats = action.payload;
            })
    },
});

export default chatSlice.reducer;