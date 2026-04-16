import {
  createSlice,
  createEntityAdapter,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import axios from "axios";
import { PATCH } from "@/lib/api";
import { toast } from "react-toastify";
import { setChilds, clearChilds } from "./childSlice";
import { setMusicFavorites, setResetAllFavorites } from "./favoriteSlice";
import { setFolders, setResetFolder } from "./folderSlice";
import { setCart, resetCart } from "./cartSlice";

// -------------------- Adapter --------------------
const usersAdapter = createEntityAdapter();

// Initial state
const initialState = {
  user: null,
  users: [],
  error: null,
  isUserLoggedIn: false,
};
// -------------------- Thunks --------------------

// Signup thunk
export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async ({ body, router, setLoading }) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`/api/v1/auth/signup`, body);
      toast.success(data?.message);
      router.push(`/otp?email=${body?.email}&type=SIGNUP`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Signup failed");
    } finally {
      setLoading(false);
    }
  },
);

// verify OTP thunk
export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async ({ body, router, setLoading }) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`/api/v1/auth/verify-otp`, body);
      if (data.success) {
        toast.success(data.message);
        if (body.type === "SIGNUP") {
          router.push("/auth?tab=login");
        } else {
          if (router) {
            router.push(`/forget-password?email=${body.email}`);
          }
        }
      } else {
        toast.error(data.message || "OTP Verification Failed");
      }
      console.log(data);
      return data;
    } catch (err) {
      const error = err.response?.data;
      toast.error(error?.message || "OTP Verification Failed");
      return rejectWithValue(error || "OTP Verification Failed");
    } finally {
      setLoading(false);
    }
  },
);

// Login thunk
export const login = createAsyncThunk(
  "auth/login",
  async ({ body, router, setLoading }, { rejectWithValue, dispatch }) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`/api/v1/auth/login`, body);
      if (data.success) {
        toast.success(data.message);
        dispatch(setChilds(data?.data?.user?.childs));
        dispatch(setMusicFavorites(data?.data?.user?.favoriteMusic));
        dispatch(setFolders(data?.data?.user?.folders));
        dispatch(setCart(data?.data?.user?.carts));
        const role = data?.data?.user?.role;
        if (role === "doctor") {
          router.push("/doctor-dashboard");
        } else if (role === "babysitter") {
          router.push("/babysitter-dashboard");
        } else if (role === "parent" || role === "relative") {
          router.push("/parent-dashboard");
        } else if (role === "admin") {
          router.push("/admin-dashboard");
        } else {
          router.push("/");
        }
      } else {
        toast.error(data.message || "Login Failed");
      }
      console.log(data);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      localStorage.setItem("token", data.data.tokens.accessToken);
      return data.data;
    } catch (err) {
      const error = err.response?.data;
      toast.error(error?.message || "Login Failed");
      return rejectWithValue(error || "Login Failed");
    } finally {
      setLoading(false);
    }
  },
);

export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async ({ token, router, setLoading }, { rejectWithValue, dispatch }) => {
    try {
      setLoading(true);
      const response = await axios.post(`/api/v1/auth/google`, { token });
      const resData = response.data;

      if (response.status === 200 && resData?.data?.user) {
        toast.success(resData.message);
        dispatch(setChilds(resData?.data?.user?.childs));
        dispatch(setMusicFavorites(resData?.data?.user?.favoriteMusic));
        dispatch(setFolders(resData?.data?.user?.folders));
        dispatch(setCart(resData?.data?.user?.carts));
        const role = resData?.data?.user?.role;
        if (role === "doctor") {
          router.push("/doctor-dashboard");
        } else if (role === "babysitter") {
          router.push("/babysitter-dashboard");
        } else if (role === "parent" || role === "relative") {
          router.push("/parent-dashboard");
        } else if (role === "admin") {
          router.push("/admin-dashboard");
        } else {
          router.push("/");
        }
      } else {
        toast.error(resData.message || "Login Failed");
        return rejectWithValue(resData.message || "Login Failed");
      }

      localStorage.setItem("user", JSON.stringify(resData.data.user));
      localStorage.setItem("token", resData.data.tokens.accessToken);

      return resData?.data;
    } catch (err) {
      const error = err.response?.data;
      toast.error(error.error || "Google Login Failed");
      return rejectWithValue(error || "Google Login Failed");
    } finally {
      setLoading(false);
    }
  },
);

// Relative Login thunk
export const loginRelaive = createAsyncThunk(
  "auth/loginRelaive",
  async ({ body, router, setLoading }, { rejectWithValue, dispatch }) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`/api/v1/auth/relatives/login`, body);
      if (data.success) {
        toast.success(data.message);
        dispatch(setChilds(data?.data?.user?.childs));
        router.push("/");
      } else {
        toast.error(data.message || "Login Failed");
      }
      console.log(data);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      localStorage.setItem("token", data.data.tokens.accessToken);
      return data.data;
    } catch (err) {
      const error = err.response?.data;
      toast.error(error?.message || "Login Failed");
      return rejectWithValue(error || "Login Failed");
    } finally {
      setLoading(false);
    }
  },
);

export const loginArtist = createAsyncThunk(
  "auth/loginArtist",
  async ({ body, router, setLoading }, { rejectWithValue }) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`/api/v1/auth/artist/login`, body);
      if (data.success) {
        toast.success(data.message);
        router.push("/");
      } else {
        toast.error(data.message || "Login Failed");
      }
      console.log(data);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      localStorage.setItem("token", data.data.tokens.accessToken);
      return data.data;
    } catch (err) {
      const error = err.response?.data;
      toast.error(error?.message || "Login Failed");
      return rejectWithValue(error || "Login Failed");
    } finally {
      setLoading(false);
    }
  },
);

export const loginSupplier = createAsyncThunk(
  "auth/loginSupplier",
  async ({ body, router, setLoading }, { rejectWithValue }) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`/api/v1/auth/supplier/login`, body);
      if (data.success) {
        toast.success(data.message);
        router.push("/");
      } else {
        toast.error(data.message || "Login Failed");
      }
      console.log(data);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      localStorage.setItem("token", data.data.tokens.accessToken);
      return data.data;
    } catch (err) {
      const error = err.response?.data;
      toast.error(error?.message || "Login Failed");
      return rejectWithValue(error || "Login Failed");
    } finally {
      setLoading(false);
    }
  },
);

export const loginDoctor = createAsyncThunk(
    "auth/loginDoctor",
    async ({ body, router, setLoading }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await axios.post(`/api/v1/auth/doctor/login`, body);
            if (data.success) {
                toast.success(data.message)
                router.push('/doctor-dashboard');
            } else {
                toast.error(data.message || "Login Failed");
            }
            localStorage.setItem('user', JSON.stringify(data.data.user));
            localStorage.setItem('token', data.data.tokens.accessToken);
            return data.data;
        } catch (err) {
            const error = err.response?.data;
            toast.error(error?.message || "Login Failed");
            return rejectWithValue(error || "Login Failed");
        } finally {
            setLoading(false);
        }
    }
);
export const loginBabysitter = createAsyncThunk(
    "auth/loginBabysitter",
    async ({ body, router, setLoading }, { rejectWithValue }) => {
        try {
            setLoading(true);
            const { data } = await axios.post(`/api/v1/auth/babysitter/login`, body);
            if (data.success) {
                toast.success(data.message)
                router.push('/babysitter-dashboard');
            } else {
                toast.error(data.message || "Login Failed");
            }
            localStorage.setItem('user', JSON.stringify(data.data.user));
            localStorage.setItem('token', data.data.tokens.accessToken);
            return data.data;
        } catch (err) {
            const error = err.response?.data;
            toast.error(error?.message || "Login Failed");
            return rejectWithValue(error || "Login Failed");
        } finally {
            setLoading(false);
        }
    }
);

export const loginAdmin = createAsyncThunk(
  "auth/loginAdmin",
  async ({ body, router, setLoading }, { rejectWithValue }) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`/api/v1/auth/login`, body);
      if (data.success) {
        toast.success(data.message);
        router.push("/admin-dashboard");
      } else {
        toast.error(data.message || "Login Failed");
      }
      localStorage.setItem("user", JSON.stringify(data.data.user));
      localStorage.setItem("token", data.data.tokens.accessToken);
      return data.data;
    } catch (err) {
      const error = err.response?.data;
      toast.error(error?.message || "Login Failed");
      return rejectWithValue(error || "Login Failed");
    } finally {
      setLoading(false);
    }
  },
);

// Logout thunk
export const logout = createAsyncThunk(
  "auth/logout",
  async ({ router }, { dispatch }) => {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      dispatch(clearChilds());
      dispatch(setResetFolder());
      dispatch(resetCart());
      dispatch(setResetAllFavorites());
      router.push("/auth?tab=login");
      toast.success("Logout Successfully");
      return;
    } catch (err) {
      return console.error("Logout Failed!");
    }
  },
);

// Request Password Reset thunk
export const requestPasswordReset = createAsyncThunk(
  "auth/requestPasswordReset",
  async ({ body, router, setLoading }) => {
    try {
      setLoading(true);
      console.log(email, "email");
      const { data } = await axios.post(`/api/v1/auth/forgot-password`, body);
      if (data.success) {
        toast.success(data.message);
        if (router) {
          router.push(`/otp?email=${email}&type=PASSWORD_RESET`);
        }
      } else {
        toast.error(data.message || "Error Sending Mail");
      }
      console.log(data);
      return data;
    } catch (err) {
      const error = err.response?.data;
      toast.error(error?.message || "Error Sending Mail");
      return rejectWithValue(error || "Error Sending Mail");
    } finally {
      setLoading(false);
    }
  },
);

// Change Password thunk
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ body, router, setLoading }) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`/api/v1/auth/change-password`, body);
      if (data.success) {
        toast.success(data.message);
        if (router) {
          router.push(`/auth?tab=login`);
        }
      } else {
        toast.error(data.message || "Error Changing Password");
      }
      console.log(data);
      return data;
    } catch (err) {
      const error = err.response?.data;
      toast.error(error?.message || "Error Changing Password");
      return rejectWithValue(error || "Error Changing Password");
    } finally {
      setLoading(false);
    }
  },
);

// Update Profile thunk
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async ({ body, setLoading }, { rejectWithValue }) => {
    try {
      if (setLoading) setLoading(true);
      const { data } = await PATCH(`/auth/update-profile`, body);
      if (data.success) {
        toast.success(data.message);
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = { ...currentUser, ...data.data };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return data.data;
      } else {
        toast.error(data.message || "Update Failed");
        return rejectWithValue(data.message || "Update Failed");
      }
    } catch (err) {
      const error = err.response?.data;
      toast.error(error?.message || "Update Failed");
      return rejectWithValue(error || "Update Failed");
    } finally {
      if (setLoading) setLoading(false);
    }
  },
);

// -------------------- Slice --------------------
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.isUserLoggedIn = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload?.user || {};
        state.isUserLoggedIn = true;
      })
      .addCase(loginRelaive.fulfilled, (state, action) => {
        state.user = action.payload?.user || {};
        state.isUserLoggedIn = true;
      })
      .addCase(loginArtist.fulfilled, (state, action) => {
        state.user = action.payload?.user || {};
        state.isUserLoggedIn = true;
      })
      .addCase(loginSupplier.fulfilled, (state, action) => {
        state.user = action.payload?.user || {};
        state.isUserLoggedIn = true;
      })
      .addCase(loginDoctor.fulfilled, (state, action) => {
        state.user = action.payload?.user || {};
        state.isUserLoggedIn = true;
      })
      .addCase(loginBabysitter.fulfilled, (state, action) => {
        state.user = action.payload?.user || {};
        state.isUserLoggedIn = true;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.user = action.payload?.user || {};
        state.isUserLoggedIn = true;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.user = action.payload?.user || {};
        state.isUserLoggedIn = true;
      })
      .addCase(logout.fulfilled, (state, action) => {
        state.user = {};
        state.isUserLoggedIn = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
      })
      .addMatcher(
        (action) =>
          action.type === "supplier/confirmPayment/fulfilled" ||
          action.type === "artist/confirmPayment/fulfilled",
        (state, action) => {
          if (state.user) {
            state.user.isPaid = true;
            state.user.status = "ACTIVE";
          }
        },
      );
  },
});

// -------------------- Selectors --------------------
export const authSelectors = usersAdapter.getSelectors((state) => state.auth);

export const selectCurrentUser = (state) =>
  state.auth.currentUserId
    ? state.auth.entities[state.auth.currentUserId]
    : null;

export const { setCredentials } = authSlice.actions;
export default authSlice.reducer;
