import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Avatar from "./Avatar";
import { ChatIcon, InboxIcon, UsersIcon } from "./Icons";

const SHOWN = 6;

// Added: side panel on the feed — pending requests, unread chats and your connections
const NetworkRail = () => {
  const connections = useSelector((store) => store.connections);
  const pending = useSelector((store) => store.requests?.length || 0);
  const unreadMap = useSelector((store) => store.chat.unread);
  const unread = Object.values(unreadMap).reduce((a, b) => a + b, 0);

  // People with unread messages come first
  const list = [...(connections || [])]
    .sort((a, b) => (unreadMap[b._id] || 0) - (unreadMap[a._id] || 0))
    .slice(0, SHOWN);

  const rows = [
    { to: "/requests", Icon: InboxIcon, label: "Connection requests", value: pending },
    { to: "/messages", Icon: ChatIcon, label: "Unread messages", value: unread },
  ];

  return (
    <section aria-labelledby='network-title' className='surface p-4 flex flex-col gap-4 min-w-0'>
      <ul className='flex flex-col -mx-1'>
        {rows.map(({ to, Icon, label, value }) => (
          <li key={to}>
            <Link
              to={to}
              className='flex items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-base-200 transition-colors'>
              <Icon className='w-4 h-4 opacity-60' />
              <span className='flex-1'>{label}</span>
              <span
                className={`tabular min-w-6 text-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                  value > 0 ? "bg-primary text-primary-content" : "bg-base-200 opacity-70"
                }`}>
                {value}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className='flex flex-col gap-2 border-t border-hairline pt-4'>
        <div className='flex items-baseline justify-between gap-2'>
          <h2 id='network-title' className='flex items-center gap-2 text-sm font-semibold'>
            <UsersIcon className='w-4 h-4 text-primary' />
            Your connections
          </h2>
          {connections?.length > 0 && <span className='text-xs opacity-60 tabular'>{connections.length}</span>}
        </div>

        {!connections ? (
          <div className='flex flex-col gap-2' aria-label='Loading'>
            {[1, 2, 3].map((n) => (
              <div key={n} className='flex items-center gap-3'>
                <div className='skeleton w-9 h-9 rounded-full shrink-0'></div>
                <div className='skeleton h-3.5 flex-1'></div>
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <p className='text-sm opacity-70'>
            When someone accepts your request, they show up here. Swipe right on a developer to send one.
          </p>
        ) : (
          <ul className='flex flex-col -mx-1'>
            {list.map((c) => {
              const count = unreadMap[c._id] || 0;
              return (
                <li key={c._id} className='flex items-center gap-1 rounded-lg hover:bg-base-200 transition-colors'>
                  <Link to={`/connections/${c._id}`} className='flex flex-1 min-w-0 items-center gap-3 px-2 py-1.5'>
                    <Avatar src={c.photoURL} firstName={c.firstName} lastName={c.lastName} className='w-9 h-9' textClass='text-xs' />
                    <span className='min-w-0'>
                      <span className='block text-sm font-medium truncate'>
                        {c.firstName} {c.lastName}
                      </span>
                      {c.skills?.length > 0 && (
                        <span className='block text-xs opacity-60 truncate'>{c.skills.slice(0, 2).join(", ")}</span>
                      )}
                    </span>
                  </Link>
                  <Link
                    to={`/messages/${c._id}`}
                    className='relative btn btn-ghost btn-sm btn-square rounded-lg mr-1'
                    aria-label={`Message ${c.firstName}${count ? `, ${count} unread` : ""}`}>
                    <ChatIcon className='w-4 h-4' />
                    {count > 0 && (
                      <span className='absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-primary text-primary-content text-[10px] font-bold leading-4 tabular'>
                        {count}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {connections?.length > 0 && (
          <Link to='/connections' className='link link-hover text-sm font-medium text-primary self-start mt-1'>
            {connections.length > SHOWN ? `See all ${connections.length} connections` : "Open connections"}
          </Link>
        )}
      </div>
    </section>
  );
};

export default NetworkRail;
