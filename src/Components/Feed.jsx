import axios from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform } from "motion/react";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
// Added: appendFeed to add paginated users without replacing existing ones
import { addFeed, appendFeed, removeUserFromFeed, restoreUserToFeed } from "../utils/feedSlice";
import { showToast } from "../utils/toastSlice";
import { getErrorMessage } from "../utils/api";
import UserCard from "./UserCard";
import EmptyState from "./EmptyState";
import { AlertIcon, FlameIcon } from "./Icons";

// Added: number of users fetched per API page
const PAGE_SIZE = 10;
// UI: how far (px, incl. flick velocity) a card must be dragged to count as a choice
const SWIPE_THRESHOLD = 140;

const cardVariants = {
  enter: { opacity: 0, scale: 0.94, y: 18 },
  // x: 0 also brings back a card restored mid-exit after a failed request
  center: {
    opacity: 1,
    scale: 1,
    x: 0,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 28 },
  },
  exit: (dir) => ({
    x: dir * 560,
    opacity: 0,
    transition: { duration: 0.34, ease: [0.4, 0, 0.2, 1] },
  }),
};

// UI: the top card — drag left/right to choose, tilts and shows a stamp while dragging.
// `ref` is forwarded (React 19 prop) so AnimatePresence "popLayout" can measure it.
const SwipeCard = ({ ref, user, onAction }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-260, 260], [-14, 14]);
  const likeOpacity = useTransform(x, [24, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-120, -24], [1, 0]);

  return (
    <motion.div
      ref={ref}
      style={{ x, rotate }}
      drag='x'
      dragSnapToOrigin
      dragElastic={0.85}
      onDragEnd={(e, info) => {
        const swipe = info.offset.x + info.velocity.x * 0.2;
        if (swipe > SWIPE_THRESHOLD) onAction("interested");
        else if (swipe < -SWIPE_THRESHOLD) onAction("ignored");
      }}
      variants={cardVariants}
      initial='enter'
      animate='center'
      exit='exit'
      className='relative w-full max-w-sm mx-auto cursor-grab active:cursor-grabbing'>
      <motion.span
        style={{ opacity: likeOpacity }}
        className='pointer-events-none absolute top-6 left-6 z-10 -rotate-12 rounded-xl border-[3px] border-success px-3 py-1 text-lg font-extrabold uppercase tracking-wider text-success'
        aria-hidden='true'>
        Interested
      </motion.span>
      <motion.span
        style={{ opacity: nopeOpacity }}
        className='pointer-events-none absolute top-6 right-6 z-10 rotate-12 rounded-xl border-[3px] border-error px-3 py-1 text-lg font-extrabold uppercase tracking-wider text-error'
        aria-hidden='true'>
        Ignore
      </motion.span>
      <UserCard user={user} onAction={onAction} />
    </motion.div>
  );
};

const Feed = () => {
  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();
  // Added: pagination state (whether more remain, in-flight guard)
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  // Added: last load error (stops automatic retries until the user retries)
  const [loadError, setLoadError] = useState("");
  // Added: number of Ignore/Interested requests still being sent
  const [inFlight, setInFlight] = useState(0);
  // UI: direction the last card leaves in (-1 left, 1 right)
  const [exitDir, setExitDir] = useState(1);
  const requested = useRef(false);

  // Fixed: always ask for page 1. The backend already hides everyone we have sent a request to,
  // so "page 2" (skip 10) used to skip 10 *new* developers that were never shown.
  const fetchPage = async () => {
    const res = await axios.get(BASE_URL + "/feed?page=1&limit=" + PAGE_SIZE, {
      withCredentials: true,
    });
    return res?.data?.data || [];
  };

  // Initial load: fetch only if the feed hasn't been loaded yet
  const getFeed = useCallback(async () => {
    setLoadError("");
    try {
      const users = await fetchPage();
      dispatch(addFeed(users));
      // Added: if the first page is already short, there are no more users
      setHasMore(users.length === PAGE_SIZE);
    } catch (err) {
      console.error("Error fetching feed:", err);
      setLoadError(getErrorMessage(err, "Couldn't load developers."));
    }
  }, [dispatch]);

  // Added: load more and append when nearing the end of the loaded users
  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    setLoadError("");
    try {
      const users = await fetchPage();
      if (users.length > 0) dispatch(appendFeed(users));
      // Added: fewer than a full page means the API is exhausted, so stop requesting
      if (users.length < PAGE_SIZE) setHasMore(false);
    } catch (err) {
      console.error("Error loading more feed:", err);
      // Fixed: a failed request used to retry in an endless loop
      setLoadError(getErrorMessage(err, "Couldn't load more developers."));
    } finally {
      setLoadingMore(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (feed || requested.current) return;
    requested.current = true;
    getFeed();
  }, [feed, getFeed]);

  // Added: when two or fewer cards remain, fetch more — but only after pending
  // Ignore/Interested requests finish, so the backend doesn't send those users back
  useEffect(() => {
    if (feed && hasMore && !loadingMore && !loadError && inFlight === 0 && feed.length <= 2) {
      loadMore();
    }
  }, [feed, hasMore, loadingMore, loadError, inFlight, loadMore]);

  // Changed: the card leaves immediately (optimistic); if the request fails it comes back
  const sendRequest = async (status) => {
    const target = feed?.[0];
    if (!target) return;
    setExitDir(status === "interested" ? 1 : -1);
    dispatch(removeUserFromFeed(target._id));
    setInFlight((n) => n + 1);
    try {
      await axios.post(
        BASE_URL + "/request/send/" + status + "/" + target._id,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      const message = getErrorMessage(err);
      // A request that already exists is fine — the card stays gone
      if (!/already exists/i.test(message)) {
        dispatch(restoreUserToFeed(target));
        dispatch(showToast(`Couldn't send to ${target.firstName}. ${message}`, "error"));
      }
    } finally {
      setInFlight((n) => n - 1);
    }
  };

  // Added: ← / → keyboard shortcuts for Ignore / Interested
  const sendRef = useRef(sendRequest);
  sendRef.current = sendRequest;
  useEffect(() => {
    const onKey = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.target.closest?.("input, textarea, select, [contenteditable='true'], .dropdown")) return;
      if (e.key === "ArrowLeft") sendRef.current("ignored");
      else if (e.key === "ArrowRight") sendRef.current("interested");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const retry = () => (feed ? loadMore() : getFeed());

  let deck;
  if (!feed) {
    deck = loadError ? (
      <EmptyState
        icon={<AlertIcon className='w-7 h-7' />}
        title="Couldn't load the feed"
        message={loadError}
        actionText='Try again'
        onAction={retry}
      />
    ) : (
      // UI: skeleton card shaped like the real card while the feed is loading
      <div className='surface w-full max-w-sm mx-auto overflow-hidden' aria-label='Loading'>
        <div className='skeleton h-[min(24rem,44dvh)] min-h-56 w-full rounded-none'></div>
        <div className='p-5 flex flex-col gap-3'>
          <div className='skeleton h-4 w-full'></div>
          <div className='skeleton h-4 w-2/3'></div>
          <div className='grid grid-cols-2 gap-3 mt-2'>
            <div className='skeleton h-12 rounded-full'></div>
            <div className='skeleton h-12 rounded-full'></div>
          </div>
        </div>
      </div>
    );
  } else if (feed.length === 0) {
    if (loadError)
      deck = (
        <EmptyState
          icon={<AlertIcon className='w-7 h-7' />}
          title="Couldn't load more developers"
          message={loadError}
          actionText='Try again'
          onAction={retry}
        />
      );
    // Added: still fetching the next page, so show a spinner instead of the empty state
    else if (loadingMore || hasMore || inFlight > 0)
      deck = (
        <div className='flex justify-center py-24'>
          <span className='loading loading-spinner loading-lg text-primary'></span>
        </div>
      );
    // Added: API confirmed there are no more users
    else
      deck = (
        <EmptyState
          icon={<FlameIcon className='w-7 h-7' />}
          title='No more users available'
          message="You've seen everyone for now. Check back later for new developers."
          actionText='View connections'
          actionTo='/connections'
        />
      );
  } else {
    deck = (
      // UI: stacked look when more profiles are waiting behind this one
      <div className='relative w-full max-w-sm mx-auto'>
        <div className='glow-backdrop glow-deck -inset-x-2 sm:-inset-x-6 -bottom-6 top-10' aria-hidden='true'></div>
        {feed.length > 1 && (
          <>
            <div
              className='absolute inset-x-8 -bottom-5 h-full rounded-3xl surface opacity-50'
              aria-hidden='true'></div>
            <div
              className='absolute inset-x-4 -bottom-2.5 h-full rounded-3xl surface opacity-80'
              aria-hidden='true'></div>
          </>
        )}
        <AnimatePresence mode='popLayout' initial={false} custom={exitDir}>
          <SwipeCard key={feed[0]._id} user={feed[0]} onAction={sendRequest} />
        </AnimatePresence>
      </div>
    );
  }

  return (
    // Changed: the deck stands alone, centered (profile / request tiles were removed from the feed)
    <section aria-label='Discover developers' className='max-w-sm mx-auto flex flex-col'>
      <div className='mb-4 sm:mb-6 text-center'>
        <h1 className='text-3xl sm:text-4xl font-bold tracking-tight'>
          <span className='text-gradient'>Discover</span>
        </h1>
        <p className='text-sm opacity-70 mt-1 max-w-xs sm:max-w-none mx-auto'>
          Developers you haven't met yet. Swipe right to connect.
          <span className='hidden md:inline'> Or use the ← → keys.</span>
        </p>
      </div>
      <div className='pb-6'>{deck}</div>
      {/* Changed: show a loading hint while the next page is fetched (was the misleading "X left" count) */}
      {feed?.length > 0 && loadingMore && (
        <p className='text-xs opacity-60 mt-4 flex items-center justify-center gap-2'>
          <span className='loading loading-spinner loading-xs'></span>
          Loading more developers...
        </p>
      )}
      {feed?.length > 0 && loadError && (
        <p className='text-xs mt-4 flex items-center justify-center gap-2 text-error'>
          Couldn't load more developers.
          <button type='button' className='link font-medium' onClick={retry}>
            Try again
          </button>
        </p>
      )}
    </section>
  );
};
export default Feed;
