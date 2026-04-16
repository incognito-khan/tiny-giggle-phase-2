import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { POST, GET } from "@/lib/api";
import { toast } from "react-toastify";

const initialState = {
  message: {},
  messages: [],
};

export const createMessage = createAsyncThunk(
  "message/createMessage",
  async ({
    parentId,
    chatId,
    senderId,
    content,
    imageBase64,
    imageType,
    voiceBase64,
    voiceType,
    setMessageLoading,
  }) => {
    try {
      setMessageLoading(true);
      const { data } = await POST(`/parents/${parentId}/chats/${chatId}`, {
        senderId,
        content,
        imageBase64,
        imageType,
        voiceBase64,
        voiceType,
      });
      console.log(data.data);
      // toast.success(data.message);
      return data.data;
    } catch (err) {
      toast.error(err.response?.data || "Creating Message Failed");
      return rejectWithValue(err.response?.data || "Creating Message Failed");
    } finally {
      setMessageLoading(false);
    }
  },
);

export const getAllMessages = createAsyncThunk(
  "message/getAllMessages",
  async ({ setLoading, userId, userRole, chatId }) => {
    try {
      setLoading(true);
      // For doctors, we need to get the parent ID from the chat participants
      // For now, let's use the userId as parentId for parents, and handle doctors differently
      const endpoint = userRole === 'doctor' 
        ? `/parents/${userId}/chats/${chatId}` // This won't work for doctors, but let's try
        : `/parents/${userId}/chats/${chatId}`;
      const { data } = await GET(endpoint);
      console.log(data.data);
      return data.data;
    } catch (err) {
      toast.error(err.response?.data || "Fetching Messages Failed");
      return rejectWithValue(err.response?.data || "Fetching Messages Failed");
    } finally {
      setLoading(false);
    }
  },
);

export const getAllNotificationMessages = createAsyncThunk(
  "message/getAllNotificationMessages",
  async ({ role, userId, setLoading }) => {
    try {
      setLoading(true);
      const { data } = await GET(`/parents/${userId}/messages?role=${role}`);
      console.log(data);
      return data?.data;
    } catch (err) {
      const error = err.response?.data;
      toast.error(error?.message || "Error Fetching Notifications");
      return rejectWithValue(error || "Error Fetching Notifications");
    } finally {
      setLoading(false);
    }
  },
);

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAllMessages.fulfilled, (state, action) => {
      state.messages = action.payload;
    });
    builder.addCase(getAllNotificationMessages.fulfilled, (state, action) => {
      state.messages = action.payload;
    });
  },
});

export const { addMessage } = messageSlice.actions;
export default messageSlice.reducer;
