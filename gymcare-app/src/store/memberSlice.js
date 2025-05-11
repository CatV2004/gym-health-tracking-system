import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getHealthInfo, updateHealthInfo } from "../api/memberApi";

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
      });
  },
});

export default memberSlice.reducer;
