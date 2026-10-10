import axios from "axios";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "motion/react";
import { BASE_URL } from "../utils/constants";
import { getErrorMessage } from "../utils/api";
import { getSocket } from "../utils/socket";
import { openChat } from "../utils/chatSlice";
import Avatar from "./Avatar";
import { AlertIcon, BackIcon, SendIcon } from "./Icons";

const timeOf = (date) =>
  new Date(date).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const dayOf = (date) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(Date.now() - 864e5);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
};

// Added: one conversation. History comes from GET /chat/:userId, new messages over
// Socket.IO. Sending is optimistic: the bubble shows at once and is marked if it fails.
const ChatWindow = ({ otherUser, onBack }) => {
  const dispatch = useDispatch();
  const me = useSelector((store) => store.user);
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const scroller = useRef(null);
  const stickToBottom = useRef(true);
  const lastTypingSent = useRef(0);
  const otherId = otherUser._id;

  // Mark this chat as open (clears its unread badge) while it is on screen
  useEffect(() => {
    dispatch(openChat(otherId));
    return () => dispatch(openChat(null));
  }, [otherId, dispatch]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setMessages([]);
    axios
      .get(`${BASE_URL}/chat/${otherId}`, { withCredentials: true })
      .then((res) => {
        if (cancelled) return;
        setMessages(res.data.data.messages);
        setChatId(res.data.data.chatId);
        setHasMore(res.data.data.hasMore);
        stickToBottom.current = true;
      })
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Couldn't load this chat.")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [otherId]);

  // Live messages and typing indicator for this conversation
  useEffect(() => {
    const socket = getSocket();
    let typingTimer;
    const onMessage = (msg) => {
      if (!chatId || String(msg.chatId) !== String(chatId)) return;
      setMessages((list) => {
        if (list.some((m) => m._id === msg._id)) return list;
        // Our own message can arrive before the send acknowledgement: replace the
        // "Sending..." bubble in place (same key, so it doesn't pop in twice)
        const i = list.findIndex((m) => m.pending && m.senderId === msg.senderId && m.text === msg.text);
        if (i === -1) return [...list, msg];
        const next = [...list];
        next[i] = { ...msg, tempId: list[i].tempId };
        return next;
      });
      if (msg.senderId === otherId) setTyping(false);
    };
    const onTyping = ({ fromUserId }) => {
      if (fromUserId !== otherId) return;
      setTyping(true);
      clearTimeout(typingTimer);
      typingTimer = setTimeout(() => setTyping(false), 3000);
    };
    socket.on("messageReceived", onMessage);
    socket.on("typing", onTyping);
    return () => {
      socket.off("messageReceived", onMessage);
      socket.off("typing", onTyping);
      clearTimeout(typingTimer);
    };
  }, [chatId, otherId]);

  // Keep the view pinned to the newest message unless the user scrolled up
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  const onScroll = () => {
    const el = scroller.current;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const loadOlder = async () => {
    if (!messages.length || loadingOlder) return;
    setLoadingOlder(true);
    const el = scroller.current;
    const prevHeight = el.scrollHeight;
    try {
      const res = await axios.get(`${BASE_URL}/chat/${otherId}?before=${messages[0]._id}`, {
        withCredentials: true,
      });
      stickToBottom.current = false;
      setMessages((list) => [...res.data.data.messages, ...list]);
      setHasMore(res.data.data.hasMore);
      requestAnimationFrame(() => (el.scrollTop = el.scrollHeight - prevHeight));
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load older messages."));
    } finally {
      setLoadingOlder(false);
    }
  };

  const send = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    const tempId = `temp-${Date.now()}`;
    const pending = { _id: tempId, tempId, senderId: me._id, text: body, createdAt: new Date().toISOString(), pending: true };
    stickToBottom.current = true;
    setMessages((list) => [...list, pending]);
    setText("");
    const ack = await getSocket()
      .timeout(8000)
      .emitWithAck("sendMessage", { toUserId: otherId, text: body })
      .catch(() => ({ ok: false, message: "No connection. Message not sent." }));
    // Swap the "Sending..." bubble for the saved message (or mark it failed), in place
    setMessages((list) => {
      if (ack.ok && list.some((m) => m._id === ack.message._id)) {
        return list.filter((m) => m._id !== tempId); // already swapped by the live event
      }
      return list.map((m) =>
        m._id !== tempId
          ? m
          : ack.ok
            ? { ...ack.message, tempId }
            : { ...pending, pending: false, failed: ack.message }
      );
    });
  };

  const onType = (value) => {
    setText(value);
    const now = Date.now();
    if (value && now - lastTypingSent.current > 2000) {
      lastTypingSent.current = now;
      getSocket().emit("typing", { toUserId: otherId });
    }
  };

  const fullName = `${otherUser.firstName} ${otherUser.lastName || ""}`.trim();

  return (
    <section aria-label={`Chat with ${fullName}`} className='surface flex flex-col h-full min-h-0 overflow-hidden'>
      <header className='flex items-center gap-3 px-4 py-3 border-b border-hairline'>
        {onBack && (
          <button type='button' className='btn btn-ghost btn-sm btn-circle md:hidden' aria-label='Back to conversations' onClick={onBack}>
            <BackIcon className='w-4 h-4' />
          </button>
        )}
        <Link to={`/connections/${otherId}`} className='flex items-center gap-3 min-w-0 rounded-xl hover:opacity-80'>
          <Avatar src={otherUser.photoURL} firstName={otherUser.firstName} lastName={otherUser.lastName} className='w-10 h-10' textClass='text-sm' />
          <div className='min-w-0'>
            <p className='font-semibold truncate'>{fullName}</p>
            <p className='text-xs opacity-60 h-4' aria-live='polite'>
              {typing ? "typing..." : "Connection"}
            </p>
          </div>
        </Link>
      </header>

      <div ref={scroller} onScroll={onScroll} className='flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-1.5'>
        {loading ? (
          <div className='m-auto'>
            <span className='loading loading-spinner loading-md text-primary' aria-label='Loading messages'></span>
          </div>
        ) : error && !messages.length ? (
          <div className='m-auto text-center text-sm flex flex-col items-center gap-2'>
            <AlertIcon className='w-6 h-6 text-error' />
            {error}
          </div>
        ) : (
          <>
            {hasMore && (
              <button type='button' className='btn btn-ghost btn-xs self-center mb-2' onClick={loadOlder} disabled={loadingOlder}>
                {loadingOlder ? <span className='loading loading-spinner loading-xs'></span> : "Load older messages"}
              </button>
            )}
            {!messages.length && (
              <div className='m-auto text-center max-w-xs'>
                <p className='font-semibold'>Say hi to {otherUser.firstName}</p>
                <p className='text-sm opacity-60 mt-1'>Ask what they're building, or share a project link.</p>
              </div>
            )}
            <ol className='flex flex-col gap-1.5' aria-live='polite' aria-relevant='additions'>
              <AnimatePresence initial={false}>
                {messages.map((m, i) => {
                  const mine = m.senderId === me._id;
                  const newDay = i === 0 || dayOf(messages[i - 1].createdAt) !== dayOf(m.createdAt);
                  return (
                    <React.Fragment key={m.tempId || m._id}>
                      {newDay && (
                        <li className='self-center text-[11px] font-medium opacity-50 my-2'>{dayOf(m.createdAt)}</li>
                      )}
                      <motion.li
                        layout='position'
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: m.pending ? 0.6 : 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        className={`max-w-[80%] flex flex-col ${mine ? "self-end items-end" : "self-start items-start"}`}>
                        <p
                          className={`px-3.5 py-2 rounded-2xl text-sm whitespace-pre-wrap [overflow-wrap:anywhere] ${
                            mine ? "bg-primary text-primary-content rounded-br-md" : "bg-base-200 rounded-bl-md"
                          } ${m.failed ? "ring-2 ring-error" : ""}`}>
                          {m.text}
                        </p>
                        <span className='text-[10px] opacity-50 mt-0.5 px-1 tabular'>
                          {m.failed ? <span className='text-error'>{m.failed}</span> : m.pending ? "Sending..." : timeOf(m.createdAt)}
                        </span>
                      </motion.li>
                    </React.Fragment>
                  );
                })}
              </AnimatePresence>
            </ol>
            {typing && (
              <div className='self-start bg-base-200 rounded-2xl rounded-bl-md px-3.5 py-2.5 flex gap-1' aria-hidden='true'>
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className='w-1.5 h-1.5 rounded-full bg-current opacity-60'
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <form onSubmit={send} className='flex items-end gap-2 p-3 border-t border-hairline'>
        <label htmlFor='chat-input' className='sr-only'>
          Message {otherUser.firstName}
        </label>
        <textarea
          id='chat-input'
          rows={1}
          maxLength={2000}
          placeholder={`Message ${otherUser.firstName}...`}
          className='textarea flex-1 rounded-2xl min-h-11 max-h-32 resize-none leading-snug focus:outline-1 focus:outline-offset-0 focus:outline-primary'
          value={text}
          onChange={(e) => onType(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) send(e);
          }}
          disabled={loading || Boolean(error && !messages.length)}
        />
        <button type='submit' className='btn btn-primary btn-circle w-11 h-11 shrink-0' aria-label='Send message' disabled={!text.trim()}>
          <SendIcon className='w-4 h-4' />
        </button>
      </form>
    </section>
  );
};

export default ChatWindow;
