import axios from "axios";
import React from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { addFeed } from "../utils/feedSlice";
import UserCard from "./UserCard";
import EmptyState from "./EmptyState";
import { FlameIcon } from "./Icons";

const Feed = () => {
  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();

  const getFeed = async () => {
    if (feed) return;
    try {
      const res = await axios.get(BASE_URL + "/feed", {
        withCredentials: true,
      });
      dispatch(addFeed(res?.data?.data));
    } catch (err) {
      console.error("Error fetching feed:", err);
    }
  };

  useEffect(() => {
    getFeed();
  }, []);
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

  if (feed.length <= 0)
    return (
      <div className='my-10'>
        <EmptyState
          icon={<FlameIcon className='w-7 h-7' />}
          title='No new users found!'
          message="You've seen everyone for now. Check back later for new developers."
          actionText='View connections'
          actionTo='/connections'
        />
      </div>
    );

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
        <p className='text-xs opacity-60 mt-8'>
          {feed.length} {feed.length === 1 ? "profile" : "profiles"} left
        </p>
      </div>
    )
  );
};
export default Feed;
