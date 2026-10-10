import { createSlice } from "@reduxjs/toolkit";

// Added: chat state shared by the navbar badge, the conversation list and the chat
// window. `unread` maps the other user's id to a count of unseen messages.
const chatSlice = createSlice({
  name: "chat",
  initialState: { unread: {}, activeUserId: null, lastMessage: null },
  reducers: {
    messageArrived: (state, action) => {
      const { message, myId } = action.payload;
      state.lastMessage = message;
      const otherId = message.senderId === myId ? null : message.senderId;
      if (otherId && otherId !== state.activeUserId) {
        state.unread[otherId] = (state.unread[otherId] || 0) + 1;
      }
    },
    openChat: (state, action) => {
      state.activeUserId = action.payload;
      if (action.payload) delete state.unread[action.payload];
    },
    resetChat: () => ({ unread: {}, activeUserId: null, lastMessage: null }),
  },
});

export const { messageArrived, openChat, resetChat } = chatSlice.actions;
export default chatSlice.reducer;
