import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
// Added: appendFeed to add paginated users without replacing existing ones
import { addFeed, appendFeed } from "../utils/feedSlice";
import UserCard from "./UserCard";
import EmptyState from "./EmptyState";
import { FlameIcon } from "./Icons";

// Added: number of users fetched per API page
const PAGE_SIZE = 10;

const Feed = () => {
  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();
  // Added: pagination state (last loaded page, whether more remain, in-flight guard)
  const pageRef = useRef(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Added: fetch a single page of feed users from the API
  const fetchPage = async (page) => {
    const res = await axios.get(
      BASE_URL + "/feed?page=" + page + "&limit=" + PAGE_SIZE,
      { withCredentials: true }
    );
    return res?.data?.data || [];
  };

  // Initial load: fetch page 1 only if the feed hasn't been loaded yet
  const getFeed = async () => {
    if (feed) return;
    try {
      const users = await fetchPage(1);
      pageRef.current = 1;
      dispatch(addFeed(users));
      // Added: if the first page is already short, there are no more users
      setHasMore(users.length === PAGE_SIZE);
    } catch (err) {
      console.error("Error fetching feed:", err);
    }
  };

  // Added: load the next page and append it when nearing the end of the loaded users
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = pageRef.current + 1;
      const users = await fetchPage(nextPage);
      pageRef.current = nextPage;
      if (users.length > 0) dispatch(appendFeed(users));
      // Added: fewer than a full page means the API is exhausted, so stop requesting
      if (users.length < PAGE_SIZE) setHasMore(false);
    } catch (err) {
      console.error("Error loading more feed:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    getFeed();
  }, []);

  // Added: when the user reaches the second-last card, request the next 10 users
  useEffect(() => {
    if (feed && hasMore && !loadingMore && feed.length <= 2) {
      loadMore();
    }
  }, [feed?.length, hasMore, loadingMore]);

  // UI: skeleton card while the feed is loading (was: render nothing)
  if (!feed)
    return (
      <div className='flex justify-center my-10'>
        <div className='card bg-base-300 w-full max-w-sm shadow-xl'>
          <div className='skeleton h-80 w-full rounded-b-none'></div>
          <div className='card-body gap-3'>
            <div className='skeleton h-6 w-2/3'></div>
            <div className='skeleton h-4 w-1/3'></div>
            <div className='skeleton h-4 w-full'></div>
            <div className='flex justify-center gap-4 mt-4'>
              <div className='skeleton h-12 w-32'></div>
              <div className='skeleton h-12 w-32'></div>
            </div>
          </div>
        </div>
      </div>
    );

  if (feed.length <= 0) {
    // Added: still fetching the next page, so show a spinner instead of the empty state
    if (loadingMore || hasMore)
      return (
        <div className='flex justify-center my-20'>
          <span className='loading loading-spinner loading-lg text-primary'></span>
        </div>
      );
    // Added: API confirmed there are no more users
    return (
      <div className='my-10'>
        <EmptyState
          icon={<FlameIcon className='w-7 h-7' />}
          title='No more users available'
          message="You've seen everyone for now. Check back later for new developers."
          actionText='View connections'
          actionTo='/connections'
        />
      </div>
    );
  }

  return (
    feed && (
      <div className='flex flex-col items-center my-10'>
        {/* UI: stacked look when more profiles are waiting behind this one */}
        <div className='relative w-full max-w-sm'>
          {feed.length > 1 && (
            <>
              <div className='absolute inset-x-6 -bottom-4 h-full rounded-box bg-base-300 opacity-40 shadow'></div>
              <div className='absolute inset-x-3 -bottom-2 h-full rounded-box bg-base-300 opacity-70 shadow'></div>
            </>
          )}
          {/* UI: key re-mounts the card so each new profile animates in */}
          <div key={feed[0]._id} className='relative animate-card-in'>
            <UserCard user={feed[0]} />
          </div>
        </div>
        {/* Changed: show a loading hint while the next page is fetched (was the misleading "X left" count) */}
        {loadingMore && (
          <p className='text-xs opacity-60 mt-8 flex items-center gap-2'>
            <span className='loading loading-spinner loading-xs'></span>
            Loading more developers...
          </p>
        )}
      </div>
    )
  );
};
export default Feed;
