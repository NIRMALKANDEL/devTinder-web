import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "motion/react";
import { BASE_URL } from "../utils/constants";
import { fetchConnections, getErrorMessage } from "../utils/api";
import Avatar from "./Avatar";
import ChatWindow from "./ChatWindow";
import EmptyState from "./EmptyState";
import PageHeader from "./PageHeader";
import { AlertIcon, ChatIcon, UsersIcon } from "./Icons";

const shortTime = (date) => {
  const d = new Date(date);
  return d.toDateString() === new Date().toDateString()
    ? d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString([], { day: "numeric", month: "short" });
};

// Added: chat inbox. Desktop shows the list and the open chat side by side; phones
// show one at a time (/messages = list, /messages/:userId = chat).
const Messages = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const me = useSelector((store) => store.user);
  const connections = useSelector((store) => store.connections);
  const unread = useSelector((store) => store.chat.unread);
  const lastMessage = useSelector((store) => store.chat.lastMessage);
  const [chats, setChats] = useState(null);
  const [error, setError] = useState("");

  const loadChats = useCallback(async () => {
    setError("");
    try {
      const res = await axios.get(`${BASE_URL}/chats`, { withCredentials: true });
      setChats(res.data.data);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load your conversations."));
    }
  }, []);

  useEffect(() => {
    loadChats();
    if (!connections) fetchConnections(dispatch).catch(() => {});
  }, [loadChats, connections, dispatch]);

  // A new message (from anyone) moves that conversation to the top
  useEffect(() => {
    if (lastMessage) loadChats();
  }, [lastMessage, loadChats]);

  const chatUsers = (chats || []).map((c) => c.user);
  const startable = (connections || []).filter((c) => !chatUsers.some((u) => u._id === c._id));
  const otherUser =
    userId && (chatUsers.find((u) => u._id === userId) || (connections || []).find((u) => u._id === userId));

  const list = (
    <div className='surface flex flex-col min-h-0 h-full overflow-hidden'>
      <div className='px-4 pt-4 pb-2'>
        <p className='tile-label'>Conversations</p>
      </div>
      <div className='flex-1 min-h-0 overflow-y-auto px-2 pb-2'>
        {error ? (
          <div className='p-4 text-sm text-center flex flex-col items-center gap-2'>
            <AlertIcon className='w-5 h-5 text-error' />
            {error}
            <button type='button' className='btn btn-sm btn-ghost' onClick={loadChats}>
              Try again
            </button>
          </div>
        ) : !chats ? (
          <ul className='flex flex-col gap-2 p-2' aria-label='Loading'>
            {[0, 1, 2].map((i) => (
              <li key={i} className='flex items-center gap-3'>
                <div className='skeleton w-11 h-11 rounded-full'></div>
                <div className='flex-1 flex flex-col gap-2'>
                  <div className='skeleton h-3 w-1/2'></div>
                  <div className='skeleton h-3 w-3/4'></div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <ul className='flex flex-col gap-0.5'>
            {chats.map((c, i) => {
              const count = unread[c.user._id] || 0;
              const active = c.user._id === userId;
              const fromMe = c.lastMessage?.senderId === me._id;
              return (
                <motion.li
                  key={c._id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}>
                  <Link
                    to={`/messages/${c.user._id}`}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors ${
                      active ? "tint-primary" : "hover:bg-base-200"
                    }`}>
                    <Avatar src={c.user.photoURL} firstName={c.user.firstName} lastName={c.user.lastName} className='w-11 h-11' textClass='text-sm' />
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-baseline gap-2'>
                        <p className={`truncate flex-1 ${count ? "font-bold" : "font-semibold"}`}>
                          {c.user.firstName} {c.user.lastName}
                        </p>
                        <span className='text-[11px] opacity-50 shrink-0 tabular'>{shortTime(c.lastMessage.createdAt)}</span>
                      </div>
                      <p className={`text-sm truncate ${count ? "font-medium" : "opacity-60"}`}>
                        {fromMe && "You: "}
                        {c.lastMessage.text}
                      </p>
                    </div>
                    {count > 0 && (
                      <span className='badge badge-primary badge-sm tabular' aria-label={`${count} unread`}>
                        {count}
                      </span>
                    )}
                  </Link>
                </motion.li>
              );
            })}
            {chats.length === 0 && (
              <li className='p-4 text-sm opacity-60 text-center'>No conversations yet.</li>
            )}
          </ul>
        )}

        {startable.length > 0 && (
          <div className='px-2.5 pt-4'>
            <p className='tile-label mb-2'>Start a chat</p>
            <ul className='flex flex-wrap gap-2'>
              {startable.slice(0, 12).map((u) => (
                <li key={u._id}>
                  <Link to={`/messages/${u._id}`} className='flex flex-col items-center gap-1 w-16 group' title={`${u.firstName} ${u.lastName || ""}`}>
                    <Avatar src={u.photoURL} firstName={u.firstName} lastName={u.lastName} className='w-12 h-12 transition-transform group-hover:scale-105' textClass='text-sm' />
                    <span className='text-[11px] truncate w-full text-center'>{u.firstName}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  // No connections and no chats: nothing to talk about yet
  if (chats && connections && chats.length === 0 && connections.length === 0) {
    return (
      <div className='py-10'>
        <EmptyState
          icon={<ChatIcon className='w-7 h-7' />}
          title='No one to chat with yet'
          message='Chat opens up once someone accepts your request (or you accept theirs).'
          actionText='Discover developers'
          actionTo='/'
        />
      </div>
    );
  }

  return (
    <div className='flex flex-col'>
      <div className={userId ? "hidden md:block" : ""}>
        <PageHeader title='Messages' subtitle='Chat with your connections in real time' />
      </div>
      <div className='grid md:grid-cols-[20rem_1fr] gap-4 h-[calc(100dvh-13rem)] md:h-[calc(100dvh-15rem)] min-h-[26rem]'>
        <div className={`min-h-0 ${userId ? "hidden md:block" : ""}`}>{list}</div>
        <div className={`min-h-0 ${userId ? "" : "hidden md:block"}`}>
          {userId && otherUser ? (
            <ChatWindow key={userId} otherUser={otherUser} onBack={() => navigate("/messages")} />
          ) : userId && chats && connections ? (
            <div className='surface h-full flex items-center justify-center p-6'>
              <EmptyState
                icon={<UsersIcon className='w-7 h-7' />}
                title="You can't chat with this person"
                message='Chat is only open between connections.'
                actionText='Back to messages'
                actionTo='/messages'
              />
            </div>
          ) : userId ? (
            <div className='surface h-full flex items-center justify-center'>
              <span className='loading loading-spinner loading-md text-primary'></span>
            </div>
          ) : (
            <div className='surface h-full flex flex-col items-center justify-center text-center p-8'>
              <div className='w-14 h-14 rounded-2xl tint-primary text-primary flex items-center justify-center mb-4'>
                <ChatIcon className='w-7 h-7' />
              </div>
              <p className='font-semibold text-lg'>Pick a conversation</p>
              <p className='text-sm opacity-60 mt-1 max-w-xs'>Choose someone on the left, or start a new chat with one of your connections.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
