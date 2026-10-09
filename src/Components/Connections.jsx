import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "motion/react";
import { fetchConnections, getErrorMessage } from "../utils/api";
import { showToast } from "../utils/toastSlice";
import PageHeader from "./PageHeader";
import EmptyState from "./EmptyState";
import Avatar from "./Avatar";
import ProfileLinks from "./ProfileLinks";
import SkillChips from "./SkillChips";
import { AlertIcon, ArrowRightIcon, SearchIcon, UsersIcon } from "./Icons";

const Connections = () => {
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();
  const [error, setError] = useState("");
  // Added: filter connections by name or skill
  const [query, setQuery] = useState("");
  const requested = useRef(false);

  // Changed: cached connections show instantly while a fresh copy loads in the background
  const loadConnections = useCallback(async () => {
    setError("");
    try {
      await fetchConnections(dispatch);
    } catch (err) {
      console.error("Error fetching connections:", err);
      const message = getErrorMessage(err, "Couldn't load your connections.");
      // Fixed: a failed request used to show "No Connections Found"
      setError(message);
    }
  }, [dispatch]);

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;
    loadConnections();
  }, [loadConnections]);

  // Cached list shown but the refresh failed: tell the user once, keep the list
  useEffect(() => {
    if (error && connections) dispatch(showToast(error, "error"));
  }, [error, connections, dispatch]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !connections) return connections || [];
    return connections.filter((c) =>
      [c.firstName, c.lastName, ...(c.skills || [])]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(q))
    );
  }, [connections, query]);

  // UI: skeleton cards while connections are loading (avoids flashing the empty state)
  if (!connections && !error) {
    return (
      <div className='max-w-5xl mx-auto'>
        <PageHeader title='Connections' />
        <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
          {[1, 2, 3].map((n) => (
            <div key={n} className='bento-tile'>
              <div className='flex items-center gap-4'>
                <div className='skeleton w-16 h-16 rounded-2xl shrink-0'></div>
                <div className='flex-1 flex flex-col gap-2'>
                  <div className='skeleton h-5 w-2/3'></div>
                  <div className='skeleton h-4 w-1/3'></div>
                </div>
              </div>
              <div className='skeleton h-4 w-full'></div>
              <div className='skeleton h-4 w-4/5'></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!connections) {
    return (
      <div className='max-w-5xl mx-auto'>
        <PageHeader title='Connections' />
        <EmptyState
          icon={<AlertIcon className='w-7 h-7' />}
          title="Couldn't load your connections"
          message={error}
          actionText='Try again'
          onAction={loadConnections}
        />
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className='max-w-5xl mx-auto'>
        <PageHeader title='Connections' />
        <EmptyState
          icon={<UsersIcon className='w-7 h-7' />}
          title='No connections yet'
          message='Start exploring the feed and connect with other developers.'
          actionText='Go to feed'
          actionTo='/'
        />
      </div>
    );
  }

  return (
    <div className='max-w-5xl mx-auto'>
      <PageHeader
        title='Connections'
        subtitle={`${connections.length} ${
          connections.length === 1 ? "connection" : "connections"
        }`}>
        <label className='input liquid-glass border-0 rounded-full w-full sm:w-72 flex items-center gap-2'>
          <SearchIcon className='w-4 h-4 opacity-50 shrink-0' />
          <input
            type='search'
            placeholder='Search name or skill'
            aria-label='Search connections'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className='grow min-w-0'
          />
        </label>
      </PageHeader>

      {filtered.length === 0 && (
        <p className='text-sm opacity-60 text-center py-12'>
          No connections match "{query.trim()}".
        </p>
      )}

      {/* UI: responsive grid of tiles; cards keep their natural height */}
      <motion.ul layout className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3 items-start'>
        <AnimatePresence initial={true}>
          {filtered.map((connection, i) => {
            const meta = [connection.age, connection.gender].filter(Boolean).join(" · ");
            return (
              <motion.li
                key={connection._id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: Math.min(i, 8) * 0.05, type: "spring", stiffness: 260, damping: 26 },
                }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                className='bento-tile surface-hover min-w-0 relative group'>
                {/* Added: the whole card opens this connection's profile (stretched link) */}
                <Link
                  to={`/connections/${connection._id}`}
                  className='absolute inset-0 z-[1] rounded-3xl'
                  aria-label={`View ${connection.firstName}'s profile`}
                />
                <div className='flex items-center gap-4 min-w-0'>
                  <Avatar
                    src={connection.photoURL}
                    firstName={connection.firstName}
                    lastName={connection.lastName}
                    rounded='rounded-2xl'
                    className='w-16 h-16'
                    textClass='text-xl'
                  />
                  <div className='min-w-0 text-left'>
                    <h2 className='text-lg font-semibold leading-snug [overflow-wrap:anywhere]'>
                      {connection.firstName} {connection.lastName}
                    </h2>
                    {meta && <p className='text-sm opacity-60 capitalize tabular'>{meta}</p>}
                  </div>
                </div>
                {connection.about && (
                  <p className='text-sm opacity-80 line-clamp-3 text-left [overflow-wrap:anywhere]'>
                    {connection.about}
                  </p>
                )}

                <SkillChips skills={connection.skills} />
                <div className='flex items-center justify-between gap-3 mt-auto pt-1'>
                  <ProfileLinks portfolioUrl={connection.portfolioUrl} githubUrl={connection.githubUrl} />
                  <span className='ml-auto text-xs font-medium text-primary inline-flex items-center gap-1 opacity-70 transition-all group-hover:opacity-100 group-hover:translate-x-0.5'>
                    View profile
                    <ArrowRightIcon className='w-3.5 h-3.5' />
                  </span>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
};

export default Connections;
