import { createSlice } from "@reduxjs/toolkit";

const requestSlice = createSlice({
  name: "requests",
  // Changed: null = not loaded yet (lets pages show cached data instead of re-showing a skeleton)
  initialState: null,
  reducers: {
    addRequests: (state, action) => action.payload,
    // Changed: clears back to "not loaded" (used on logout)
    removeRequests: () => null,
    removeRequestById: (state, action) =>
      (state || []).filter((request) => request._id !== action.payload),
  },
});

export const { addRequests, removeRequests, removeRequestById } =
  requestSlice.actions;
export default requestSlice.reducer;
