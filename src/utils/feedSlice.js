import { createSlice } from "@reduxjs/toolkit";

const feedSlice = createSlice({
  name: "feed",
  initialState: null,
  reducers: {
    addFeed: (state, action) => {
      return action.payload;
    },
    // Added: append the next page of users, skipping any already in the feed (no duplicates)
    appendFeed: (state, action) => {
      const existingIds = new Set((state || []).map((user) => user._id));
      const newUsers = action.payload.filter((user) => !existingIds.has(user._id));
      return [...(state || []), ...newUsers];
    },
    removeUserFromFeed: (state, action) => {
      const newFeed = state.filter((user) => user._id !== action.payload);
      return newFeed;
    },
  },
});

export const { addFeed, appendFeed, removeUserFromFeed } = feedSlice.actions;
export default feedSlice.reducer;
