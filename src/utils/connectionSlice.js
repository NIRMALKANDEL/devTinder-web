import { createSlice } from "@reduxjs/toolkit";

const connectionSlice = createSlice({
  name: "connections",
  // Changed: null = not loaded yet (lets pages show cached data instead of re-showing a skeleton)
  initialState: null,
  reducers: {
    addConnections: (state, action) => action.payload,
    removeConnections: () => null,
  },
});
export const { addConnections, removeConnections } = connectionSlice.actions;
export default connectionSlice.reducer;
