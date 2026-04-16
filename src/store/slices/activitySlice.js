import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { POST, GET, PATCH, DELETE } from '@/lib/api';
import { toast } from "react-toastify";

const initialState = {
    activity: {},
    activities: [],
};

export const createSchedule = createAsyncThunk(
    "activity/createSchedule",
    async ({ setLoading, parentId, childId, formData }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await POST(`/parents/${parentId}/childs/${childId}/activities/feed/schedule/create`, formData);
            console.log(data.data);
            toast.success(data.message);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Creating Schedule Failed")
            return rejectWithValue(err.response?.data || "Creating Schedule Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const changeSchedule = createAsyncThunk(
    "activity/changeSchedule",
    async ({ setLoading, parentId, childId, scheduleId }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await PATCH(`/parents/${parentId}/childs/${childId}/activities/feed/schedule/${scheduleId}`);
            console.log(data.data);
            toast.success(data.message);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Changing Schedule Failed")
            return rejectWithValue(err.response?.data || "Changing Schedule Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const getAllActivies = createAsyncThunk(
    "activity/getAllActivies",
    async ({ setLoading, parentId, childId }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await GET(`/parents/${parentId}/childs/${childId}/activities`);
            console.log(data.data);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Fetching All Activities Failed")
            return rejectWithValue(err.response?.data || "Fetching All Activities Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const markFeedTaken = createAsyncThunk(
    "activity/markFeedTaken",
    async ({ setLoading, parentId, childId, formData }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await POST(`/parents/${parentId}/childs/${childId}/activities/feed/taken`, formData);
            console.log(data.data);
            toast.success(data.message);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Marking Feed as Taken Failed")
            return rejectWithValue(err.response?.data || "Marking Feed as Taken Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const addTemperature = createAsyncThunk(
    "activity/addTemperature",
    async ({ setLoading, parentId, childId, formData }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await POST(`/parents/${parentId}/childs/${childId}/activities/temperature`, formData);
            console.log(data.data);
            toast.success(data.message);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Adding Temperature Failed")
            return rejectWithValue(err.response?.data || "Adding Temperature Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const markSleep = createAsyncThunk(
    "activity/markSleep",
    async ({ setLoading, parentId, childId, formData }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await POST(`/parents/${parentId}/childs/${childId}/activities/sleep/start`, formData);
            console.log(data.data);
            toast.success(data.message);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Marking Child as Sleep Failed")
            return rejectWithValue(err.response?.data || "Marking Child as Sleep Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const markAwake = createAsyncThunk(
    "activity/markAwake",
    async ({ setLoading, parentId, childId, formData }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await PATCH(`/parents/${parentId}/childs/${childId}/activities/sleep/end`, formData);
            console.log(data.data);
            toast.success(data.message);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Marking Child as Awake Failed")
            return rejectWithValue(err.response?.data || "Marking Child as Awake Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const getLatestActivities = createAsyncThunk(
    "activity/getLatestActivities",
    async ({ setLoading, parentId, childId }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await GET(`/parents/${parentId}/childs/${childId}/activities/latest`);
            console.log(data.data);
            return data.data;
        } catch (err) {
            toast.error(err.response?.data || "Getting Latest Activities Failed")
            return rejectWithValue(err.response?.data || "Getting Latest Activities Failed");
        } finally {
            setLoading(false);
        }
    }
);

const activitySlice = createSlice({
    name: "activity",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(createSchedule.fulfilled, (state, action) => {
            state.activities.schedule.unshift(action.payload);
        })
        builder.addCase(changeSchedule.fulfilled, (state, action) => {
            const scheduleIdToActivate = action.payload.id;

            if (state.activities?.schedule?.length) {
                state.activities.schedule = state.activities.schedule.map((s) => {
                    // Set previous active schedule to false
                    if (s.inUsed) {
                        return { ...s, inUsed: false };
                    }

                    // Set the selected schedule to true
                    if (s.id === scheduleIdToActivate) {
                        return { ...s, inUsed: true };
                    }

                    // Keep the rest unchanged
                    return s;
                });
            }
        });
        builder.addCase(getAllActivies.fulfilled, (state, action) => {
            state.activities = action.payload;
        })
        builder.addCase(getLatestActivities.fulfilled, (state, action) => {
            state.activities = action.payload;
        })
        builder.addCase(markFeedTaken.fulfilled, (state, action) => {
            console.log(action.payload, 'action.payload')
            // Find the active schedule
            const activeSchedule = state.activities.schedule.find(s => s.inUsed);

            if (!activeSchedule) return;

            const slotId = action.payload?.feedSlot?.[0]?.id; // assuming your payload contains feedSlotId
            const feedSlot = activeSchedule.feedSlots.find(slot => slot.id === slotId);

            if (feedSlot) {
                // Mark activity as taken
                feedSlot.activity = action.payload
            }

            state.activities.feed.push(action.payload);
        });
        builder.addCase(addTemperature.fulfilled, (state, action) => {
            state.activities.temperature.unshift(action.payload);
        });
        builder.addCase(markSleep.fulfilled, (state, action) => {
            state.activities.sleep.sleeps.unshift(action.payload);
        });
        builder.addCase(markAwake.fulfilled, (state, action) => {
            const updatedSleep = action.payload.updatedSleep;
            const updatedSummary = action.payload.sleepSummary;

            state.activities.sleep.sleeps = state.activities.sleep.sleeps.map(s =>
                s.id === updatedSleep.id ? updatedSleep : s
            );

            state.activities.sleep.summary = updatedSummary;
        });

    },
});

export default activitySlice.reducer;