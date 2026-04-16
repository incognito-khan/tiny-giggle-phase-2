import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { POST, GET, DELETE, PATCH } from "@/lib/api";
import { toast } from "react-toastify";

const initialState = {
  query: {},
  queries: [],
};

export const createQuery = createAsyncThunk(
  "query/createQuery",
  async ({ setLoading, parentId, body }) => {
    try {
      setLoading(true);
      const { data } = await POST(`/parents/${parentId}/queries`, body);
      toast.success(data.message || "Query Created Successfully");
      return data.data;
    } catch (err) {
      toast.error(err.response?.data || "Creating Query Failed");
      return rejectWithValue(err.response?.data || "Creating Query Failed");
    } finally {
      setLoading(false);
    }
  },
);

export const getAllQueries = createAsyncThunk(
  "query/getAllQueries",
  async ({ setLoading, adminId, search }) => {
    try {
      setLoading(true);
      const { data } = await GET(
        `/admin/${adminId}/queries?search=${search || ""}`,
      );
      return data.data;
    } catch (err) {
      toast.error(err.response?.data || "Fetching Queries Failed");
      return rejectWithValue(err.response?.data || "Fetching Queries Failed");
    } finally {
      setLoading(false);
    }
  },
);

export const updateQuery = createAsyncThunk(
  "query/updateQuery",
  async ({ setLoading, adminId, queryId, body }) => {
    try {
      setLoading(true);
      const { data } = await PATCH(
        `/admin/${adminId}/queries/${queryId}`,
        body,
      );
      toast.success(data.message);
      return data.data;
    } catch (err) {
      toast.error(err.response?.data || "Updating Query Failed");
      return rejectWithValue(err.response?.data || "Updating Query Failed");
    } finally {
      setLoading(false);
    }
  },
);

export const deleteQuery = createAsyncThunk(
  "query/deleteQuery",
  async ({ setLoading, adminId, queryId }) => {
    try {
      setLoading(true);
      const { data } = await DELETE(`/admin/${adminId}/queries/${queryId}`);
      toast.success(data.message);
      return data.data;
    } catch (err) {
      toast.error(err.response?.data || "Deleting Query Failed");
      return rejectWithValue(err.response?.data || "Deleting Query Failed");
    } finally {
      setLoading(false);
    }
  },
);

const querySlice = createSlice({
  name: "query",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createQuery.fulfilled, (state, action) => {
        state.queries.unshift(action.payload);
      })
      .addCase(getAllQueries.fulfilled, (state, action) => {
        state.queries = action.payload;
      })
      .addCase(updateQuery.fulfilled, (state, action) => {
        const index = state.queries.findIndex(
          (query) => query.id === action?.payload?.id,
        );
        if (index !== -1) {
          state.queries[index] = action.payload;
        }
      })
      .addCase(deleteQuery.fulfilled, (state, action) => {
        state.queries = state.queries.filter(
          (query) => query.id !== action.payload,
        );
      });
  },
});

export default querySlice.reducer;
