import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getHealthInfo, updateHealthInfo } from "../api/memberApi";
import { getMemberSubscriptions, getMemberSubscriptionsExpired } from "../api/subscriptionApi";

export const fetchMemberHealth = createAsyncThunk(
  "member/fetchHealth",
  async (_, thunkAPI) => {
    const token = thunkAPI.getState().auth.accessToken;
    try {
      const response = await getHealthInfo(token);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Lấy thông tin sức khỏe thất bại"
      );
    }
  }
);

export const fetchMemberSubscriptions = createAsyncThunk(
  "member/fetchSubscriptions",
  async (_, thunkAPI) => {
    const token = thunkAPI.getState().auth.accessToken;
    try {
      const response = await getMemberSubscriptions(token);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Lấy gói tập thất bại"
      );
    }
  }
);

export const fetchExpiredSubscriptions = createAsyncThunk(
  "member/fetchExpiredSubscriptions",
  async (_, thunkAPI) => {
    const token = thunkAPI.getState().auth.accessToken;
    try {
      const response = await getMemberSubscriptionsExpired(token);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Lấy gói tập đã hết hạn thất bại"
      );
    }
  }
);

export const updateMemberHealth = createAsyncThunk(
  "member/updateHealth",
  async (healthData, thunkAPI) => {
    const state = thunkAPI.getState();
    const token = state.auth.accessToken;

    try {
      const response = await updateHealthInfo(healthData, token);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Cập nhật thất bại"
      );
    }
  }
);


const memberSlice = createSlice({
  name: "member",
  initialState: {
    subscriptions: [],
    expiredSubscriptions: [],
    health: null,
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMemberHealth.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(fetchMemberHealth.fulfilled, (state, action) => {
        state.loading = false;
        state.health = action.payload; 
      })
      .addCase(fetchMemberHealth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateMemberHealth.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateMemberHealth.fulfilled, (state, action) => {
        state.loading = false;
        state.health = action.payload.data;
        state.successMessage = action.payload.message;
      })
      .addCase(updateMemberHealth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMemberSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(fetchMemberSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptions = action.payload;
      })
      .addCase(fetchMemberSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchExpiredSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpiredSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.expiredSubscriptions = action.payload;
      })
      .addCase(fetchExpiredSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default memberSlice.reducer;
