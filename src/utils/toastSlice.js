import { createSlice, nanoid } from "@reduxjs/toolkit";

// Added: app-wide success / error feedback (rendered by Toast.jsx in Body)
const toastSlice = createSlice({
  name: "toasts",
  initialState: [],
  reducers: {
    showToast: {
      reducer: (state, action) => [...state.slice(-2), action.payload],
      prepare: (message, type = "success") => ({
        payload: { id: nanoid(), message, type },
      }),
    },
    dismissToast: (state, action) =>
      state.filter((toast) => toast.id !== action.payload),
  },
});

export const { showToast, dismissToast } = toastSlice.actions;
export default toastSlice.reducer;
