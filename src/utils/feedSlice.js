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
      const newFeed = (state || []).filter((user) => user._id !== action.payload);
      return newFeed;
    },
    // Added: put a user back on top when sending a request fails (feed removes cards optimistically)
    restoreUserToFeed: (state, action) => {
      const rest = (state || []).filter((user) => user._id !== action.payload._id);
      return [action.payload, ...rest];
    },
    // Added: cleared on logout so the next account never sees the previous user's feed
    removeFeed: () => null,
  },
});

export const { addFeed, appendFeed, removeUserFromFeed, restoreUserToFeed, removeFeed } =
  feedSlice.actions;
export default feedSlice.reducer;
