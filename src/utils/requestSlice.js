import { createSlice } from "@reduxjs/toolkit";

const requestSlice = createSlice({
  name: "requests",
  initialState: [],
  reducers: {
    addRequests: (state, action) => action.payload,
    removeRequests: () => [], // optional, for clearing
    removeRequestById: (state, action) =>
      state.filter((request) => request._id !== action.payload),
  },
});

export const { addRequests, removeRequests, removeRequestById } =
  requestSlice.actions;
export default requestSlice.reducer;
